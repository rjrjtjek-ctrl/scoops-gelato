// 카카오톡 "나에게 보내기" 알림 유틸리티
// Vercel 서버리스 환경: 매 요청마다 refresh token으로 access token을 새로 발급

const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_SEND_URL = "https://kapi.kakao.com/v2/api/talk/memo/default/send";

// refresh token으로 access token을 항상 새로 발급 (서버리스 대응)
async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.KAKAO_REST_API_KEY;
  const refreshToken = process.env.KAKAO_REFRESH_TOKEN;

  if (!clientId || !refreshToken) {
    console.error("카카오 환경변수 누락 — KAKAO_REST_API_KEY:", !!clientId, "KAKAO_REFRESH_TOKEN:", !!refreshToken);
    return null;
  }

  try {
    const res = await fetch(KAKAO_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: refreshToken,
        ...(process.env.KAKAO_CLIENT_SECRET ? { client_secret: process.env.KAKAO_CLIENT_SECRET } : {}),
      }),
    });

    const data = await res.json();

    if (data.access_token) {
      // refresh_token이 갱신된 경우 로그 (Vercel env 수동 업데이트 필요 알림)
      if (data.refresh_token) {
        console.warn("⚠️ 카카오 Refresh Token이 갱신됨! 새 값:", data.refresh_token.substring(0, 20) + "...");
        console.warn("→ Vercel 환경변수 KAKAO_REFRESH_TOKEN을 업데이트하세요.");
      }
      return data.access_token;
    }

    console.error("카카오 토큰 발급 실패:", data);
    return null;
  } catch (err) {
    console.error("카카오 토큰 발급 에러:", err);
    return null;
  }
}

// 카카오톡 알림 전송 결과 타입
export interface KakaoSendResult {
  success: boolean;
  error?: string;
}

// 카카오톡 나에게 보내기
export async function sendKakaoNotification(inquiry: {
  name: string;
  phone: string;
  email: string;
  region: string;
  message?: string;
  time: string;
}): Promise<KakaoSendResult> {
  // 항상 refresh token으로 새 access token 발급 (서버리스 환경 대응)
  const token = await getAccessToken();

  if (!token) {
    return { success: false, error: "카카오 토큰 발급 실패 — Vercel 환경변수를 확인하세요" };
  }

  const templateObject = {
    object_type: "text",
    text: [
      "📩 새 가맹 문의가 접수되었습니다!",
      "",
      `▪ 이름: ${inquiry.name}`,
      `▪ 연락처: ${inquiry.phone}`,
      `▪ 이메일: ${inquiry.email}`,
      `▪ 희망 지역: ${inquiry.region}`,
      `▪ 문의 내용: ${inquiry.message || "없음"}`,
      "",
      `⏰ ${inquiry.time}`,
    ].join("\n"),
    link: {
      web_url: "https://scoopsgelato.kr/franchise",
      mobile_web_url: "https://scoopsgelato.kr/franchise",
    },
  };

  try {
    const res = await fetch(KAKAO_SEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: new URLSearchParams({
        template_object: JSON.stringify(templateObject),
      }),
    });

    const data = await res.json();

    if (data.result_code === 0) {
      return { success: true };
    }

    console.error("카카오톡 전송 실패:", res.status, data);
    return { success: false, error: `카카오 API 응답: ${res.status} - ${JSON.stringify(data)}` };
  } catch (err) {
    console.error("카카오톡 전송 에러:", err);
    return { success: false, error: String(err) };
  }
}
