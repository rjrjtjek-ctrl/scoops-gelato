"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── 타입 ── */
interface PageStep { page: string; enterAt: string; dwellSec: number }
interface SessionRecord {
  sid: string; ip: string; device: string; browser: string; referrer: string;
  startAt: string; endAt: string; durationSec: number; pages: PageStep[];
  exitPage: string; pageCount: number; isBounce: boolean;
}
interface DailyStat { date: string; pageViews: number; sessions: number; uniqueIPs: number; bounceCount: number; avgDurationSec: number }
interface AnalyticsData {
  todayVisits: number; todayUniqueVisitors: number; todaySessions: number;
  totalVisits: number; totalSessions: number; recentSessions: SessionRecord[];
  topPages: { page: string; views: number; exits: number; exitRate: number; avgDwell: number }[];
  bounceRate: number;
  exitPages: { page: string; exits: number; exitRate: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  dailyTrend: DailyStat[];
  journeyFlows: { from: string; to: string; count: number }[];
}
interface GeoData {
  regionStats: { region: string; count: number }[];
  cityStats: { city: string; count: number }[];
  ispStats: { isp: string; count: number }[];
}

/* ── 공통 카드 컴포넌트 ── */
function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 ${onClick ? "cursor-pointer hover:shadow-md active:scale-[0.99] transition-all" : ""} ${className}`} onClick={onClick}>{children}</div>;
}
function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-[15px] font-bold text-[#1B4332]">{title}</h2>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [kakaoFailCount, setKakaoFailCount] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "visitors" | "journey" | "tools">("home");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState<{
    todayOrders: number; todayRevenue: number; topItems: { name: string; count: number }[];
    qrScans: number; orderCompletes: number;
  } | null>(null);
  const router = useRouter();

  const getToken = () => typeof window !== "undefined" ? (sessionStorage.getItem("admin_token") || localStorage.getItem("fms_token") || sessionStorage.getItem("fms_token") || "") : "";

  const fetchData = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const [inqRes, anaRes, trackRes, geoRes] = await Promise.all([
        fetch("/api/admin/inquiries", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/tracking?days=1").catch(() => null),
        fetch("/api/analytics").catch(() => null),
      ]);
      if (inqRes.ok) {
        const data = await inqRes.json();
        setUnreadCount(data.unreadCount);
        setKakaoFailCount(data.inquiries.filter((i: { kakaoSent: boolean }) => !i.kakaoSent).length);
      }
      if (anaRes.ok) setAnalytics(await anaRes.json());
      if (geoRes?.ok) setGeoData(await geoRes.json());

      // 주문 요약 (전체 활성 매장 합산)
      try {
        const storeIds = ["s1", "s2", "s3", "s12", "s16", "s17"];
        const orderResults = await Promise.all(
          storeIds.map(id => fetch(`/api/order?storeId=${id}&today=true`).then(r => r.ok ? r.json() : { orders: [] }).catch(() => ({ orders: [] })))
        );
        const allOrders = orderResults.flatMap(r => r.orders || []);
        const todayRevenue = allOrders.reduce((sum: number, o: { totalAmount: number; status: string }) => o.status !== "cancelled" ? sum + o.totalAmount : sum, 0);

        // 인기 메뉴 집계
        const itemCounts: Record<string, number> = {};
        allOrders.forEach((o: { items: { itemName: string; quantity: number }[] }) => {
          (o.items || []).forEach((item) => {
            itemCounts[item.itemName] = (itemCounts[item.itemName] || 0) + item.quantity;
          });
        });
        const topItems = Object.entries(itemCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        // QR 이벤트 (스캔 수, 주문 완료 수)
        let qrScans = 0, orderCompletes = 0;
        if (trackRes && trackRes.ok) {
          const trackData = await trackRes.json();
          const events = trackData.events || [];
          qrScans = events.filter((e: { event: string }) => e.event === "qr_scan").length;
          orderCompletes = events.filter((e: { event: string }) => e.event === "order_complete").length;
        }

        setOrderSummary({
          todayOrders: allOrders.filter((o: { status: string }) => o.status !== "cancelled").length,
          todayRevenue,
          topItems,
          qrScans,
          orderCompletes,
        });
      } catch { /* 주문 데이터 실패해도 대시보드는 정상 동작 */ }
    } finally { setLoading(false); }
  }, []);

  const refresh = async () => { setRefreshing(true); await fetchData(getToken()); setTimeout(() => setRefreshing(false), 500); };

  const login = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/inquiries", { headers: { Authorization: `Bearer ${password}` } });
      if (res.ok) { sessionStorage.setItem("admin_token", password); setAuthenticated(true); fetchData(password); }
      else setError("비밀번호가 올바르지 않습니다.");
    } catch { setError("서버 오류가 발생했습니다."); }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) {
      setPassword(saved);
      fetch("/api/admin/inquiries", { headers: { Authorization: `Bearer ${saved}` } })
        .then((r) => { if (r.ok) { setAuthenticated(true); fetchData(saved); } else setLoading(false); })
        .catch(() => setLoading(false));
    } else setLoading(false);
  }, [fetchData]);

  /* ── 유틸 ── */
  const fmtTime = (iso: string) => new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
  const fmtDur = (sec: number) => { if (!sec) return "—"; if (sec < 60) return `${sec}초`; const m = Math.floor(sec / 60), s = sec % 60; return s > 0 ? `${m}분 ${s}초` : `${m}분`; };
  const dIcon: Record<string, string> = { mobile: "📱", desktop: "💻", tablet: "📟" };
  const dName: Record<string, string> = { mobile: "모바일", desktop: "PC", tablet: "태블릿" };
  const pName: Record<string, string> = { "/": "홈", "/menu": "메뉴", "/story": "스토리", "/franchise": "가맹문의", "/stores": "매장안내", "/franchise/conversion": "업종변경", "/privacy": "개인정보" };
  const pIcon: Record<string, string> = { "/": "🏠", "/menu": "🍨", "/story": "📖", "/franchise": "🤝", "/stores": "📍", "/franchise/conversion": "🔄", "/privacy": "🔒" };
  const p = (path: string) => pName[path] || path;
  const pi = (path: string) => pIcon[path] || "📄";
  const logout = () => { sessionStorage.removeItem("admin_token"); setAuthenticated(false); setPassword(""); };
  const tabs = [
    { key: "home" as const, label: "홈", mLabel: "홈" },
    { key: "visitors" as const, label: "방문 기록", mLabel: "방문" },
    { key: "journey" as const, label: "페이지 분석", mLabel: "분석" },
    { key: "tools" as const, label: "바로가기", mLabel: "도구" },
  ];

  /* ── 로그인 화면 ── */
  if (!authenticated) return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#1B4332] to-[#40916C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🍨</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1B4332]">SCOOPS</h1>
          <p className="text-sm text-gray-400 mt-1">관리자 대시보드</p>
        </div>
        {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
        <input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 mb-4 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] transition-all" />
        <button onClick={login} className="w-full bg-[#1B4332] text-white rounded-xl py-3.5 font-semibold hover:bg-[#2D6A4F] transition shadow-lg shadow-[#1B4332]/20">로그인</button>
      </div>
    </div>
  );

  const a = analytics;
  const todayStr = new Date().toISOString().split("T")[0];
  const todaySessions = a?.recentSessions.filter(s => s.startAt.startsWith(todayStr)) || [];
  const todayBounce = todaySessions.length > 0 ? Math.round((todaySessions.filter(s => s.isBounce).length / todaySessions.length) * 100) : 0;
  const avgDur = a?.recentSessions.length ? Math.round(a.recentSessions.reduce((s, x) => s + x.durationSec, 0) / a.recentSessions.length) : 0;
  const pagesPerVisit = a?.recentSessions.length ? (a.recentSessions.reduce((s, x) => s + x.pageCount, 0) / a.recentSessions.length).toFixed(1) : "—";

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col md:flex-row">
      {/* ── 데스크탑 사이드바 ── */}
      <aside className="hidden md:flex w-[220px] bg-[#1B4332] text-white flex-col flex-shrink-0 min-h-screen sticky top-0">
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center"><span className="text-lg">🍨</span></div>
            <div><p className="text-sm font-bold leading-tight">SCOOPS</p><p className="text-[10px] text-white/40">관리자 대시보드</p></div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${activeTab === t.key ? "bg-white/15 text-white font-semibold shadow-sm" : "text-white/60 hover:text-white/90 hover:bg-white/5"}`}>
              <span>{t.label}</span>
            </button>
          ))}
          <div className="h-px bg-white/10 my-3" />
          <p className="px-3 text-[10px] text-white/30 font-medium mb-1">관리 도구</p>
          <button onClick={() => router.push("/admin/orders")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/60 hover:text-white/90 hover:bg-white/5 transition-all">
            📦 주문 관리
          </button>
          <button onClick={() => router.push("/admin/orders/history")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/60 hover:text-white/90 hover:bg-white/5 transition-all">
            📋 주문 이력
          </button>
          <button onClick={() => router.push("/admin/inquiries")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/60 hover:text-white/90 hover:bg-white/5 transition-all">
            <span className="flex-1 text-left">📝 가맹 문의</span>
            {unreadCount > 0 && <span className="bg-red-500 text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{unreadCount}</span>}
          </button>
          <button onClick={() => router.push("/admin/customer")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/60 hover:text-white/90 hover:bg-white/5 transition-all">
            💬 고객의 소리
          </button>
          <button onClick={() => router.push("/admin/qr")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/60 hover:text-white/90 hover:bg-white/5 transition-all">
            📱 QR 코드
          </button>
          <div className="h-px bg-white/10 my-2" />
          <button onClick={refresh}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/60 hover:text-white/90 hover:bg-white/5 transition-all ${refreshing ? "animate-pulse" : ""}`}>
            🔄 새로고침
          </button>
        </nav>
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-white/40 hover:text-white/70 transition">🌐 사이트 열기</Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-white/40 hover:text-white/70 transition text-left">🚪 로그아웃</button>
        </div>
      </aside>

      {/* ── 모바일 상단바 ── */}
      <div className="md:hidden bg-[#1B4332] text-white sticky top-0 z-40 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍨</span>
            <span className="text-sm font-bold">SCOOPS</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => router.push("/admin/orders")} className="px-2.5 py-1.5 text-[11px] bg-white/10 rounded-lg active:bg-white/20">주문</button>
            <button onClick={() => router.push("/admin/inquiries")} className="relative px-2.5 py-1.5 text-[11px] bg-white/10 rounded-lg active:bg-white/20">
              문의{unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>}
            </button>
            <button onClick={refresh} className={`px-2.5 py-1.5 text-[11px] bg-white/10 rounded-lg active:bg-white/20 ${refreshing ? "animate-spin" : ""}`}>🔄</button>
            <button onClick={logout} className="px-2.5 py-1.5 text-[11px] bg-white/10 rounded-lg active:bg-white/20">나가기</button>
          </div>
        </div>
        <div className="flex">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 text-[12px] font-medium text-center transition-all border-b-2 ${activeTab === t.key ? "border-white text-white" : "border-transparent text-white/40"}`}>
              {t.mLabel}
            </button>
          ))}
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <main className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="text-center"><div className="w-8 h-8 border-3 border-[#1B4332]/20 border-t-[#1B4332] rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-400">불러오는 중...</p></div></div>
        ) : (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6">

          {/* ============ 홈 ============ */}
          {activeTab === "home" && <>
            {/* 인사 헤더 */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#1B4332]">안녕하세요, 사장님 👋</h1>
              <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })} 기준</p>
            </div>

            {/* 핵심 지표 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "오늘 방문자", val: a?.todayUniqueVisitors ?? "—", unit: "명", icon: "👤", accent: false },
                { label: "페이지 조회", val: a?.todayVisits ?? "—", unit: "회", icon: "📄", accent: false },
                { label: "바로 나간 비율", val: todayBounce, unit: "%", icon: "🚪", accent: todayBounce > 50 },
                { label: "평균 머문 시간", val: fmtDur(avgDur), unit: "", icon: "⏱️", accent: avgDur > 0 && avgDur < 15 },
              ].map((c, i) => (
                <Card key={i}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-gray-400 font-medium">{c.label}</span>
                    <span className="text-base opacity-70">{c.icon}</span>
                  </div>
                  <p className={`text-2xl md:text-3xl font-extrabold tracking-tight ${c.accent ? "text-red-500" : "text-[#1B4332]"}`}>
                    {c.val}<span className="text-sm font-medium text-gray-400 ml-0.5">{c.unit}</span>
                  </p>
                </Card>
              ))}
            </div>

            {/* 주문 현황 */}
            {orderSummary && (
              <Card>
                <SectionTitle title="오늘 QR 주문 현황" sub="전체 매장 합산" action={<Link href="/admin/orders" className="text-[11px] text-[#1B4332] font-semibold hover:underline">주문 관리 →</Link>} />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div className="bg-[#1B4332]/5 rounded-xl p-3">
                    <p className="text-[11px] text-gray-400">오늘 주문</p>
                    <p className="text-2xl font-extrabold text-[#1B4332]">{orderSummary.todayOrders}<span className="text-sm font-medium text-gray-400 ml-0.5">건</span></p>
                  </div>
                  <div className="bg-[#1B4332]/5 rounded-xl p-3">
                    <p className="text-[11px] text-gray-400">오늘 매출</p>
                    <p className="text-2xl font-extrabold text-[#1B4332]">{(orderSummary.todayRevenue / 10000).toFixed(1)}<span className="text-sm font-medium text-gray-400 ml-0.5">만원</span></p>
                  </div>
                  <div className="bg-[#1B4332]/5 rounded-xl p-3">
                    <p className="text-[11px] text-gray-400">QR 스캔</p>
                    <p className="text-2xl font-extrabold text-[#1B4332]">{orderSummary.qrScans}<span className="text-sm font-medium text-gray-400 ml-0.5">회</span></p>
                  </div>
                  <div className="bg-[#1B4332]/5 rounded-xl p-3">
                    <p className="text-[11px] text-gray-400">주문 전환율</p>
                    <p className={`text-2xl font-extrabold ${orderSummary.qrScans > 0 && (orderSummary.orderCompletes / orderSummary.qrScans) < 0.3 ? "text-red-500" : "text-[#1B4332]"}`}>
                      {orderSummary.qrScans > 0 ? Math.round((orderSummary.orderCompletes / orderSummary.qrScans) * 100) : 0}<span className="text-sm font-medium text-gray-400 ml-0.5">%</span>
                    </p>
                  </div>
                </div>
                {orderSummary.topItems.length > 0 && (
                  <div>
                    <p className="text-[11px] text-gray-400 mb-2">인기 메뉴 Top 3</p>
                    <div className="flex gap-2 flex-wrap">
                      {orderSummary.topItems.map((item, i) => (
                        <span key={i} className="text-[12px] bg-[#A68B5B]/10 text-[#8B6914] px-3 py-1.5 rounded-full font-medium">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {item.name} ({item.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* 알림 */}
            {(unreadCount > 0 || kakaoFailCount > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unreadCount > 0 && (
                  <Card className="bg-red-50 border-red-100" onClick={() => router.push("/admin/inquiries")}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-lg">📬</span></div>
                      <div className="flex-1"><p className="text-sm font-bold text-red-700">새 문의 {unreadCount}건</p><p className="text-[11px] text-red-500">터치해서 확인하세요</p></div>
                      <span className="text-xl font-bold text-red-500">{unreadCount}</span>
                    </div>
                  </Card>
                )}
                {kakaoFailCount > 0 && (
                  <Card className="bg-amber-50 border-amber-100" onClick={() => router.push("/admin/inquiries?filter=kakao-fail")}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-lg">⚠️</span></div>
                      <div className="flex-1"><p className="text-sm font-bold text-amber-700">카톡 전송 실패 {kakaoFailCount}건</p><p className="text-[11px] text-amber-500">직접 연락이 필요해요</p></div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* 최근 방문 */}
            <Card>
              <SectionTitle title="최근 방문자" sub="실시간 방문 기록" action={<button onClick={() => setActiveTab("visitors")} className="text-[11px] text-[#1B4332] font-semibold hover:underline">전체 →</button>} />
              {a?.recentSessions.length ? (
                <div className="divide-y divide-gray-50">
                  {a.recentSessions.slice(0, 6).map((s) => (
                    <div key={s.sid} className="flex items-center gap-3 py-2.5">
                      <span className="text-base">{dIcon[s.device] || "💻"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-gray-700 truncate font-medium">{s.pages.map(x => p(x.page)).join(" → ")}</p>
                        <p className="text-[11px] text-gray-400">{fmtTime(s.startAt)} · {s.browser} · {fmtDur(s.durationSec)}</p>
                      </div>
                      {s.isBounce ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium flex-shrink-0">바로나감</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B4332]/5 text-[#1B4332] font-medium flex-shrink-0">{s.pageCount}페이지</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-300 text-sm py-6 text-center">아직 방문 기록이 없어요</p>}
            </Card>

            {/* 2단 그리드: 인기페이지 + 접속기기 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card>
                <SectionTitle title="인기 페이지" sub="조회수 기준" />
                {a?.topPages.length ? (
                  <div className="space-y-2.5">
                    {a.topPages.slice(0, 5).map((tp, i) => {
                      const max = a.topPages[0]?.views || 1;
                      return (
                        <div key={tp.page}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] text-gray-600"><span className="text-gray-300 mr-1.5">{i + 1}</span>{pi(tp.page)} {p(tp.page)}</span>
                            <span className="text-[12px] font-bold text-[#1B4332]">{tp.views}회</span>
                          </div>
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#1B4332] to-[#40916C] rounded-full transition-all" style={{ width: `${(tp.views / max) * 100}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-gray-300 text-xs py-4 text-center">데이터 없음</p>}
              </Card>

              <Card>
                <SectionTitle title="접속 기기" sub="어떤 기기로 들어왔나" />
                {a?.deviceBreakdown.length ? (
                  <div className="space-y-3">
                    {a.deviceBreakdown.map((d) => {
                      const total = a.deviceBreakdown.reduce((s, x) => s + x.count, 0);
                      const pct = Math.round((d.count / total) * 100);
                      return (
                        <div key={d.device} className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-base">{dIcon[d.device] || "💻"}</span></div>
                          <div className="flex-1">
                            <div className="flex justify-between text-[12px] mb-1">
                              <span className="text-gray-600 font-medium">{dName[d.device] || d.device}</span>
                              <span className="font-bold text-[#1B4332]">{pct}%</span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#1B4332] to-[#40916C] rounded-full" style={{ width: `${pct}%` }} /></div>
                          </div>
                          <span className="text-[11px] text-gray-400 w-8 text-right flex-shrink-0">{d.count}명</span>
                        </div>
                      );
                    })}
                    {(a?.browserBreakdown || []).length > 0 && (
                      <div className="pt-2 border-t border-gray-50">
                        <p className="text-[10px] text-gray-400 mb-1.5">브라우저</p>
                        <div className="flex flex-wrap gap-1.5">
                          {a.browserBreakdown.map((b) => (
                            <span key={b.browser} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-lg"><strong className="text-[#1B4332]">{b.count}</strong> {b.browser}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : <p className="text-gray-300 text-xs py-4 text-center">데이터 없음</p>}
              </Card>
            </div>

            {/* 지역 분석 */}
            {geoData && (geoData.regionStats?.length > 0 || geoData.cityStats?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <SectionTitle title="📍 지역별 방문자" sub="시/도 단위" />
                <div className="space-y-2">
                  {(geoData.regionStats || []).slice(0, 8).map((r) => {
                    const max = geoData.regionStats[0]?.count || 1;
                    return (
                      <div key={r.region} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-20 truncate">{r.region}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div className="bg-[#1B4332] h-full rounded-full" style={{ width: `${(r.count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-8 text-right">{r.count}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card>
                <SectionTitle title="🏙️ 도시별 방문자" sub="구/시 단위" />
                <div className="space-y-2">
                  {(geoData.cityStats || []).slice(0, 8).map((c) => {
                    const max = geoData.cityStats[0]?.count || 1;
                    return (
                      <div key={c.city} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-20 truncate">{c.city}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div className="bg-[#A68B5B] h-full rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-8 text-right">{c.count}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card>
                <SectionTitle title="📡 통신사별" sub="ISP 분포" />
                <div className="space-y-2">
                  {(geoData.ispStats || []).slice(0, 6).map((isp) => {
                    const max = geoData.ispStats[0]?.count || 1;
                    return (
                      <div key={isp.isp} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-28 truncate">{isp.isp}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div className="bg-[#2D6A4F] h-full rounded-full" style={{ width: `${(isp.count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-8 text-right">{isp.count}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
            )}

            {/* 일별 추이 */}
            <Card>
              <SectionTitle title="일별 방문 추이" sub="최근 14일" />
              {a?.dailyTrend.length ? (
                <div className="flex items-end gap-1 h-28 md:h-36">
                  {a.dailyTrend.slice(0, 14).reverse().map((d) => {
                    const max = Math.max(...a.dailyTrend.map((x) => x.sessions), 1);
                    const h = d.sessions > 0 ? Math.max((d.sessions / max) * 100, 8) : 4;
                    const isToday = d.date === todayStr;
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                        {d.sessions > 0 && <span className="text-[9px] font-bold text-gray-500">{d.sessions}</span>}
                        <div className={`w-full rounded-t-sm transition-all ${isToday ? "bg-[#D4A574]" : d.sessions > 0 ? "bg-[#1B4332]" : "bg-gray-100"}`} style={{ height: `${h}%` }} />
                        <span className={`text-[8px] ${isToday ? "text-[#D4A574] font-bold" : "text-gray-400"}`}>{d.date.slice(8)}일</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-gray-300 text-xs py-8 text-center">데이터가 쌓이면 그래프가 나와요</p>}
            </Card>

            {/* 전체 누적 */}
            <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-2xl p-5 text-white">
              <p className="text-[11px] text-white/50 mb-3 font-medium">전체 누적 통계</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { v: a?.totalVisits ?? 0, l: "페이지 조회" },
                  { v: a?.totalSessions ?? 0, l: "총 방문" },
                  { v: `${a?.bounceRate ?? 0}%`, l: "바로나감" },
                  { v: pagesPerVisit, l: "방문당 페이지" },
                ].map((c, i) => (
                  <div key={i} className="text-center">
                    <p className="text-lg md:text-xl font-extrabold">{c.v}</p>
                    <p className="text-[9px] text-white/50 mt-0.5">{c.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/* ============ 방문 기록 ============ */}
          {activeTab === "visitors" && <>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#1B4332]">방문 기록</h1>
              <p className="text-xs text-gray-400 mt-0.5">터치하면 이동 경로를 상세히 볼 수 있어요</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: "전체 방문", v: a?.totalSessions ?? 0 },
                { l: "전체 조회", v: a?.totalVisits ?? 0 },
                { l: "바로나감", v: `${a?.bounceRate ?? 0}%` },
                { l: "오늘 방문", v: a?.todaySessions ?? 0 },
              ].map((c, i) => (
                <Card key={i}><p className="text-[10px] text-gray-400 mb-1">{c.l}</p><p className="text-xl font-extrabold text-[#1B4332]">{c.v}</p></Card>
              ))}
            </div>

            <Card className="!p-0 overflow-hidden">
              {a?.recentSessions.length ? (
                <div className="divide-y divide-gray-50">
                  {a.recentSessions.map((s) => (
                    <div key={s.sid}>
                      <button onClick={() => setExpandedSession(expandedSession === s.sid ? null : s.sid)}
                        className="w-full flex items-center gap-2 md:gap-3 px-4 py-3.5 text-left hover:bg-gray-50/70 active:bg-gray-50 transition-colors">
                        <span className="text-base flex-shrink-0">{dIcon[s.device] || "💻"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-gray-700 truncate font-medium">{s.pages.map(x => p(x.page)).join(" → ")}</p>
                          <p className="text-[11px] text-gray-400">{fmtTime(s.startAt)} · {s.browser}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[11px] text-[#1B4332] font-semibold">{fmtDur(s.durationSec)}</span>
                          {s.isBounce && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">바로나감</span>}
                          <span className={`text-[10px] text-gray-300 transition-transform duration-200 ${expandedSession === s.sid ? "rotate-180" : ""}`}>▾</span>
                        </div>
                      </button>
                      {expandedSession === s.sid && (
                        <div className="bg-[#FAFBFC] px-4 py-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4 text-[11px]">
                            <span><span className="text-gray-400">IP</span> <span className="font-mono text-gray-600">{s.ip}</span></span>
                            <span><span className="text-gray-400">유입</span> {s.referrer === "direct" ? "직접 접속" : s.referrer || "직접 접속"}</span>
                            <span><span className="text-gray-400">기기</span> {dName[s.device] || s.device}</span>
                          </div>
                          <div className="relative pl-4">
                            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-200" />
                            {s.pages.map((step, i) => (
                              <div key={i} className="relative flex items-start gap-3 pb-3 last:pb-0">
                                <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 z-10 mt-0.5 ${
                                  i === 0 ? "bg-green-500 border-green-500" : i === s.pages.length - 1 ? "bg-red-500 border-red-500" : "bg-white border-[#1B4332]"}`} />
                                <div className="flex-1 flex flex-wrap items-center gap-1.5">
                                  <span className="text-[12px] font-medium text-gray-700">{pi(step.page)} {p(step.page)}</span>
                                  <span className="text-[10px] text-gray-400">{new Date(step.enterAt).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</span>
                                  {step.dwellSec > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{fmtDur(step.dwellSec)}</span>}
                                  {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">입장</span>}
                                  {i === s.pages.length - 1 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">나감</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-300 text-sm py-12 text-center">아직 방문 기록이 없어요</p>}
            </Card>
          </>}

          {/* ============ 페이지 분석 ============ */}
          {activeTab === "journey" && <>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#1B4332]">페이지 분석</h1>
              <p className="text-xs text-gray-400 mt-0.5">어떤 페이지가 잘 되고 있고, 어디가 문제인지 확인하세요</p>
            </div>

            {/* 이탈 + 이동 경로 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card>
                <SectionTitle title="🚪 많이 나가는 페이지" sub="이 페이지에서 사이트를 떠나는 비율" />
                {a?.exitPages.length ? (
                  <div className="space-y-3">
                    {a.exitPages.map((ep) => (
                      <div key={ep.page}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-gray-600">{pi(ep.page)} {p(ep.page)}</span>
                          <span className={`text-[12px] font-bold ${ep.exitRate > 50 ? "text-red-500" : ep.exitRate > 30 ? "text-amber-500" : "text-green-600"}`}>{ep.exitRate}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${ep.exitRate > 50 ? "bg-red-400" : ep.exitRate > 30 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${ep.exitRate}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-300 text-xs py-6 text-center">데이터 없음</p>}
              </Card>

              <Card>
                <SectionTitle title="🔀 이동 경로 패턴" sub="방문자들이 주로 이동하는 순서" />
                {a?.journeyFlows.length ? (
                  <div className="space-y-2">
                    {a.journeyFlows.slice(0, 7).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[12px]">
                        <span className="text-gray-300 w-4 flex-shrink-0">{i + 1}</span>
                        <span className="bg-gray-50 px-2 py-1 rounded-lg text-gray-700 font-medium">{p(f.from)}</span>
                        <span className="text-gray-300">→</span>
                        <span className="bg-gray-50 px-2 py-1 rounded-lg text-gray-700 font-medium">{p(f.to)}</span>
                        <span className="ml-auto font-bold text-[#1B4332]">{f.count}회</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-300 text-xs py-6 text-center">데이터 없음</p>}
              </Card>
            </div>

            {/* 성적표 */}
            <Card>
              <SectionTitle title="📋 페이지별 성적표" sub="각 페이지의 조회수, 이탈률, 체류시간" />
              {a?.topPages.length ? (
                <div className="space-y-2.5">
                  {a.topPages.map((tp) => (
                    <div key={tp.page} className="bg-[#FAFBFC] rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[13px] font-semibold text-gray-800">{pi(tp.page)} {p(tp.page)}</span>
                        {tp.exitRate > 50 ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">개선 필요</span>
                        : tp.exitRate > 30 ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">보통</span>
                        : <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">좋음</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-[15px] font-bold text-[#1B4332]">{tp.views}</p><p className="text-[10px] text-gray-400">조회수</p></div>
                        <div><p className={`text-[15px] font-bold ${tp.exitRate > 50 ? "text-red-500" : "text-[#1B4332]"}`}>{tp.exitRate}%</p><p className="text-[10px] text-gray-400">나간 비율</p></div>
                        <div><p className="text-[15px] font-bold text-[#1B4332]">{fmtDur(tp.avgDwell)}</p><p className="text-[10px] text-gray-400">평균 머묾</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-300 text-xs py-6 text-center">데이터 없음</p>}
            </Card>

            {/* 날짜별 */}
            <Card>
              <SectionTitle title="📅 날짜별 기록" />
              {a?.dailyTrend.length ? (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-[12px] min-w-[380px]">
                    <thead><tr className="border-b border-gray-200 text-gray-400">
                      <th className="text-left py-2 px-2 font-medium">날짜</th>
                      <th className="text-center py-2 px-2 font-medium">방문</th>
                      <th className="text-center py-2 px-2 font-medium">조회</th>
                      <th className="text-center py-2 px-2 font-medium">바로나감</th>
                      <th className="text-center py-2 px-2 font-medium">머묾</th>
                    </tr></thead>
                    <tbody>{a.dailyTrend.map((d) => (
                      <tr key={d.date} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-2.5 px-2 text-gray-600 font-medium">{d.date.slice(5)}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-[#1B4332]">{d.sessions}</td>
                        <td className="py-2.5 px-2 text-center text-gray-500">{d.pageViews}</td>
                        <td className="py-2.5 px-2 text-center text-gray-500">{d.bounceCount}</td>
                        <td className="py-2.5 px-2 text-center text-gray-500">{fmtDur(d.avgDurationSec)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="text-gray-300 text-xs py-6 text-center">데이터 없음</p>}
            </Card>
          </>}

          {/* ============ 바로가기 ============ */}
          {activeTab === "tools" && <>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#1B4332]">바로가기</h1>
              <p className="text-xs text-gray-400 mt-0.5">자주 쓰는 페이지를 빠르게 열 수 있어요</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: "🌐", label: "사이트 보기", desc: "scoopsgelato.kr", href: "/", external: false },
                { icon: "📝", label: "가맹 문의 관리", desc: `${unreadCount}건 미확인`, href: "/admin/inquiries", external: false },
                { icon: "🤝", label: "가맹 페이지", desc: "가맹문의 폼", href: "/franchise", external: false },
                { icon: "🔄", label: "업종변경 페이지", desc: "업종변경 안내", href: "/franchise/conversion", external: false },
                { icon: "📊", label: "AI 상권분석", desc: "여기돼? 사이트", href: "https://www.xn--ok0bz3ittr.kr/", external: true },
                { icon: "📍", label: "매장안내", desc: "매장 정보", href: "/stores", external: false },
                { icon: "🍨", label: "메뉴 페이지", desc: "메뉴 구성", href: "/menu", external: false },
                { icon: "📖", label: "스토리", desc: "브랜드 소개", href: "/story", external: false },
                { icon: "🔒", label: "개인정보처리방침", desc: "법적 고지", href: "/privacy", external: false },
              ].map((item, i) => {
                const cls = "bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 hover:shadow-md hover:border-[#1B4332]/15 active:scale-[0.98] transition-all block";
                const inner = <><span className="text-2xl block mb-2">{item.icon}</span><p className="text-[13px] font-semibold text-gray-800">{item.label}</p><p className="text-[10px] text-gray-400 mt-0.5">{item.desc}{item.external ? " ↗" : ""}</p></>;
                return item.external
                  ? <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                  : <Link key={i} href={item.href} className={cls}>{inner}</Link>;
              })}
            </div>

            <Card className="bg-[#FAFBFC]">
              <h3 className="text-[13px] font-bold text-[#1B4332] mb-3">💡 용어 설명</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-gray-500">
                <div className="flex gap-2"><span className="text-gray-300">•</span><div><strong className="text-gray-700">바로 나감</strong> 한 페이지만 보고 사이트를 떠남. 50% 이하면 좋아요.</div></div>
                <div className="flex gap-2"><span className="text-gray-300">•</span><div><strong className="text-gray-700">평균 머문 시간</strong> 방문자가 사이트에서 보낸 시간. 30초 이상이면 OK.</div></div>
                <div className="flex gap-2"><span className="text-gray-300">•</span><div><strong className="text-gray-700">나간 비율</strong> 해당 페이지에서 떠난 비율. 높으면 콘텐츠 보강 필요.</div></div>
                <div className="flex gap-2"><span className="text-gray-300">•</span><div><strong className="text-gray-700">방문 경로</strong> 홈→메뉴→가맹문의처럼 이동한 순서.</div></div>
              </div>
            </Card>
          </>}

        </div>
        )}
      </main>
    </div>
  );
}
