import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Yeti",       // 네이버 크롤러
        allow: "/",
        disallow: ["/admin", "/api/", "/order"],
      },
      {
        userAgent: "Googlebot",  // 구글 크롤러
        allow: "/",
        disallow: ["/admin", "/api/", "/order"],
      },
      {
        userAgent: "*",          // 기타 모든 크롤러
        allow: "/",
        disallow: ["/admin", "/api/", "/order"],
      },
    ],
    sitemap: "https://scoopsgelato.kr/sitemap.xml",
    host: "https://scoopsgelato.kr",
  };
}
