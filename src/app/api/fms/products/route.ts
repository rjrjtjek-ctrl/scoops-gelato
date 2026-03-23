import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect, supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 승인 제품 목록
export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    const products = await supabaseSelect<any[]>("approved_products", "order=created_at.asc");
    return NextResponse.json({
      products: (products || []).map((p: any) => ({
        id: p.id, name: p.name, brand: p.brand, specification: p.specification,
        category: p.category, searchKeyword: p.search_keyword,
        purchaseMode: p.purchase_mode, referenceUrl: p.reference_url,
        isActive: p.is_active,
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) { return handleAuthError(err); }
}

// POST: 제품 추가 (본사만)
export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ["hq_admin"]);
    const body = await req.json();
    const result = await supabaseInsert("approved_products", {
      name: body.name, brand: body.brand || "", specification: body.specification || "",
      category: body.category, search_keyword: body.searchKeyword,
      purchase_mode: body.purchaseMode || "store_purchase",
      reference_url: body.referenceUrl || null,
    });
    return NextResponse.json({ product: Array.isArray(result) ? result[0] : result });
  } catch (err) { return handleAuthError(err); }
}
