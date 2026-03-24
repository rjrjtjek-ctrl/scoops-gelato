import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/fms/middleware";
import { supabaseSelect, supabaseInsert, supabaseUpdate, supabaseDelete } from "@/lib/supabase-client";

// GET: 시간대별 업무 규칙 조회
export async function GET(req: NextRequest) {
  const user = authenticate(req);
  if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const storeId = new URL(req.url).searchParams.get("storeId") || user.storeId;
  if (!storeId) return NextResponse.json({ error: "매장 ID 필요" }, { status: 400 });

  try {
    const rules = await supabaseSelect<any[]>("time_rules", `store_id=eq.${storeId}&is_active=eq.true&order=start_hour.asc`);
    return NextResponse.json({ rules });
  } catch (err) {
    console.error("[time-rules] GET:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

// POST: 업무 규칙 추가
export async function POST(req: NextRequest) {
  const user = authenticate(req);
  if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  if (user.role !== "franchisee" && user.role !== "hq_admin") {
    return NextResponse.json({ error: "점주 이상 권한 필요" }, { status: 403 });
  }

  const body = await req.json();
  const { startHour, endHour, tasks, priority } = body;
  const storeId = user.storeId || body.storeId;

  if (startHour === undefined || endHour === undefined || !tasks || !storeId) {
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }

  try {
    const result = await supabaseInsert("time_rules", {
      store_id: storeId,
      start_hour: startHour,
      end_hour: endHour,
      tasks: `{${tasks.map((t: string) => `"${t}"`).join(",")}}`,
      priority: priority || "normal",
    });
    return NextResponse.json({ success: true, rule: result });
  } catch (err) {
    console.error("[time-rules] POST:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// PATCH: 업무 규칙 수정
export async function PATCH(req: NextRequest) {
  const user = authenticate(req);
  if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  if (user.role !== "franchisee" && user.role !== "hq_admin") {
    return NextResponse.json({ error: "점주 이상 권한 필요" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID 필요" }, { status: 400 });

  try {
    if (updates.tasks) {
      updates.tasks = `{${updates.tasks.map((t: string) => `"${t}"`).join(",")}}`;
    }
    await supabaseUpdate("time_rules", `id=eq.${id}`, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[time-rules] PATCH:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// DELETE: 업무 규칙 비활성화
export async function DELETE(req: NextRequest) {
  const user = authenticate(req);
  if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID 필요" }, { status: 400 });

  try {
    await supabaseUpdate("time_rules", `id=eq.${id}`, { is_active: false });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[time-rules] DELETE:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
