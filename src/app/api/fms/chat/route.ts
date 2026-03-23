import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { buildSystemPrompt } from "@/lib/fms/chat-prompts";
import { chatTools, handleToolCall } from "@/lib/fms/chat-tools";
import { findRelevantKnowledge, getBlockedKeywords } from "@/lib/fms/rag";

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
    let systemPrompt = buildSystemPrompt({ name: user.name, role: user.role, storeName });

    // 3-1. RAG: 관련 지식 검색 — 인라인 실행
    let ragError = "";
    let ragCount = 0;
    let ragFetchStatus = 0;
    try {
      const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

      if (SB_URL && SB_KEY) {
        // Supabase PostgREST ilike로 서버 사이드 검색 — 한글 인코딩 문제 우회
        const userWords = message.trim().replace(/[?!.,]/g, "").split(/\s+/).filter((w: string) => w.length >= 2);
        // 핵심 단어 3개만 사용
        const searchWords = userWords.slice(0, 3);

        const allMatches: any[] = [];
        for (const word of searchWords) {
          const encoded = encodeURIComponent(word);
          const searchUrl = `${SB_URL}/rest/v1/knowledge_base?or=(title.ilike.*${encoded}*,content.ilike.*${encoded}*)&limit=5&select=id,category,title,content`;
          const ragRes = await fetch(searchUrl, {
            headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
          });
          if (ragRes.ok) {
            const items = await ragRes.json();
            if (Array.isArray(items)) allMatches.push(...items);
          }
        }

        // 중복 제거 + 빈도순 정렬
        const countMap = new Map<string, { item: any; count: number }>();
        for (const item of allMatches) {
          const existing = countMap.get(item.id);
          if (existing) existing.count++;
          else countMap.set(item.id, { item, count: 1 });
        }
        const matched = [...countMap.values()].sort((a, b) => b.count - a.count).slice(0, 3);
        ragCount = matched.length;
        ragFetchStatus = allMatches.length;

        if (matched.length > 0) {
          systemPrompt += "\n\n[중요 — 반드시 아래 지식을 기반으로 답변하세요]\n아래는 스쿱스젤라또 대표님이 직접 작성한 공식 답변입니다.\n반드시 이 내용을 중심으로 답변하세요. 일반 지식이 아닌 아래 내용을 사용해야 합니다.\n\n";
          matched.forEach((m) => {
            systemPrompt += `---\n[${m.item.category}] ${m.item.title}\n${m.item.content}\n`;
          });
          systemPrompt += "---\n위 내용을 반드시 반영하여 답변하세요.\n";
        }
      } else {
        ragError = "SB_URL or SB_KEY missing";
      }
    } catch (ragErr: any) {
      ragError = ragErr?.message || String(ragErr);
    }

    // 4. 메시지 구성
    const aiMessages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...sortedHistory
        .filter((m: any) => (m.role === "user" || m.role === "assistant") && m.content && m.content.trim())
        .map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];
    const lastMsg = aiMessages[aiMessages.length - 1];
    if (!lastMsg || lastMsg.content !== message.trim()) {
      aiMessages.push({ role: "user", content: message.trim() });
    }

    // RAG 디버그 — 응답 헤더에 포함
    // RAG 상태 (디버그 — 안정화 후 제거 가능)

    // 5. OpenAI 호출
    // 지식베이스에서 답변을 찾았으면 도구 호출 없이 순수 대화
    // 지식베이스 결과가 없을 때만 Function Calling 도구 포함
    const hasKnowledge = systemPrompt.includes("[중요 — 반드시 아래 지식을 기반으로 답변하세요]");
    let aiResponse: string;
    let msgType = "general";

    try {
      const result = await callOpenAI(aiMessages, hasKnowledge ? undefined : chatTools);

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

        // 함수 결과를 포함하여 일반 메시지로 다시 OpenAI에 전달
        const followUp = await callOpenAI([
          ...aiMessages,
          { role: "user", content: `[시스템] 함수 실행 결과: ${toolResult}\n\n위 결과를 바탕으로 사용자에게 친절하게 한국어로 답변해주세요.` },
        ]);

        aiResponse = followUp.content || "처리가 완료되었습니다.";
        msgType = "order";
      } else {
        aiResponse = result.content || "응답을 생성할 수 없습니다.";
      }
    } catch (err: any) {
      console.error("[FMS Chat] OpenAI 오류:", err);
      const errMsg = err?.message || err?.toString() || "unknown";
      aiResponse = `죄송합니다. 오류: ${errMsg.substring(0, 200)}`;
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
      _rag: ragCount, // 지식베이스 매칭 수
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
