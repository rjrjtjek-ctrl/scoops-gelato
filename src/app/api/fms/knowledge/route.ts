import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 지식 목록
export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    const category = req.nextUrl.searchParams.get("category");
    let query = "order=created_at.desc";
    if (category) query = `category=eq.${encodeURIComponent(category)}&${query}`;

    const items = await supabaseSelect<any[]>("knowledge_base", query);
    return NextResponse.json({
      items: (items || []).map((k: any) => ({
        id: k.id, category: k.category, title: k.title,
        content: k.content, tags: k.tags, createdAt: k.created_at,
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}

// POST: 지식 추가 (본사만)
export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ["hq_admin"]);
    const body = await req.json();
    const result = await supabaseInsert("knowledge_base", {
      category: body.category,
      title: body.title,
      content: body.content,
      tags: body.tags || [],
    });
    return NextResponse.json({ item: Array.isArray(result) ? result[0] : result });
  } catch (err) { return handleAuthError(err); }
}
