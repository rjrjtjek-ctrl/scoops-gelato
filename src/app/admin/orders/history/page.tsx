"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Calendar } from "lucide-react";
import { stores, formatPrice } from "@/lib/order-data";
import type { Order } from "@/lib/order-types";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStore, setSelectedStore] = useState(stores.find((s) => s.isActive)?.id || "");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  useEffect(() => {
    if (!selectedStore) return;
    fetch(`/api/order?storeId=${selectedStore}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]));
  }, [selectedStore]);

  const filtered = orders.filter((o) => {
    const orderDate = o.createdAt.slice(0, 10);
    if (orderDate !== dateFilter) return false;
    if (typeFilter !== "all" && o.orderType !== typeFilter) return false;
    if (paymentFilter !== "all" && o.paymentStatus !== paymentFilter) return false;
    return true;
  });

  const dailyTotal = filtered
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handleCSVDownload = () => {
    if (filtered.length === 0) {
      alert("다운로드할 데이터가 없습니다");
      return;
    }

    const BOM = "\uFEFF";
    const header = "주문번호,매장,주문유형,아이템,합계,결제상태,결제수단,주문시간\n";
    const rows = filtered
      .map((o) => {
        const storeName = stores.find((s) => s.id === o.storeId)?.name || "";
        const itemSummary = o.items.map((i) => `${i.itemName} ${i.optionName}`).join(" / ");
        const time = new Date(o.createdAt).toLocaleString("ko-KR");
        return `${o.orderNumber},${storeName},${o.orderType === "dine_in" ? "매장식사" : "포장"},"${itemSummary}",${o.totalAmount},${o.paymentStatus === "paid" ? "결제완료" : "미결제"},${o.paymentMethod || "-"},${time}`;
      })
      .join("\n");

    const blob = new Blob([BOM + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `주문이력_${dateFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">주문 이력</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* 필터 */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {stores.filter((s) => s.isActive).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm border-none outline-none bg-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">전체 유형</option>
            <option value="dine_in">매장식사</option>
            <option value="takeaway">포장</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">전체 결제</option>
            <option value="paid">결제완료</option>
            <option value="unpaid">미결제</option>
          </select>

          <button
            onClick={handleCSVDownload}
            className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium"
          >
            <Download size={14} /> CSV 다운로드
          </button>
        </div>

        {/* 매출 요약 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">일 매출 ({dateFilter})</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(dailyTotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">주문 건수</p>
              <p className="text-lg font-bold text-gray-900">{filtered.length}건</p>
            </div>
          </div>
        </div>

        {/* 주문 목록 */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            해당 날짜에 주문이 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{order.orderNumber}</span>
                  <span className="text-xs text-gray-400">
                    {order.orderType === "dine_in" ? "매장" : "포장"}
                  </span>
                  <span className="text-xs text-gray-500 max-w-[200px] truncate">
                    {order.items.map((i) => i.itemName).join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.paymentStatus === "paid" ? "결제완료" : "미결제"}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
