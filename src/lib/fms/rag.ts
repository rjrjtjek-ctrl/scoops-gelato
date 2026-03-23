// RAG 전용 — supabaseSelect 대신 직접 fetch 사용 (안정성)

export interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
}

// 키워드 기반 관련 지식 검색 — 개선 버전
export async function findRelevantKnowledge(query: string, limit: number = 3): Promise<KnowledgeItem[]> {
  try {
    // 불용어 제거 + 핵심 키워드 추출 (2글자 이상)
    const stopWords = new Set(["어떻게", "해야", "하나요", "무엇", "언제", "어디", "왜", "있나요", "인가요", "인데", "거야", "건가요", "하면", "되나요", "해요", "할까요", "나요"]);
    const keywords = query
      .replace(/[?!.,。？！、~\-]/g, "")
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !stopWords.has(w));

    if (keywords.length === 0) return [];

    console.log("[RAG] Query:", query, "→ Keywords:", keywords);

    // 모든 지식 가져와서 클라이언트에서 매칭 — 직접 fetch 사용 (supabaseSelect 우회)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

    let allKnowledge: any[] = [];
    const fetchUrl = `${SUPABASE_URL}/rest/v1/knowledge_base?limit=200&select=id,category,title,content,tags`;
    console.log("[RAG] Fetching:", fetchUrl.substring(0, 80), "KEY len:", SUPABASE_KEY.length);

    try {
      const res = await fetch(fetchUrl, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      console.log("[RAG] Fetch status:", res.status);
      if (res.ok) {
        const raw = await res.json();
        console.log("[RAG] Raw items:", Array.isArray(raw) ? raw.length : "not array");
        allKnowledge = (raw || []).filter((k: any) => k.category !== "차단");
      } else {
        const errText = await res.text();
        console.error("[RAG] Supabase fetch failed:", res.status, errText.substring(0, 200));
      }
    } catch (fetchErr: any) {
      console.error("[RAG] Fetch error:", fetchErr?.message || String(fetchErr));
    }

    if (!allKnowledge || allKnowledge.length === 0) {
      console.log("[RAG] No knowledge data found");
      return [];
    }

    console.log("[RAG] Total knowledge items:", allKnowledge.length);

    // 각 지식 항목에 대해 키워드 매칭 점수 계산
    const scored = allKnowledge.map((item: any) => {
      let score = 0;
      const titleLower = (item.title || "").toLowerCase();
      const contentLower = (item.content || "").toLowerCase();

      for (const kw of keywords) {
        const kwLower = kw.toLowerCase();
        if (titleLower.includes(kwLower)) score += 3; // 제목 매칭은 가중치 높게
        if (contentLower.includes(kwLower)) score += 1; // 내용 매칭
      }

      return { item, score };
    });

    // 점수 > 0인 항목만 정렬
    const matched = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    console.log("[RAG] Matched:", matched.length, "items. Top scores:", matched.map(m => `${m.item.title.substring(0, 20)}(${m.score})`).join(", "));

    return matched.map(m => ({
      id: m.item.id,
      category: m.item.category,
      title: m.item.title,
      content: m.item.content,
      tags: m.item.tags || [],
    }));
  } catch (err) {
    console.error("[RAG] Error:", err);
    return [];
  }
}

// 차단 키워드 조회
export async function getBlockedKeywords(): Promise<string[]> {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";
    const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_base?category=eq.%EC%B0%A8%EB%8B%A8&select=title`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const blocked = await res.json();
    return (blocked || []).map((b: any) => b.title);
  } catch {
    return [];
  }
}
