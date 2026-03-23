import { NextRequest, NextResponse } from "next/server";
import { supabaseUpdate } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// PATCH: 사용자 비활성화 (소프트 삭제)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = requireAuth(req, ["hq_admin", "franchisee"]);
    const { userId } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.isActive !== undefined) data.is_active = body.isActive;
    if (body.name !== undefined) data.name = body.name;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;

    await supabaseUpdate("users", `id=eq.${userId}`, data);
    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
