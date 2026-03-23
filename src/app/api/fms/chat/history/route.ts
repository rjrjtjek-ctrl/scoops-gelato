import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// GET: 채팅 히스토리
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

    const messages = await supabaseSelect<any[]>(
      "chat_messages",
      `user_id=eq.${user.userId}&order=created_at.desc&limit=${limit}`
    );

    const result = (messages || []).reverse().map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      attachments: m.attachments,
      msgType: m.msg_type,
      metadata: m.metadata,
      createdAt: m.created_at,
    }));

    return NextResponse.json({
      messages: result,
      hasMore: (messages || []).length >= limit,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return handleAuthError(err);
  }
}
