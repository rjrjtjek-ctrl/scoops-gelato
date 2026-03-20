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
            <h3>1단계: 아래 토큰을 .env.local에 입력하세요</h3>
            <p><strong>Access Token:</strong></p>
            <div class="token">${tokenData.access_token}</div>
            <br>
            <p><strong>Refresh Token:</strong></p>
            <div class="token">${tokenData.refresh_token || "없음"}</div>
          </div>

          <div class="box">
            <h3>2단계: .env.local 파일 수정</h3>
            <p>scoops-gelato/.env.local 파일을 열고 아래처럼 입력:</p>
            <div class="token">
KAKAO_ACCESS_TOKEN=${tokenData.access_token}
KAKAO_REFRESH_TOKEN=${tokenData.refresh_token || ""}
            </div>
          </div>

          <div class="box">
            <h3>3단계: 서버 재시작</h3>
            <p>터미널에서 서버를 껐다 다시 켜주세요 (Ctrl+C → npm run dev)</p>
            <p>이제 가맹 문의가 들어오면 카카오톡으로 알림이 옵니다!</p>
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
