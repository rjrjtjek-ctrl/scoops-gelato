// Vercel Edge Config를 이용한 영구 데이터 저장소
// /tmp 대신 Edge Config API를 사용하여 서버리스 환경에서도 데이터가 유지됨

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || "";
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || "";

const BASE_URL = `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}`;

export async function edgeGet<T>(key: string, fallback: T): Promise<T> {
  if (!EDGE_CONFIG_ID || !VERCEL_API_TOKEN) {
    console.warn("[edge-store] Missing EDGE_CONFIG_ID or VERCEL_API_TOKEN");
    return fallback;
  }
  try {
    const res = await fetch(`${BASE_URL}/item/${key}`, {
      headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    // Edge Config API returns { key, value, createdAt, ... } — extract .value
    if (data && typeof data === "object" && "value" in data) {
      return data.value as T;
    }
    return data as T;
  } catch (err) {
    console.error("[edge-store] GET error:", err);
    return fallback;
  }
}

export async function edgeSet<T>(key: string, value: T): Promise<boolean> {
  if (!EDGE_CONFIG_ID || !VERCEL_API_TOKEN) {
    console.warn("[edge-store] Missing EDGE_CONFIG_ID or VERCEL_API_TOKEN");
    return false;
  }
  try {
    const res = await fetch(`${BASE_URL}/items`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key, value }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[edge-store] SET error:", res.status, text);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[edge-store] SET error:", err);
    return false;
  }
}
