import { NextRequest, NextResponse } from "next/server";
import { supabaseInsert } from "@/lib/supabase-client";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";

// POST: 읽음 처리
export async function POST(req: NextRequest, { params }: { params: Promise<{ announcementId: string }> }) {
  try {
    const user = requireAuth(req);
    const { announcementId } = await params;

    try {
      await supabaseInsert("announcement_reads", {
        announcement_id: announcementId,
        user_id: user.userId,
      });
    } catch {
      // 이미 읽음 처리된 경우 UNIQUE 위반 → 무시
    }

    return NextResponse.json({ success: true });
  } catch (err) { return handleAuthError(err); }
}
