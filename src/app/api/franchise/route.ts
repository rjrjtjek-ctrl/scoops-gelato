import { NextRequest, NextResponse } from "next/server";
import { sendKakaoNotification } from "@/lib/kakao";
import { saveInquiry } from "@/lib/inquiries";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, region, message } = body;

    // 유효성 검사 — 전화번호만 필수 (랜딩페이지는 전화번호만 받음)
    if (!phone) {
      return NextResponse.json(
        { error: "전화번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const inquiryTime = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

    // 카카오톡 알림 전송
    const kakaoResult = await sendKakaoNotification({
      name,
      phone,
      email,
      region,
      message,
      time: inquiryTime,
    });

    if (!kakaoResult.success) {
      console.warn("카카오톡 알림 전송 실패:", kakaoResult.error);
    }

    // 문의 데이터 저장 (카카오 전송 결과 포함)
    const saved = await saveInquiry({
      name,
      phone,
      email,
      region,
      message,
      time: inquiryTime,
      kakaoSent: kakaoResult.success,
      kakaoError: kakaoResult.error,
    });

    // 콘솔에도 기록 (서버 로그)
    console.log("=== 새 가맹 문의 ===");
    console.log({ id: saved.id, name, phone, email, region, message, time: inquiryTime, kakaoSent: kakaoResult.success });
    console.log("==================");

    return NextResponse.json({ success: true, kakaoSent: kakaoResult.success });
  } catch (err) {
    console.error("가맹문의 처리 오류:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
