import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/fms/middleware";
import { supabaseSelect, supabaseInsert, supabaseUpdate } from "@/lib/supabase-client";

// GPS 거리 계산 (미터 단위)
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET: 출퇴근 기록 조회
export async function GET(req: NextRequest) {
  const user = authenticate(req);
  if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId") || user.storeId;
  const userId = searchParams.get("userId");
  const month = searchParams.get("month"); // YYYY-MM

  if (!storeId) return NextResponse.json({ error: "매장 ID 필요" }, { status: 400 });

  let query = `store_id=eq.${storeId}&order=clock_in.desc`;
  if (userId) query += `&user_id=eq.${userId}`;
  if (month) {
    const [y, m] = month.split("-").map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
    query = `store_id=eq.${storeId}&order=clock_in.desc&clock_in=gte.${month}-01T00:00:00%2B09:00&clock_in=lt.${nextMonth}-01T00:00:00%2B09:00`;
    if (userId) query += `&user_id=eq.${userId}`;
  }

  try {
    const records = await supabaseSelect<any[]>("attendance", query);
    return NextResponse.json({ records });
  } catch (err) {
    console.error("[attendance] GET:", err);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

// POST: 출근/퇴근 기록
export async function POST(req: NextRequest) {
  const user = authenticate(req);
  if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const body = await req.json();
  const { action, latitude, longitude } = body;

  if (!user.storeId) return NextResponse.json({ error: "매장 정보 없음" }, { status: 400 });

  try {
    // 매장 GPS 좌표 조회
    const stores = await supabaseSelect<any[]>("stores", `id=eq.${user.storeId}&limit=1`);
    const store = stores[0];
    const storeHasGps = store?.latitude && store?.longitude;

    // GPS 검증
    let distance: number | null = null;
    if (storeHasGps) {
      if (!latitude || !longitude) {
        return NextResponse.json({ error: "위치 정보가 필요합니다. 위치 권한을 허용해주세요." }, { status: 400 });
      }
      distance = Math.round(getDistanceMeters(latitude, longitude, store.latitude, store.longitude));
      const radius = store.gps_radius || 100;
      if (distance > radius) {
        return NextResponse.json({
          error: `매장에서 ${distance}m 떨어져 있습니다. 매장 반경 ${radius}m 이내에서 ${action === "clock_in" ? "출근" : "퇴근"}해주세요.`,
          distance,
          radius,
        }, { status: 400 });
      }
    }

    if (action === "clock_in") {
      // 이미 출근 중인지 확인
      const active = await supabaseSelect<any[]>(
        "attendance",
        `user_id=eq.${user.userId}&clock_out=is.null&order=clock_in.desc&limit=1`
      );
      if (active.length > 0) {
        return NextResponse.json({ error: "이미 출근 상태입니다. 먼저 퇴근해주세요." }, { status: 400 });
      }

      const now = new Date().toISOString();
      const result = await supabaseInsert("attendance", {
        user_id: user.userId,
        store_id: user.storeId,
        clock_in: now,
        clock_in_lat: latitude || null,
        clock_in_lng: longitude || null,
        clock_in_distance: distance,
        memo: body.memo || null,
      });
      return NextResponse.json({ success: true, record: result, clockIn: now, distance });

    } else if (action === "clock_out") {
      const active = await supabaseSelect<any[]>(
        "attendance",
        `user_id=eq.${user.userId}&clock_out=is.null&order=clock_in.desc&limit=1`
      );
      if (active.length === 0) {
        return NextResponse.json({ error: "출근 기록이 없습니다." }, { status: 400 });
      }

      const record = active[0];
      const now = new Date();
      const clockIn = new Date(record.clock_in);
      const workMinutes = Math.round((now.getTime() - clockIn.getTime()) / 60000);

      await supabaseUpdate("attendance", `id=eq.${record.id}`, {
        clock_out: now.toISOString(),
        clock_out_lat: latitude || null,
        clock_out_lng: longitude || null,
        work_minutes: workMinutes,
        memo: body.memo || record.memo,
      });

      return NextResponse.json({ success: true, workMinutes, clockOut: now.toISOString(), distance });

    } else {
      return NextResponse.json({ error: "action은 clock_in 또는 clock_out" }, { status: 400 });
    }
  } catch (err) {
    console.error("[attendance] POST:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
