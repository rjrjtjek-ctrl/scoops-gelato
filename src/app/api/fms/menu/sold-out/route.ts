import { NextRequest, NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabase-client";

// GET: 특정 매장의 품절 메뉴 ID 목록 (인증 불필요 — QR 주문 페이지에서 호출)
export async function GET(req: NextRequest) {
  try {
    const storeCode = req.nextUrl.searchParams.get("storeCode");
    if (!storeCode) {
      return NextResponse.json({ soldOutIds: [] });
    }

    // storeCode → Supabase stores 테이블의 store ID 매핑
    // order-data.ts의 stores 배열과 Supabase stores 테이블을 연결
    // Supabase stores 테이블에서 name으로 검색
    const storeCodeToName: Record<string, string> = {
      cheongju: "청주본점",
      yeouido: "여의도점",
      gongdeok: "공덕점",
      jichuk: "지축점",
      gwanjeo: "관저점",
      seonhwa: "선화점",
    };

    const storeName = storeCodeToName[storeCode];
    if (!storeName) {
      return NextResponse.json({ soldOutIds: [] });
    }

    // Supabase에서 매장 찾기
    const stores = await supabaseSelect<any[]>(
      "stores",
      `name=ilike.*${encodeURIComponent(storeName)}*&limit=1`
    );

    if (!stores || stores.length === 0) {
      return NextResponse.json({ soldOutIds: [] });
    }

    const supabaseStoreId = stores[0].id;

    // 해당 매장의 품절(is_available=false) 메뉴 조회
    const statuses = await supabaseSelect<any[]>(
      "store_menu_status",
      `store_id=eq.${supabaseStoreId}&is_available=eq.false`
    );

    if (!statuses || statuses.length === 0) {
      return NextResponse.json({ soldOutIds: [] });
    }

    // menu_item_id → order-data.ts의 메뉴 ID 매핑
    // store_menu_status에는 Supabase menu_items의 UUID가 들어있고
    // QR 주문은 order-data.ts의 "g1", "g2" 같은 ID를 사용함
    // 매핑: menu_items 테이블의 name → order-data의 menuItems에서 같은 name의 id
    const menuItemIds = statuses.map((s: any) => s.menu_item_id);

    // 해당 menu_items의 이름 가져오기
    const soldOutNames: string[] = [];
    for (const menuItemId of menuItemIds) {
      const items = await supabaseSelect<any[]>(
        "menu_items",
        `id=eq.${menuItemId}&limit=1`
      );
      if (items && items.length > 0) {
        soldOutNames.push(items[0].name);
      }
    }

    // order-data.ts의 menuItems에서 같은 이름의 ID 찾기
    // 이 매핑은 클라이언트에서 할 수도 있지만, 서버에서 처리하면 order-data 의존성 없음
    // 대신 이름 목록을 반환하고 클라이언트에서 매핑
    return NextResponse.json({
      soldOutIds: [], // UUID 기반이라 직접 매핑 불가
      soldOutNames,   // 이름 기반으로 클라이언트에서 매핑
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[sold-out] 조회 실패:", err);
    return NextResponse.json({ soldOutIds: [], soldOutNames: [] });
  }
}
