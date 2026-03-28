import SubNav from "@/components/SubNav";

export default function LocationPage() {
  return (
    <main className="pt-[80px]">
      <SubNav category="SCOOPS" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Location</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">찾아오시는길</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            스쿱스젤라또 본사로 찾아오시는 길을 안내해 드립니다.
          </p>
        </div>
      </section>

      {/* 본사 정보 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16">
            {/* 지도 영역 */}
            <div className="bg-bg-cream rounded-2xl overflow-hidden aspect-square md:aspect-auto flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-text-body">지도 영역</p>
                <p className="text-xs text-text-light mt-1">카카오맵 / 네이버맵 연동 예정</p>
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="flex flex-col justify-center">
              <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Headquarters</p>
              <h2 className="text-2xl md:text-3xl font-light text-brand-primary mb-8">스쿱스젤라또 본사</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-brand-primary mb-1">주소</h3>
                    <p className="text-sm text-text-body">충청북도 청주시 서원구 1순환로672번길 35, 1층</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-brand-primary mb-1">대표번호</h3>
                    <p className="text-sm text-text-body">1811-0259</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-brand-primary mb-1">영업시간</h3>
                    <p className="text-sm text-text-body">매일 11:00 – 22:00</p>
                    <p className="text-xs text-text-light mt-1">* 매장별 영업시간이 상이할 수 있습니다</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-brand-primary mb-1">인스타그램</h3>
                    <p className="text-sm text-text-body">@_scoopsgelato_</p>
                  </div>
                </div>
              </div>

              {/* 교통편 */}
              <div className="mt-10 p-6 bg-bg-cream rounded-2xl">
                <h3 className="text-sm font-medium text-brand-primary mb-3">교통편 안내</h3>
                <div className="space-y-2 text-sm text-text-body">
                  <p><span className="text-brand-secondary font-medium">버스</span> — 사직대로 정류장 하차 도보 3분</p>
                  <p><span className="text-brand-secondary font-medium">자가용</span> — 건물 앞 주차 가능 (무료)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
