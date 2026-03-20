"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  TrendingUp,
  Users,
  ShoppingCart,
  Smartphone,
  QrCode,
  Wine,
  IceCream,
  ArrowRight,
  BarChart3,
  Clock,
  RefreshCw,
} from "lucide-react";

interface AnalyticsData {
  totalEvents: number;
  eventCounts: Record<string, number>;
  dailyEvents: Record<string, Record<string, number>>;
  hourlyOrders: number[];
  storeScans: Record<string, number>;
  orderTypes: Record<string, number>;
  flavorCounts: Record<string, number>;
  drinkCounts: Record<string, number>;
  infoClicks: Record<string, number>;
  pairingCount: number;
  funnel: { qrScan: number; orderType: number; cartView: number; orderComplete: number };
  devices: Record<string, number>;
  recent: { event: string; storeCode?: string; data?: Record<string, unknown>; timestamp: string }[];
}

const EVENT_LABELS: Record<string, string> = {
  qr_scan: "QR 스캔",
  order_type: "주문유형 선택",
  gelato_select: "젤라또 맛 수 선택",
  gelato_cart: "젤라또 담기",
  drink_view: "주류 탭 열기",
  drink_item: "주류 아이템 클릭",
  drink_cart: "주류 담기",
  drink_info: "주류 설명 보기",
  pairing_cart: "추천 페어링 담기",
  age_confirm: "연령 확인",
  cart_view: "장바구니 진입",
  order_complete: "주문 완료",
  pwa_banner: "PWA 배너 노출",
  pwa_install: "PWA 설치",
  pwa_dismiss: "PWA 다음에",
  link_homepage: "홈페이지 클릭",
  link_instagram: "인스타 클릭",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/tracking?days=${days}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [days]);

  const sortedEntries = (obj: Record<string, number>) =>
    Object.entries(obj).sort(([, a], [, b]) => b - a);

  const funnelRate = (a: number, b: number) =>
    b > 0 ? `${Math.round((a / b) * 100)}%` : "-";

  if (!data && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">QR 주문 분석</h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1"
            >
              <option value={1}>오늘</option>
              <option value={7}>7일</option>
              <option value={30}>30일</option>
            </select>
            <button onClick={fetchData} className="p-1.5 rounded-lg hover:bg-gray-100">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      {data && (
        <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">

          {/* ▸ 주문 퍼널 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" /> 주문 퍼널
            </h2>
            <div className="space-y-3">
              {[
                { label: "QR 스캔", value: data.funnel.qrScan, color: "bg-blue-500" },
                { label: "유형 선택", value: data.funnel.orderType, color: "bg-indigo-500" },
                { label: "장바구니", value: data.funnel.cartView, color: "bg-purple-500" },
                { label: "주문 완료", value: data.funnel.orderComplete, color: "bg-emerald-500" },
              ].map((step, i, arr) => (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{step.label}</span>
                    <span className="font-bold text-gray-900">
                      {step.value}건
                      {i > 0 && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({funnelRate(step.value, arr[0].value)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color} rounded-full transition-all`}
                      style={{ width: `${arr[0].value ? (step.value / arr[0].value) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {data.funnel.qrScan > 0 && (
              <p className="text-xs text-gray-400 mt-3">
                전환율: QR 스캔 → 주문완료 {funnelRate(data.funnel.orderComplete, data.funnel.qrScan)}
              </p>
            )}
          </div>

          {/* ▸ 핵심 지표 4개 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <QrCode size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">QR 스캔</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{data.eventCounts["qr_scan"] || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">주문 완료</span>
              </div>
              <p className="text-2xl font-black text-emerald-600">{data.eventCounts["order_complete"] || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">PWA 설치</span>
              </div>
              <p className="text-2xl font-black text-blue-600">{data.eventCounts["pwa_install"] || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wine size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">주류 설명 클릭</span>
              </div>
              <p className="text-2xl font-black text-amber-600">{data.eventCounts["drink_info"] || 0}</p>
            </div>
          </div>

          {/* ▸ 주문유형 비율 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users size={16} className="text-indigo-500" /> 주문유형 비율
            </h2>
            <div className="flex gap-4">
              <div className="flex-1 bg-[#1B4332]/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-[#1B4332]">{data.orderTypes["dine_in"] || 0}</p>
                <p className="text-xs text-gray-500 mt-1">매장식사</p>
              </div>
              <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-amber-600">{data.orderTypes["takeaway"] || 0}</p>
                <p className="text-xs text-gray-500 mt-1">포장</p>
              </div>
            </div>
          </div>

          {/* ▸ 디바이스 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Smartphone size={16} className="text-gray-500" /> 디바이스
            </h2>
            <div className="flex gap-4">
              {sortedEntries(data.devices).map(([device, count]) => (
                <div key={device} className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">{device}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ▸ 인기 젤라또 맛 */}
          {Object.keys(data.flavorCounts).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <IceCream size={16} className="text-pink-500" /> 인기 젤라또 맛 TOP 10
              </h2>
              <div className="space-y-2">
                {sortedEntries(data.flavorCounts).slice(0, 10).map(([name, count], i) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                      <span className="text-sm text-gray-700">{name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{count}회</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ▸ 인기 주류 */}
          {Object.keys(data.drinkCounts).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Wine size={16} className="text-amber-500" /> 인기 주류 TOP 10
              </h2>
              <div className="space-y-2">
                {sortedEntries(data.drinkCounts).slice(0, 10).map(([name, count], i) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                      <span className="text-sm text-gray-700">{name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{count}회</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ▸ 주류 설명 클릭 순위 */}
          {Object.keys(data.infoClicks).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-violet-500" /> 주류 설명 클릭 순위
              </h2>
              <div className="space-y-2">
                {sortedEntries(data.infoClicks).map(([name, count], i) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                      <span className="text-sm text-gray-700">{name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{count}회</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ▸ 추천 페어링 전환 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ArrowRight size={16} className="text-emerald-500" /> 추천 페어링 → 장바구니
            </h2>
            <p className="text-2xl font-black text-emerald-600">{data.pairingCount}건</p>
            <p className="text-xs text-gray-400 mt-1">
              주류 설명 팝업에서 추천 젤라또+주류를 함께 담은 횟수
            </p>
          </div>

          {/* ▸ 매장별 QR 스캔 */}
          {Object.keys(data.storeScans).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <QrCode size={16} className="text-gray-500" /> 매장별 QR 스캔
              </h2>
              <div className="space-y-2">
                {sortedEntries(data.storeScans).map(([code, count]) => (
                  <div key={code} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{code}</span>
                    <span className="text-sm font-bold text-gray-900">{count}회</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ▸ 시간대별 주문 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-orange-500" /> 시간대별 주문
            </h2>
            <div className="flex items-end gap-1 h-24">
              {data.hourlyOrders.map((count, hour) => {
                const max = Math.max(...data.hourlyOrders, 1);
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-orange-400 rounded-t"
                      style={{ height: `${(count / max) * 80}px`, minHeight: count > 0 ? 4 : 0 }}
                    />
                    {hour % 4 === 0 && (
                      <span className="text-[8px] text-gray-400 mt-1">{hour}시</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ▸ 전체 이벤트 카운트 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3">전체 이벤트 ({data.totalEvents}건)</h2>
            <div className="space-y-1">
              {sortedEntries(data.eventCounts).map(([event, count]) => (
                <div key={event} className="flex items-center justify-between py-1">
                  <span className="text-xs text-gray-600">{EVENT_LABELS[event] || event}</span>
                  <span className="text-xs font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ▸ 최근 이벤트 로그 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3">최근 이벤트</h2>
            <div className="space-y-2">
              {data.recent.map((ev, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                      {EVENT_LABELS[ev.event] || ev.event}
                    </span>
                    {ev.storeCode && <span className="text-gray-400">{ev.storeCode}</span>}
                    {ev.data && (
                      <span className="text-gray-400 truncate max-w-[150px]">
                        {JSON.stringify(ev.data).slice(0, 40)}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 flex-shrink-0">
                    {new Date(ev.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
