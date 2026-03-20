// GitHub Contents API 기반 영구 데이터 저장소
// Edge Config 8KB 제한을 벗어나 무제한 데이터 저장 가능
// data/ 디렉토리에 JSON 파일로 저장

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "rjrjtjek-ctrl/scoops-gelato";
const BRANCH = "main";
const BASE_API = `https://api.github.com/repos/${GITHUB_REPO}/contents`;

interface GitHubFileResponse {
  sha: string;
  content: string;
  encoding: string;
}

// 파일 읽기
export async function githubGet<T>(path: string, fallback: T): Promise<{ data: T; sha: string }> {
  if (!GITHUB_TOKEN) {
    console.warn("[github-store] Missing GITHUB_TOKEN");
    return { data: fallback, sha: "" };
  }
  try {
    const res = await fetch(`${BASE_API}/${path}?ref=${BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 404) return { data: fallback, sha: "" };
      console.error("[github-store] GET error:", res.status);
      return { data: fallback, sha: "" };
    }
    const file: GitHubFileResponse = await res.json();
    const decoded = Buffer.from(file.content, "base64").toString("utf-8");
    return { data: JSON.parse(decoded) as T, sha: file.sha };
  } catch (err) {
    console.error("[github-store] GET error:", err);
    return { data: fallback, sha: "" };
  }
}

// 파일 쓰기 (upsert)
export async function githubSet<T>(path: string, value: T, sha: string, message?: string): Promise<boolean> {
  if (!GITHUB_TOKEN) {
    console.warn("[github-store] Missing GITHUB_TOKEN");
    return false;
  }
  try {
    const content = Buffer.from(JSON.stringify(value), "utf-8").toString("base64");
    const body: Record<string, string> = {
      message: message || `analytics: update ${path}`,
      content,
      branch: BRANCH,
    };
    if (sha) body.sha = sha;

    const res = await fetch(`${BASE_API}/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[github-store] SET error:", res.status, text);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[github-store] SET error:", err);
    return false;
  }
}
