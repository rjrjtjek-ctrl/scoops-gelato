import { searchNaverShopping } from "./naver-shopping";

export interface PriceResult {
  source: "네이버" | "쿠팡";
  productName: string;
  price: number;
  url: string;
  mallName: string;
}

export async function searchLowestPrice(keyword: string): Promise<PriceResult[]> {
  // 네이버 검색 (쿠팡은 API 준비 시 추가)
  const [naverResults] = await Promise.allSettled([
    searchNaverShopping(keyword),
  ]);

  const results: PriceResult[] = [];

  if (naverResults.status === "fulfilled") {
    for (const item of naverResults.value) {
      results.push({
        source: "네이버",
        productName: item.title,
        price: Number(item.lprice),
        url: item.link,
        mallName: item.mallName,
      });
    }
  }

  // 가격 낮은 순 정렬 + 상위 5개
  return results.sort((a, b) => a.price - b.price).slice(0, 5);
}
