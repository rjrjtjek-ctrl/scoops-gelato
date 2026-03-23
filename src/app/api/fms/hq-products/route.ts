import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 본사 공급 제품 목록
export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    const products = await supabaseSelect<any[]>("hq_products", "order=created_at.asc");
    return NextResponse.json({
      products: (products || []).map((p: any) => ({
        id: p.id, name: p.name, category: p.category,
        unit: p.unit, price: p.price, isActive: p.is_active,
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}

// POST: 제품 추가 (본사만)
export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { name, category, unit, price } = await req.json();
    if (!name || !category || !unit) {
      return NextResponse.json({ error: "필수 정보 누락" }, { status: 400 });
    }
    const result = await supabaseInsert("hq_products", { name, category, unit, price: price || 0 });
    return NextResponse.json({ product: Array.isArray(result) ? result[0] : result });
  } catch (err) { return handleAuthError(err); }
}
