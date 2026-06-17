import Link from "next/link";

export const dynamic = "force-dynamic";

// 카카오 OAuth 재연결 도우미
// 대표님 카카오 로그인이 필요한 작업 — 이 페이지에서 한 번 클릭으로 시작
export default function KakaoReauthPage() {
  const clientId = process.env.KAKAO_REST_API_KEY;
  const redirectUri = "https://scoopsgelato.kr/api/kakao/callback";

  const authUrl = clientId
    ? `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=talk_message`
    : null;

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center px-4 py-10">
      <div className="max-w-[560px] w-full">
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← 대시보드
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#FEE500] flex items-center justify-center text-2xl">💬</div>
            <div>
              <h1 className="text-xl font-bold text-[#1B4332]">카카오 알림 재연결</h1>
              <p className="text-xs text-gray-400 mt-0.5">가맹문의 카톡 알림이 안 올 때</p>
            </div>
          </div>

          {/* 현상 안내 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>증상:</strong> 가맹문의 화면에 "카톡실패"가 떠 있다면, Vercel에 저장된
              카카오 리프레시 토큰이 만료된 상태입니다. (카카오 토큰은 약 2개월 미사용 시 만료)
            </p>
          </div>

          {/* 진행 순서 */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#1B4332] mb-3">진행 순서 (3단계)</h2>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B4332] text-white text-xs font-bold flex items-center justify-center">1</span>
                <div>
                  아래 <strong>"카카오 로그인하여 새 토큰 받기"</strong> 버튼 클릭
                  <p className="text-xs text-gray-400 mt-0.5">대표님 카카오 계정으로 로그인해주세요</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B4332] text-white text-xs font-bold flex items-center justify-center">2</span>
                <div>
                  로그인 후 나오는 화면에서 <strong>Refresh Token 복사</strong>
                  <p className="text-xs text-gray-400 mt-0.5">화면에 표시되는 긴 문자열을 복사하세요</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B4332] text-white text-xs font-bold flex items-center justify-center">3</span>
                <div>
                  <strong>Vercel 환경변수 업데이트</strong> + 재배포
                  <p className="text-xs text-gray-400 mt-0.5">해당 화면에 단계별 안내가 같이 표시됩니다</p>
                </div>
              </li>
            </ol>
          </div>

          {/* 메인 액션 버튼 */}
          {authUrl ? (
            <a
              href={authUrl}
              className="block w-full text-center py-4 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-bold text-base hover:brightness-95 transition shadow-sm"
            >
              💬 카카오 로그인하여 새 토큰 받기 →
            </a>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 leading-relaxed">
              <p className="font-bold mb-2">⛔ KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다</p>
              <p>Vercel 대시보드 → scoops-gelato 프로젝트 → Settings → Environment Variables에서
              <code className="bg-red-100 px-1.5 py-0.5 rounded mx-1">KAKAO_REST_API_KEY</code>를 먼저 설정한 뒤 이 페이지를 새로고침해주세요.</p>
              <p className="mt-2 text-xs">REST API 키는 <a href="https://developers.kakao.com/console/app" target="_blank" rel="noopener noreferrer" className="underline">카카오 개발자 콘솔</a> → 내 애플리케이션 → 앱 키에서 확인할 수 있습니다.</p>
            </div>
          )}

          {/* 보조 정보 */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400 leading-relaxed space-y-1">
            <p>• 이 작업은 약 2개월에 한 번 필요할 수 있습니다 (카카오 정책)</p>
            <p>• 재연결 후에는 가맹문의가 들어오면 즉시 카카오톡 "나에게 보내기"로 알림이 옵니다</p>
            <p>• 그 동안 누락된 문의는 <Link href="/admin/inquiries" className="text-[#1B4332] underline">가맹 문의 페이지</Link>에서 직접 확인 가능합니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}
