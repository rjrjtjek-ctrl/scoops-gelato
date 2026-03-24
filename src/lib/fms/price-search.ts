import { searchNaverShopping } from "./naver-shopping";

export interface PriceResult {
  title: string;
  price: number;
  link: string;
  mall: string;
  image: string;
}

export async function searchLowestPrice(keyword: string): Promise<PriceResult[]> {
  const [naverResults] = await Promise.allSettled([
    searchNaverShopping(keyword),
  ]);

  const results: PriceResult[] = [];

  if (naverResults.status === "fulfilled") {
    for (const item of naverResults.value) {
      results.push({
        title: item.title,
        price: Number(item.lprice),
        link: item.link,
        mall: item.mallName,
        image: item.image,
      });
    }
  }

  return results.sort((a, b) => a.price - b.price).slice(0, 5);
}
