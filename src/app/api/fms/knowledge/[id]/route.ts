import { NextRequest, NextResponse } from "next/server";
import { supabaseUpdate, supabaseDelete } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.category !== undefined) data.category = body.category;
    if (body.title !== undefined) data.title = body.title;
    if (body.content !== undefined) data.content = body.content;
    if (body.tags !== undefined) data.tags = body.tags;
    data.updated_at = new Date().toISOString();
    await supabaseUpdate("knowledge_base", `id=eq.${id}`, data);
    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAuth(req, ["hq_admin"]);
    const { id } = await params;
    await supabaseDelete("knowledge_base", `id=eq.${id}`);
    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
