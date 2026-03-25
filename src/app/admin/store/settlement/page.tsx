"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Check, Clock, ChevronRight } from "lucide-react";

interface Transaction {
  id: string;
  customer_id: string;
  transaction_date: string;
  title: string;
  items: any[];
  supply_amount: number;
  tax_amount: number;
  total_amount: number;
  invoice_number: string;
  status: string;
}

interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  memo: string;
}

interface Customer {
  id: string;
  store_name: string;
  outstanding_balance: number;
}

export default function StoreSettlementPage() {
  const [tab, setTab] = useState<"overview" | "invoices" | "payments">("overview");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const fmt = (n: number) => n?.toLocaleString("ko-KR") + "원";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/fms/settlement/invoice", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/fms/settlement?view=overview", { cache: "no-store" }).then(r => r.json()),
    ]).then(([invoiceData, overviewData]) => {
      setTransactions(invoiceData.allTransactions || []);

      // 내 매장 찾기
      const custs = overviewData.customers || invoiceData.customers || [];
      if (custs.length > 0) {
        setCustomer(custs[0]); // 점주는 자기 매장 1개
        // 입금 내역도 가져오기
        fetch(`/api/fms/settlement?view=payments&customerId=${custs[0].id}`, { cache: "no-store" })
          .then(r => r.json())
          .then(d => setPayments(d.payments || []))
          .catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const invoices = transactions.filter(t => t.invoice_number);
  const monthInvoices = invoices.filter(t => t.transaction_date?.startsWith(month));
  const monthTotal = monthInvoices.reduce((s, t) => s + (t.total_amount || 0), 0);
  const monthSupply = monthInvoices.reduce((s, t) => s + (t.supply_amount || 0), 0);
  const monthTax = monthInvoices.reduce((s, t) => s + (t.tax_amount || 0), 0);

  const printInvoice = (t: Transaction) => {
    const items = Array.isArray(t.items) ? t.items : [];
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>거래명세서 ${t.invoice_number}</title>
    <style>
      @page { margin: 10mm; }
      body { font-family: 'IBM Plex Sans KR', sans-serif; font-size: 12px; color: #333; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #999; padding: 6px 8px; text-align: center; }
      th { background: #f5f0eb; font-weight: 600; }
      .header { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 16px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
      .info-box { border: 1px solid #999; padding: 8px; }
      .info-box h3 { margin: 0 0 4px; font-size: 11px; color: #666; }
      .info-box p { margin: 2px 0; font-size: 12px; }
      .total-row { font-weight: bold; background: #f9f6f2; }
      .footer { margin-top: 16px; text-align: center; font-size: 10px; color: #999; }
      .no { position: absolute; top: 10mm; right: 10mm; font-size: 11px; color: #666; }
    </style></head><body>
    <div class="no">No. ${t.invoice_number}</div>
    <div class="header">거 래 명 세 서</div>
    <div class="info-grid">
      <div class="info-box"><h3>공급자</h3><p><strong>스쿱스젤라또</strong></p><p>대표: 정석주</p><p>사업자: 470-22-00633</p><p>충북 청주시 서원구 1순환로672번길 35</p><p>TEL: 1811-0259</p></div>
      <div class="info-box"><h3>공급받는자</h3><p><strong>${customer?.store_name || ""}</strong></p></div>
    </div>
    <table>
      <thead><tr><th>월/일</th><th>품목</th><th>규격</th><th>수량</th><th>단가</th><th>공급가액</th><th>세액</th></tr></thead>
      <tbody>
        ${items.map(item => `<tr><td>${t.transaction_date?.substring(5) || ""}</td><td>${item.name || t.title}</td><td>${item.spec || ""}</td><td>${item.quantity || 1}</td><td>${(item.price || 0).toLocaleString()}</td><td>${(item.supply || item.price * (item.quantity || 1) || 0).toLocaleString()}</td><td>${(item.tax || 0).toLocaleString()}</td></tr>`).join("")}
        ${items.length === 0 ? `<tr><td>${t.transaction_date?.substring(5) || ""}</td><td>${t.title}</td><td></td><td>1</td><td>${(t.supply_amount || 0).toLocaleString()}</td><td>${(t.supply_amount || 0).toLocaleString()}</td><td>${(t.tax_amount || 0).toLocaleString()}</td></tr>` : ""}
        <tr class="total-row"><td colspan="5">합계</td><td>${(t.supply_amount || 0).toLocaleString()}</td><td>${(t.tax_amount || 0).toLocaleString()}</td></tr>
      </tbody>
    </table>
    <p style="text-align:right; margin-top:8px; font-size:14px; font-weight:bold;">합계금액: ${(t.total_amount || 0).toLocaleString()}원</p>
    <div class="footer">스쿱스 젤라떼리아 | SCOOPS GELATERIA | 1811-0259</div>
    </body></html>`;

    const w = window.open("", "_blank", "width=800,height=900");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">로딩 중...</div>;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">정산 관리</h2>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">미수금</p>
          <p className={`text-xl font-bold ${(customer?.outstanding_balance || 0) > 0 ? "text-red-500" : "text-green-600"}`}>
            {fmt(customer?.outstanding_balance || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">{month} 공급액</p>
          <p className="text-xl font-bold text-gray-800">{fmt(monthTotal)}</p>
        </div>
      </div>

      {/* 부가세 요약 */}
      <div className="bg-amber-50 rounded-xl p-3 mb-4 flex justify-between text-xs">
        <span>공급가액: <strong>{fmt(monthSupply)}</strong></span>
        <span>부가세: <strong>{fmt(monthTax)}</strong></span>
        <span>합계: <strong>{fmt(monthTotal)}</strong></span>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "overview" as const, label: "거래명세서" },
          { key: "invoices" as const, label: "출고 내역" },
          { key: "payments" as const, label: "입금 내역" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm ${tab === t.key ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-600"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 월 선택 */}
      <input type="month" value={month} onChange={e => setMonth(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm mb-3" />

      {/* 거래명세서 */}
      {tab === "overview" && (
        <div className="space-y-2">
          {monthInvoices.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <FileText size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{month}월 발행된 거래명세서가 없습니다</p>
            </div>
          ) : (
            monthInvoices.map(t => (
              <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {t.status === "confirmed" ? "확인완료" : "발행"}
                      </span>
                      <span className="text-xs text-gray-400">No. {t.invoice_number}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-1">{t.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.transaction_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{fmt(t.total_amount)}</p>
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => printInvoice(t)} className="text-xs text-blue-500 flex items-center gap-0.5">
                        <Download size={12} /> PDF
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-2 text-[10px] text-gray-400 border-t border-gray-50 pt-2">
                  <span>공급가: {fmt(t.supply_amount)}</span>
                  <span>세액: {fmt(t.tax_amount)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 출고 내역 */}
      {tab === "invoices" && (
        <div className="space-y-2">
          {transactions.filter(t => t.transaction_date?.startsWith(month)).map(t => (
            <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.transaction_date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{fmt(t.total_amount)}</p>
                  {t.invoice_number && <p className="text-[10px] text-green-600">No. {t.invoice_number}</p>}
                </div>
              </div>
              <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                <span>공급가: {fmt(t.supply_amount)}</span>
                <span>세액: {fmt(t.tax_amount)}</span>
              </div>
            </div>
          ))}
          {transactions.filter(t => t.transaction_date?.startsWith(month)).length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">{month}월 출고 내역이 없습니다</p>
          )}
        </div>
      )}

      {/* 입금 내역 */}
      {tab === "payments" && (
        <div className="space-y-2">
          {payments.filter(p => p.payment_date?.startsWith(month)).map(p => (
            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{p.payment_date}</p>
                {p.memo && <p className="text-xs text-gray-400">{p.memo}</p>}
              </div>
              <p className="text-sm font-bold text-blue-600">+{fmt(p.amount)}</p>
            </div>
          ))}
          {payments.filter(p => p.payment_date?.startsWith(month)).length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">{month}월 입금 내역이 없습니다</p>
          )}
        </div>
      )}
    </div>
  );
}
