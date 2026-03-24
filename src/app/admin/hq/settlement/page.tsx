"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, TrendingUp, AlertTriangle, Plus, X, Search, ArrowUpDown } from "lucide-react";

interface Customer {
  id: string; store_name: string; owner_name: string; phone: string;
  totalSupply: number; totalPaid: number; balance: number;
}
interface Transaction {
  id: string; customer_id: string; transaction_date: string; title: string;
  total_amount: number; supply_amount: number; tax_amount: number; status: string;
}
interface Payment {
  id: string; customer_id: string; payment_date: string; amount: number; memo: string;
}

function fmt(n: number) { return n.toLocaleString() + "원"; }

export default function SettlementPage() {
  const [tab, setTab] = useState<"overview" | "transactions" | "payments" | "products">("overview");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 모달
  const [showAddTrans, setShowAddTrans] = useState(false);
  const [showAddPay, setShowAddPay] = useState(false);
  const [newTrans, setNewTrans] = useState({ customerId: "", date: new Date().toISOString().split("T")[0], title: "", totalAmount: "", memo: "" });
  const [newPay, setNewPay] = useState({ customerId: "", date: new Date().toISOString().split("T")[0], amount: "", memo: "" });

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/fms/settlement?view=overview", { cache: "no-store" });
      if (!res.ok) throw new Error("데이터 로드 실패");
      const data = await res.json();
      setCustomers(data.customers || []);
      setTransactions(data.recentTransactions || []);
      setPayments(data.recentPayments || []);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchTransactions = async (custId?: string) => {
    const url = `/api/fms/settlement?view=transactions${custId ? "&customerId=" + custId : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) { const d = await res.json(); setTransactions(d.transactions || []); }
  };

  const fetchPayments = async (custId?: string) => {
    const url = `/api/fms/settlement?view=payments${custId ? "&customerId=" + custId : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) { const d = await res.json(); setPayments(d.payments || []); }
  };

  useEffect(() => {
    if (tab === "transactions") fetchTransactions(selectedCustomer);
    if (tab === "payments") fetchPayments(selectedCustomer);
  }, [tab, selectedCustomer]);

  const addTransaction = async () => {
    if (!newTrans.customerId || !newTrans.title || !newTrans.totalAmount) return;
    const res = await fetch("/api/fms/settlement", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "transaction", customerId: newTrans.customerId, date: newTrans.date, title: newTrans.title, totalAmount: parseInt(newTrans.totalAmount), memo: newTrans.memo }),
    });
    if (res.ok) { setShowAddTrans(false); setNewTrans({ customerId: "", date: new Date().toISOString().split("T")[0], title: "", totalAmount: "", memo: "" }); fetchData(); }
  };

  const addPayment = async () => {
    if (!newPay.customerId || !newPay.amount) return;
    const res = await fetch("/api/fms/settlement", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "payment", customerId: newPay.customerId, date: newPay.date, amount: parseInt(newPay.amount), memo: newPay.memo }),
    });
    if (res.ok) { setShowAddPay(false); setNewPay({ customerId: "", date: new Date().toISOString().split("T")[0], amount: "", memo: "" }); fetchData(); }
  };

  const totalSupply = customers.reduce((s, c) => s + c.totalSupply, 0);
  const totalPaid = customers.reduce((s, c) => s + c.totalPaid, 0);
  const totalBalance = customers.reduce((s, c) => s + c.balance, 0);
  const overdue = customers.filter(c => c.balance > 500000);

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.store_name || id;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">로딩 중...</div></div>;
  if (error) return <div className="bg-red-50 rounded-xl p-4 text-red-600 text-sm">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">정산 관리</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowAddPay(true)} className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white text-xs rounded-lg"><Plus size={14} /> 입금 등록</button>
          <button onClick={() => setShowAddTrans(true)} className="flex items-center gap-1 px-3 py-2 bg-[#1B4332] text-white text-xs rounded-lg"><Plus size={14} /> 출고 등록</button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "총 공급액", value: fmt(totalSupply), icon: <TrendingUp size={18} />, color: "bg-green-50 text-green-600" },
          { label: "총 입금액", value: fmt(totalPaid), icon: <DollarSign size={18} />, color: "bg-blue-50 text-blue-600" },
          { label: "미수금 합계", value: fmt(totalBalance), icon: <AlertTriangle size={18} />, color: totalBalance > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600" },
          { label: "주의 거래처", value: overdue.length + "곳", icon: <AlertTriangle size={18} />, color: overdue.length > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-600" },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${c.color}`}>{c.icon}</div>
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className="text-lg font-bold text-gray-800 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          { key: "overview" as const, label: "거래처 현황" },
          { key: "transactions" as const, label: "출고 내역" },
          { key: "payments" as const, label: "입금 내역" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${tab === t.key ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-600"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 거래처 현황 */}
      {tab === "overview" && (
        <div className="space-y-2">
          {customers.sort((a, b) => b.balance - a.balance).map(c => (
            <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{c.store_name}</h3>
                  {c.owner_name && <p className="text-xs text-gray-400">{c.owner_name} {c.phone && `· ${c.phone}`}</p>}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.balance > 500000 ? "bg-red-100 text-red-600" : c.balance > 0 ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"}`}>
                  {c.balance > 0 ? "미수 " + fmt(c.balance) : "정산 완료"}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>공급: {fmt(c.totalSupply)}</span>
                <span>입금: {fmt(c.totalPaid)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 출고 내역 */}
      {tab === "transactions" && (
        <div>
          <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mb-3">
            <option value="">전체 거래처</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.store_name}</option>)}
          </select>
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.transaction_date} · {getCustomerName(t.customer_id)}</p>
                </div>
                <p className="text-sm font-bold text-gray-800">{fmt(t.total_amount)}</p>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-center text-sm text-gray-400 py-8">출고 내역이 없습니다</p>}
          </div>
        </div>
      )}

      {/* 입금 내역 */}
      {tab === "payments" && (
        <div>
          <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mb-3">
            <option value="">전체 거래처</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.store_name}</option>)}
          </select>
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">입금</p>
                  <p className="text-xs text-gray-400">{p.payment_date} · {getCustomerName(p.customer_id)} {p.memo && `· ${p.memo}`}</p>
                </div>
                <p className="text-sm font-bold text-blue-600">+{fmt(p.amount)}</p>
              </div>
            ))}
            {payments.length === 0 && <p className="text-center text-sm text-gray-400 py-8">입금 내역이 없습니다</p>}
          </div>
        </div>
      )}

      {/* 출고 등록 모달 */}
      {showAddTrans && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowAddTrans(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">출고 등록</h3>
              <button onClick={() => setShowAddTrans(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <select value={newTrans.customerId} onChange={e => setNewTrans({...newTrans, customerId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">거래처 선택 *</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.store_name}</option>)}
              </select>
              <input type="date" value={newTrans.date} onChange={e => setNewTrans({...newTrans, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="품목 (예: 젤라또베이스 1box)" value={newTrans.title} onChange={e => setNewTrans({...newTrans, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="number" placeholder="금액 (원)" value={newTrans.totalAmount} onChange={e => setNewTrans({...newTrans, totalAmount: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="메모 (선택)" value={newTrans.memo} onChange={e => setNewTrans({...newTrans, memo: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <button onClick={addTransaction} className="w-full py-3 bg-[#1B4332] text-white rounded-lg text-sm font-medium">등록</button>
            </div>
          </div>
        </div>
      )}

      {/* 입금 등록 모달 */}
      {showAddPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowAddPay(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">입금 등록</h3>
              <button onClick={() => setShowAddPay(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <select value={newPay.customerId} onChange={e => setNewPay({...newPay, customerId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">거래처 선택 *</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.store_name}</option>)}
              </select>
              <input type="date" value={newPay.date} onChange={e => setNewPay({...newPay, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="number" placeholder="입금액 (원) *" value={newPay.amount} onChange={e => setNewPay({...newPay, amount: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="메모 (선택)" value={newPay.memo} onChange={e => setNewPay({...newPay, memo: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <button onClick={addPayment} className="w-full py-3 bg-blue-500 text-white rounded-lg text-sm font-medium">등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
