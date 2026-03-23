import { NextRequest, NextResponse } from "next/server";
import { supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// PATCH: 제품 수정 (본사만)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { productId } = await params;
    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;
    await supabaseUpdate("hq_products", `id=eq.${productId}`, updateData);
    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
