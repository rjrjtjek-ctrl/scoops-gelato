import OpenAI from "openai";

// API 키가 없으면 null (빌드 시 에러 방지)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function chatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  if (!openai) {
    return "AI 서비스가 아직 설정되지 않았습니다. OPENAI_API_KEY를 환경변수에 추가해주세요.";
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1000,
  });
  return response.choices[0]?.message?.content || "응답을 생성할 수 없습니다.";
}
