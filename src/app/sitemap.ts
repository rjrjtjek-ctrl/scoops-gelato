import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://scoopsgelato.kr";
  const now = new Date().toISOString();

  return [
    // ── 메인 ──
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },

    // ── SCOOPS (브랜드) ──
    { url: `${baseUrl}/story`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/story/brand`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/story/location`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // ── MENU ──
    { url: `${baseUrl}/menu`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/menu/sorbetto`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/menu/coffee`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/menu/dessert`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },

    // ── FRANCHISE (가맹) ──
    { url: `${baseUrl}/franchise`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/franchise/inquiry`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/franchise/process`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/franchise/cost`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/franchise/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/franchise/conversion`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // ── STORE ──
    { url: `${baseUrl}/stores`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },

    // ── NEWS ──
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },

    // ── CUSTOMER ──
    { url: `${baseUrl}/customer`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },

    // ── 기타 ──
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
