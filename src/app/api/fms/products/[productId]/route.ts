import { NextRequest, NextResponse } from "next/server";
import { supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// PATCH: 수정
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { productId } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.brand !== undefined) data.brand = body.brand;
    if (body.specification !== undefined) data.specification = body.specification;
    if (body.category !== undefined) data.category = body.category;
    if (body.searchKeyword !== undefined) data.search_keyword = body.searchKeyword;
    if (body.purchaseMode !== undefined) data.purchase_mode = body.purchaseMode;
    if (body.isActive !== undefined) data.is_active = body.isActive;
    await supabaseUpdate("approved_products", `id=eq.${productId}`, data);
    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}

// DELETE: 비활성화
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { productId } = await params;
    await supabaseUpdate("approved_products", `id=eq.${productId}`, { is_active: false });
    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
