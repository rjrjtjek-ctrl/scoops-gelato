import { NextRequest, NextResponse } from "next/server";

// 카카오 OAuth 콜백 — 인가 코드로 토큰 발급
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const clientId = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const redirectUri = `${req.nextUrl.origin}/api/kakao/callback`;

  console.log("=== KAKAO DEBUG ===");
  console.log("clientId:", clientId);
  console.log("clientSecret:", clientSecret ? "SET" : "NOT SET");
  console.log("redirectUri:", redirectUri);

  if (!code || !clientId) {
    return NextResponse.json({ error: "인가 코드 또는 REST API 키가 없습니다." }, { status: 400 });
  }

  try {
    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
        ...(process.env.KAKAO_CLIENT_SECRET ? { client_secret: process.env.KAKAO_CLIENT_SECRET } : {}),
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.access_token) {
      // 토큰 정보를 화면에 표시 (사용자가 .env.local에 복사)
      const html = `
        <!DOCTYPE html>
        <html lang="ko">
        <head><meta charset="UTF-8"><title>카카오 연동 완료</title>
        <style>
          body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f9f9f5; }
          .box { background: white; border-radius: 12px; padding: 24px; margin: 16px 0; border: 1px solid #e5e7eb; }
          .token { background: #f3f4f6; padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 13px; }
          h1 { color: #1B4332; }
          .success { color: #16a34a; font-weight: bold; }
          .step { margin: 12px 0; padding-left: 20px; }
        </style>
        </head>
        <body>
          <h1>카카오톡 알림 연동 완료!</h1>
          <p class="success">토큰이 성공적으로 발급되었습니다.</p>

          <div class="box">
            <h3>📋 1단계: 아래 Refresh Token을 복사하세요</h3>
            <p><strong>Refresh Token (이것만 복사하면 됩니다):</strong></p>
            <div class="token">${tokenData.refresh_token || "없음 — 재시도 필요"}</div>
            <p style="font-size:12px;color:#888;margin-top:8px;">Access Token은 자동 발급되므로 저장 안 해도 됩니다.</p>
          </div>

          <div class="box">
            <h3>🚀 2단계: Vercel 환경변수 업데이트 (실서비스)</h3>
            <p class="step">① <a href="https://vercel.com/dashboard" target="_blank">vercel.com/dashboard</a> 접속 → scoops-gelato 프로젝트</p>
            <p class="step">② Settings → Environment Variables</p>
            <p class="step">③ <strong>KAKAO_REFRESH_TOKEN</strong> 찾아서 Edit</p>
            <p class="step">④ 위 1단계의 Refresh Token 값으로 교체 후 Save</p>
            <p class="step">⑤ Deployments 탭 → 최신 배포 ⋯ → Redeploy</p>
          </div>

          <div class="box">
            <h3>✅ 3단계: 확인</h3>
            <p>재배포 완료 후, 홈페이지에서 가맹 문의를 한 건 넣어보세요.</p>
            <p>카카오톡 "나에게 보내기"로 알림이 오면 성공입니다!</p>
            <p style="font-size:12px;color:#888;margin-top:8px;">⚠️ Refresh Token은 약 2개월간 유효합니다. 알림이 또 안 오면 이 과정을 반복하세요.</p>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return NextResponse.json({ error: "토큰 발급 실패", details: tokenData }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "서버 오류", details: String(err) }, { status: 500 });
  }
}
