"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface AnalyticsData {
  totalVisits: number;
  todayVisits: number;
  dailyStats: { date: string; count: number }[];
  pageStats: { path: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const authRes = await fetch("/api/admin");
    const authData = await authRes.json();
    if (!authData.authenticated) { router.push("/admin/login"); return; }

    const res = await fetch("/api/analytics");
    const analytics = await res.json();
    setData(analytics);
    setLoading(false);
  };

  const pageLabel = (path: string) => {
    const labels: Record<string, string> = {
      "/": "홈",
      "/menu": "시그니처 젤라또",
      "/menu/sorbetto": "소르베또",
      "/menu/coffee": "커피",
      "/menu/dessert": "디저트",
      "/story": "스쿱스 소개",
      "/story/brand": "브랜드 스토리",
      "/story/location": "찾아오시는길",
      "/franchise": "스쿱스 경쟁력",
      "/franchise/inquiry": "가맹 상담신청",
      "/franchise/process": "개설절차",
      "/franchise/cost": "개설비용",
      "/franchise/faq": "가맹 Q&A",
      "/stores": "매장 찾기",
      "/news": "스쿱스 소식",
      "/news/events": "이벤트",
      "/customer": "고객의 소리",
    };
    return labels[path] || path;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">로딩 중...</p></div>;

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 relative"><Image src="/images/logo_symbol.png" alt="SCOOPS" fill className="object-contain" /></div>
            <div>
              <h1 className="text-sm font-semibold text-gray-800">방문자 통계</h1>
              <p className="text-xs text-gray-400">SCOOPS ADMIN</p>
            </div>
          </Link>
          <Link href="/admin" className="text-xs text-gray-500 hover:text-gray-800">← 대시보드</Link>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* 요약 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">오늘 방문자</p>
            <p className="text-3xl font-semibold text-gray-800 mt-1">{data?.todayVisits || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">총 방문</p>
            <p className="text-3xl font-semibold text-gray-800 mt-1">{data?.totalVisits || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 일별 통계 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">일별 방문 추이</h3>
            {data?.dailyStats && data.dailyStats.length > 0 ? (
              <div className="space-y-2">
                {data.dailyStats.map((day) => {
                  const maxCount = Math.max(...data.dailyStats.map((d) => d.count));
                  const width = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-20 shrink-0">{day.date.slice(5)}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${width}%` }} />
                      </div>
                      <span className="text-xs text-gray-600 w-8 text-right">{day.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">아직 데이터가 없습니다.</p>
            )}
          </div>

          {/* 인기 페이지 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">인기 페이지</h3>
            {data?.pageStats && data.pageStats.length > 0 ? (
              <div className="space-y-3">
                {data.pageStats.map((page, i) => (
                  <div key={page.path} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      i < 3 ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-500"
                    }`}>{i + 1}</span>
                    <span className="text-sm text-gray-700 flex-1">{pageLabel(page.path)}</span>
                    <span className="text-sm text-gray-500 font-medium">{page.count}회</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">아직 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
