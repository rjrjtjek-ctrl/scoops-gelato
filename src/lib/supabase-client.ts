// ============================================
// Supabase REST API 클라이언트 (경량 — 패키지 불필요)
// PostgREST 기반 CRUD
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "";

function headers() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    "Connection": "keep-alive",
  };
}

function restUrl(table: string) {
  return `${SUPABASE_URL}/rest/v1/${table}`;
}

export async function supabaseSelect<T>(
  table: string,
  query: string = "",
  options?: { single?: boolean }
): Promise<T> {
  const url = `${restUrl(table)}?${query}`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase SELECT ${table}: ${res.status} ${text}`);
  }
  const data = await res.json();
  if (options?.single) return data[0] as T;
  return data as T;
}

export async function supabaseInsert<T>(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[]
): Promise<T> {
  const res = await fetch(restUrl(table), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase INSERT ${table}: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function supabaseUpdate<T>(
  table: string,
  query: string,
  data: Record<string, unknown>
): Promise<T> {
  const url = `${restUrl(table)}?${query}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase UPDATE ${table}: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function supabaseDelete(
  table: string,
  query: string
): Promise<void> {
  const url = `${restUrl(table)}?${query}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase DELETE ${table}: ${res.status} ${text}`);
  }
}

// ---------- RPC 호출 (DB 함수 실행) ----------
export async function supabaseRpc<T>(
  fn: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const url = `${SUPABASE_URL}/rest/v1/rpc/${fn}`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase RPC ${fn}: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}
