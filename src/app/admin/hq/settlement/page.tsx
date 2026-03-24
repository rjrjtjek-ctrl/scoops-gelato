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
interface Product {
  id: string; name: string; spec: string; unit: string; price: number; category: string;
}
interface CartItem {
  productId: string; name: string; quantity: number; price: number; subtotal: number;
}

function fmt(n: number) { return n.toLocaleString() + "원"; }

export default function SettlementPage() {
  const [tab, setTab] = useState<"overview" | "transactions" | "payments" | "products">("overview");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 모달
  const [showAddTrans, setShowAddTrans] = useState(false);
  const [showAddPay, setShowAddPay] = useState(false);
  const [newTrans, setNewTrans] = useState({ customerId: "", date: new Date().toISOString().split("T")[0], title: "", totalAmount: "", memo: "" });
  const [newPay, setNewPay] = useState({ customerId: "", date: new Date().toISOString().split("T")[0], amount: "", memo: "" });
  // 출고 등록 — 제품 선택 장바구니
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState("");

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

  // 제품 로드
  useEffect(() => {
    fetch("/api/fms/settlement?view=products", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === p.id);
      if (existing) return prev.map(c => c.productId === p.id ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.price } : c);
      return [...prev, { productId: p.id, name: p.name, quantity: 1, price: p.price, subtotal: p.price }];
    });
  };
  const removeFromCart = (productId: string) => setCart(prev => prev.filter(c => c.productId !== productId));
  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(c => c.productId === productId ? { ...c, quantity: qty, subtotal: qty * c.price } : c));
  };
  const cartTotal = cart.reduce((s, c) => s + c.subtotal, 0);

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

  const totalBalance = customers.reduce((s, c) => s + (c.balance || 0), 0);
  const activeCustomers = customers.filter(c => (c.balance || 0) > 0);
  const overdue = customers.filter(c => (c.balance || 0) > 500000);

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
          { label: "미수금 합계", value: fmt(totalBalance), icon: <DollarSign size={18} />, color: totalBalance > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600" },
          { label: "미수 거래처", value: activeCustomers.length + "곳", icon: <TrendingUp size={18} />, color: activeCustomers.length > 0 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600" },
          { label: "거래처 수", value: customers.length + "곳", icon: <Search size={18} />, color: "bg-blue-50 text-blue-600" },
          { label: "제품 수", value: products.length + "종", icon: <ArrowUpDown size={18} />, color: "bg-purple-50 text-purple-600" },
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
          { key: "products" as const, label: "제품 단가" },
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
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => { setSelectedCustomer(c.id); setTab("transactions"); }}
                  className="text-xs text-blue-500 hover:underline">출고 내역</button>
                <span className="text-xs text-gray-300">|</span>
                <button onClick={() => { setSelectedCustomer(c.id); setTab("payments"); }}
                  className="text-xs text-blue-500 hover:underline">입금 내역</button>
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
              <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.transaction_date} · {getCustomerName(t.customer_id)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800">{fmt(t.total_amount)}</p>
                </div>
                {(t.supply_amount > 0 || t.tax_amount > 0) && (
                  <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                    <span>공급가: {fmt(t.supply_amount)}</span>
                    <span>부가세: {fmt(t.tax_amount)}</span>
                  </div>
                )}
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

      {/* 제품 단가 관리 */}
      {tab === "products" && (
        <div>
          <div className="flex gap-2 mb-3">
            <input placeholder="🔍 제품 검색..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            <button onClick={() => {
              const name = prompt("제품명:");
              if (!name) return;
              const spec = prompt("규격 (예: 박스, 바트, 팩):") || "";
              const price = parseInt(prompt("단가 (원):") || "0");
              const category = prompt("카테고리 (베이스/원재료/소모품/장비/기타):") || "기타";
              fetch("/api/fms/settlement", { method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "product", name, spec, price, category }),
              }).then(() => fetch("/api/fms/settlement?view=products", { cache: "no-store" })
                .then(r => r.json()).then(d => setProducts(d.products || [])));
            }} className="flex items-center gap-1 px-3 py-2 bg-[#1B4332] text-white text-xs rounded-lg whitespace-nowrap">
              <Plus size={14} /> 추가
            </button>
          </div>

          {/* 카테고리별 그룹 */}
          {(() => {
            const filtered = products.filter(p => !productSearch || p.name.includes(productSearch));
            const cats = [...new Set(filtered.map(p => p.category || "기타"))].sort();
            if (filtered.length === 0) return <p className="text-center text-sm text-gray-400 py-8">등록된 제품이 없습니다</p>;
            return cats.map(cat => {
              const items = filtered.filter(p => (p.category || "기타") === cat);
              return (
                <div key={cat} className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2 px-1">{cat} ({items.length})</p>
                  <div className="space-y-1">
                    {items.map(p => (
                      <div key={p.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.spec} {p.unit && `· ${p.unit}`}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <p className="text-sm font-bold text-[#1B4332]">{fmt(p.price)}</p>
                          <button onClick={() => {
                            const newPrice = prompt(p.name + " 단가 수정 (현재: " + p.price.toLocaleString() + "원):", String(p.price));
                            if (!newPrice) return;
                            fetch("/api/fms/settlement", { method: "PATCH", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ type: "product", id: p.id, price: parseInt(newPrice) }),
                            }).then(() => setProducts(prev => prev.map(pp => pp.id === p.id ? { ...pp, price: parseInt(newPrice) } : pp)));
                          }} className="text-xs text-blue-500">수정</button>
                          <button onClick={() => {
                            if (!confirm(p.name + " 삭제?")) return;
                            fetch("/api/fms/settlement?type=product&id=" + p.id, { method: "DELETE" })
                              .then(() => setProducts(prev => prev.filter(pp => pp.id !== p.id)));
                          }} className="text-xs text-red-400">삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* 출고 등록 모달 — 제품 선택 방식 */}
      {showAddTrans && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/30" onClick={() => { setShowAddTrans(false); setCart([]); }}>
          <div className="bg-white rounded-t-2xl lg:rounded-2xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">출고 등록</h3>
              <button onClick={() => { setShowAddTrans(false); setCart([]); }}><X size={20} className="text-gray-400" /></button>
            </div>

            {/* 거래처 + 날짜 */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <select value={newTrans.customerId} onChange={e => setNewTrans({...newTrans, customerId: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
                <option value="">거래처 *</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.store_name}</option>)}
              </select>
              <input type="date" value={newTrans.date} onChange={e => setNewTrans({...newTrans, date: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            </div>

            {/* 제품 선택 */}
            <div className="mb-3">
              <input placeholder="🔍 제품 검색해서 추가..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
              {productSearch && (
                <div className="max-h-32 overflow-y-auto border rounded-lg">
                  {products.filter(p => p.name.includes(productSearch)).slice(0, 8).map(p => (
                    <button key={p.id} onClick={() => { addToCart(p); setProductSearch(""); }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left text-sm border-b last:border-b-0">
                      <span>{p.name} <span className="text-gray-400 text-xs">{p.spec}</span></span>
                      <span className="text-xs text-[#1B4332] font-medium">{fmt(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 장바구니 */}
            {cart.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
                <p className="text-xs font-bold text-gray-500 mb-1">선택한 제품</p>
                {cart.map(c => (
                  <div key={c.productId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-800 flex-1">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQty(c.productId, c.quantity - 1)} className="w-6 h-6 bg-white border rounded text-xs">-</button>
                      <span className="text-sm font-medium w-6 text-center">{c.quantity}</span>
                      <button onClick={() => updateCartQty(c.productId, c.quantity + 1)} className="w-6 h-6 bg-white border rounded text-xs">+</button>
                      <span className="text-xs text-gray-500 w-20 text-right">{fmt(c.subtotal)}</span>
                      <button onClick={() => removeFromCart(c.productId)} className="text-red-400 text-xs">✕</button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-800">합계</span>
                  <span className="text-sm font-bold text-[#1B4332]">{fmt(cartTotal)}</span>
                </div>
              </div>
            )}

            {/* 직접 입력 (제품 목록에 없는 경우) */}
            <input placeholder="품목명 직접 입력 (제품 목록에 없는 경우)" value={newTrans.title} onChange={e => setNewTrans({...newTrans, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
            {!cart.length && <input type="number" placeholder="금액 직접 입력 (원)" value={newTrans.totalAmount} onChange={e => setNewTrans({...newTrans, totalAmount: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />}
            <input placeholder="메모 (선택)" value={newTrans.memo} onChange={e => setNewTrans({...newTrans, memo: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm mb-3" />

            <button onClick={() => {
              const title = cart.length > 0 ? cart.map(c => `${c.name} x${c.quantity}`).join(", ") : newTrans.title;
              const total = cart.length > 0 ? cartTotal : parseInt(newTrans.totalAmount || "0");
              if (!newTrans.customerId || !title || !total) return;
              fetch("/api/fms/settlement", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "transaction", customerId: newTrans.customerId, date: newTrans.date, title, items: cart, totalAmount: total, memo: newTrans.memo }),
              }).then(r => { if (r.ok) { setShowAddTrans(false); setCart([]); setNewTrans({ customerId: "", date: new Date().toISOString().split("T")[0], title: "", totalAmount: "", memo: "" }); fetchData(); } });
            }} className="w-full py-3 bg-[#1B4332] text-white rounded-lg text-sm font-medium">
              {cart.length > 0 ? `출고 등록 (${fmt(cartTotal)})` : "출고 등록"}
            </button>
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
