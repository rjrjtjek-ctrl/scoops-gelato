import { supabaseSelect } from "@/lib/supabase-client";

export interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
}

// 키워드 기반 관련 지식 검색
export async function findRelevantKnowledge(query: string, limit: number = 3): Promise<KnowledgeItem[]> {
  try {
    // 질문에서 키워드 추출 (2글자 이상 단어)
    const keywords = query
      .replace(/[?!.,。？！、]/g, "")
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    if (keywords.length === 0) return [];

    // 각 키워드로 ILIKE 검색
    const allResults: any[] = [];
    for (const kw of keywords.slice(0, 5)) {
      const encoded = encodeURIComponent(kw);
      // title 또는 content에서 검색
      const results = await supabaseSelect<any[]>(
        "knowledge_base",
        `or=(title.ilike.*${encoded}*,content.ilike.*${encoded}*)&category=neq.차단&limit=5`
      );
      if (results) allResults.push(...results);
    }

    // 중복 제거 + 출현 빈도 기준 정렬
    const countMap = new Map<string, { item: any; count: number }>();
    for (const item of allResults) {
      const existing = countMap.get(item.id);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(item.id, { item, count: 1 });
      }
    }

    return [...countMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((v) => ({
        id: v.item.id,
        category: v.item.category,
        title: v.item.title,
        content: v.item.content,
        tags: v.item.tags || [],
      }));
  } catch {
    return [];
  }
}

// 차단 키워드 조회
export async function getBlockedKeywords(): Promise<string[]> {
  try {
    const blocked = await supabaseSelect<any[]>("knowledge_base", "category=eq.차단");
    return (blocked || []).map((b: any) => b.title);
  } catch {
    return [];
  }
}
