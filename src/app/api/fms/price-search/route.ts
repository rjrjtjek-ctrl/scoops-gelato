import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/fms/middleware";
import { searchLowestPrice } from "@/lib/fms/price-search";

// POST: 최저가 검색
export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const { keyword } = await req.json();
    if (!keyword) {
      return NextResponse.json({ error: "검색어가 필요합니다." }, { status: 400 });
    }
    const results = await searchLowestPrice(keyword);
    return NextResponse.json({ results });
  } catch (err) { return handleAuthError(err); }
}
