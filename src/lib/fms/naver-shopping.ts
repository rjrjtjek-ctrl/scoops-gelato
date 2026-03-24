export interface NaverProduct {
  title: string;
  link: string;
  lprice: string;
  mallName: string;
  maker: string;
  image: string;
}

export async function searchNaverShopping(keyword: string): Promise<NaverProduct[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];

  try {
    const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(keyword)}&display=10&sort=asc`;
    const res = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    });

    if (!res.ok) return [];
    const data = await res.json();

    return (data.items || [])
      .filter((item: any) => {
        const title = item.title.replace(/<[^>]*>/g, "").toLowerCase();
        if (title.includes("해외") || title.includes("직구") || title.includes("중국")) return false;
        if (!item.lprice || Number(item.lprice) === 0) return false;
        return true;
      })
      .map((item: any) => ({
        title: item.title.replace(/<[^>]*>/g, ""),
        link: item.link,
        lprice: item.lprice,
        mallName: item.mallName || "알 수 없음",
        maker: item.maker || "",
        image: item.image || "",
      }));
  } catch {
    return [];
  }
}
