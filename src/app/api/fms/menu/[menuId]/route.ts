import { NextRequest, NextResponse } from "next/server";
import { supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ menuId: string }> }) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { menuId } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.category !== undefined) data.category = body.category;
    if (body.price !== undefined) data.price = body.price;
    if (body.description !== undefined) data.description = body.description;
    if (body.isActive !== undefined) data.is_active = body.isActive;
    if (body.sortOrder !== undefined) data.sort_order = body.sortOrder;
    await supabaseUpdate("menu_items", `id=eq.${menuId}`, data);
    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
