import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { chatCompletion } from "@/lib/fms/openai";
import { buildSystemPrompt } from "@/lib/fms/chat-prompts";

// POST: 메시지 전송 + AI 응답
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
    }

    // 1. 사용자 메시지 저장
    await supabaseInsert("chat_messages", {
      user_id: user.userId,
      store_id: user.storeId || null,
      role: "user",
      content: message.trim(),
      msg_type: "general",
    });

    // 2. 최근 히스토리 조회 (최대 20개, 24시간 이내)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const history = await supabaseSelect<any[]>(
      "chat_messages",
      `user_id=eq.${user.userId}&created_at=gte.${oneDayAgo}&order=created_at.desc&limit=20`
    );

    // 역순으로 정렬 (오래된 것부터)
    const sortedHistory = (history || []).reverse();

    // 3. 시스템 프롬프트 구성
    // 매장명 조회
    let storeName: string | null = null;
    if (user.storeId) {
      const stores = await supabaseSelect<any[]>("stores", `id=eq.${user.storeId}&limit=1`);
      storeName = stores?.[0]?.name || null;
    }

    const systemPrompt = buildSystemPrompt({
      name: user.name,
      role: user.role,
      storeName,
    });

    // 4. OpenAI API 호출
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...sortedHistory
        .filter((m: any) => m.role === "user" || m.role === "assistant")
        .map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    // 현재 메시지가 히스토리에 이미 포함되었을 수 있으므로 중복 방지
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.content !== message.trim()) {
      messages.push({ role: "user", content: message.trim() });
    }

    let aiResponse: string;
    try {
      aiResponse = await chatCompletion(messages);
    } catch (err) {
      console.error("[FMS Chat] OpenAI 오류:", err);
      aiResponse = "죄송합니다. 일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해주세요.";
    }

    // 5. AI 응답 저장
    const saved = await supabaseInsert("chat_messages", {
      user_id: user.userId,
      store_id: user.storeId || null,
      role: "assistant",
      content: aiResponse,
      msg_type: "general",
    });

    const savedMsg = Array.isArray(saved) ? saved[0] : saved;

    return NextResponse.json({
      message: {
        id: savedMsg?.id || "",
        role: "assistant",
        content: aiResponse,
        createdAt: savedMsg?.created_at || new Date().toISOString(),
      },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
