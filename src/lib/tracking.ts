// 추적 이벤트 전송 (비동기, 실패해도 무시)
// 관리자(scoops_admin 쿠키 보유)는 추적하지 않음
export function track(
  event: string,
  storeCode?: string,
  data?: Record<string, unknown>
) {
  try {
    // 관리자 쿠키 체크 — 관리자 기기는 추적 제외
    if (typeof document !== "undefined" && document.cookie.includes("scoops_admin=true")) {
      return;
    }

    fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, storeCode, data }),
    }).catch(() => {});
  } catch {
    // 추적 실패는 무시
  }
}

// 관리자 기기로 표시 (관리자 페이지 접속 시 호출)
export function markAsAdmin() {
  if (typeof document !== "undefined") {
    // 1년짜리 쿠키
    document.cookie = "scoops_admin=true; path=/; max-age=31536000; SameSite=Lax";
  }
}
