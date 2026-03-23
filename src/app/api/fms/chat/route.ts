import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { buildSystemPrompt } from "@/lib/fms/chat-prompts";
import { chatTools, handleToolCall } from "@/lib/fms/chat-tools";

// OpenAI 동적 import (빌드 시 API 키 없어도 에러 안 나게)
async function callOpenAI(
  messages: { role: string; content: string }[],
  tools?: unknown[]
): Promise<{ content: string | null; toolCalls: any[] | null }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { content: "AI 서비스가 아직 설정되지 않았습니다.", toolCalls: null };
  }

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  const params: any = {
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  };
  if (tools && tools.length > 0) params.tools = tools;

  const response = await openai.chat.completions.create(params);
  const choice = response.choices[0];

  return {
    content: choice?.message?.content || null,
    toolCalls: choice?.message?.tool_calls || null,
  };
}

// POST: 메시지 전송 + AI 응답 (Function Calling 포함)
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

    // 2. 최근 히스토리 조회
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const history = await supabaseSelect<any[]>(
      "chat_messages",
      `user_id=eq.${user.userId}&created_at=gte.${oneDayAgo}&order=created_at.desc&limit=20`
    );
    const sortedHistory = (history || []).reverse();

    // 3. 시스템 프롬프트
    let storeName: string | null = null;
    if (user.storeId) {
      const stores = await supabaseSelect<any[]>("stores", `id=eq.${user.storeId}&limit=1`);
      storeName = stores?.[0]?.name || null;
    }
    const systemPrompt = buildSystemPrompt({ name: user.name, role: user.role, storeName });

    // 4. 메시지 구성
    const aiMessages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...sortedHistory
        .filter((m: any) => m.role === "user" || m.role === "assistant")
        .map((m: any) => ({ role: m.role, content: m.content })),
    ];
    const lastMsg = aiMessages[aiMessages.length - 1];
    if (!lastMsg || lastMsg.content !== message.trim()) {
      aiMessages.push({ role: "user", content: message.trim() });
    }

    // 5. OpenAI 호출 (Function Calling 포함)
    let aiResponse: string;
    let msgType = "general";

    try {
      const result = await callOpenAI(aiMessages, chatTools);

      if (result.toolCalls && result.toolCalls.length > 0) {
        // Function Calling 처리
        const toolCall = result.toolCalls[0];
        const toolArgs = JSON.parse(toolCall.function.arguments);
        const toolResult = await handleToolCall(
          toolCall.function.name,
          toolArgs,
          user.userId,
          user.storeId
        );

        // 함수 결과를 다시 OpenAI에 전달
        const followUp = await callOpenAI([
          ...aiMessages,
          { role: "assistant", content: "" },
          { role: "tool" as any, content: toolResult },
        ]);

        aiResponse = followUp.content || "처리가 완료되었습니다.";
        msgType = "order";
      } else {
        aiResponse = result.content || "응답을 생성할 수 없습니다.";
      }
    } catch (err) {
      console.error("[FMS Chat] OpenAI 오류:", err);
      aiResponse = "죄송합니다. 일시적으로 응답할 수 없습니다.";
    }

    // 6. AI 응답 저장
    const saved = await supabaseInsert("chat_messages", {
      user_id: user.userId,
      store_id: user.storeId || null,
      role: "assistant",
      content: aiResponse,
      msg_type: msgType,
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
