"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";

interface Product { id: string; name: string; brand: string; specification: string; category: string; searchKeyword: string; purchaseMode: string; isActive: boolean; }

export default function HQCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newP, setNewP] = useState({ name: "", brand: "", specification: "", category: "원재료", searchKeyword: "", purchaseMode: "store_purchase" });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState<string | null>(null);

  const fetchProducts = async () => {
    const res = await fetch("/api/fms/products", { cache: "no-store" });
    if (res.ok) { const d = await res.json(); setProducts(d.products || []); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const addProduct = async () => {
    if (!newP.name || !newP.searchKeyword) return;
    const res = await fetch("/api/fms/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newP) });
    if (!res.ok) { alert("오류가 발생했습니다."); return; }
    setShowAdd(false); setNewP({ name: "", brand: "", specification: "", category: "원재료", searchKeyword: "", purchaseMode: "store_purchase" });
    fetchProducts();
  };

  const testSearch = async (keyword: string, id: string) => {
    setSearching(id);
    const res = await fetch("/api/fms/price-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keyword }) });
    if (!res.ok) { alert("오류가 발생했습니다."); setSearching(null); return; }
    const d = await res.json(); setSearchResults(d.results || []);
    setSearching(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">승인 제품 카탈로그</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
          <Plus size={16} /> 제품 추가
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 grid gap-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input placeholder="제품명 *" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input placeholder="브랜드" value={newP.brand} onChange={e => setNewP({...newP, brand: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input placeholder="규격" value={newP.specification} onChange={e => setNewP({...newP, specification: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <select value={newP.category} onChange={e => setNewP({...newP, category: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="원재료">원재료</option><option value="소모품">소모품</option><option value="포장재">포장재</option>
            </select>
            <select value={newP.purchaseMode} onChange={e => setNewP({...newP, purchaseMode: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="store_purchase">가맹점 구매</option><option value="hq_only">본사 일괄</option>
            </select>
            <input placeholder="검색 키워드 *" value={newP.searchKeyword} onChange={e => setNewP({...newP, searchKeyword: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button onClick={addProduct} className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm w-fit">추가</button>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> : products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">등록된 제품이 없습니다</div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-800">{p.name}</span>
                  {p.brand && <span className="text-xs text-gray-400 ml-2">{p.brand}</span>}
                  {p.specification && <span className="text-xs text-gray-400 ml-1">({p.specification})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${p.purchaseMode === "hq_only" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                    {p.purchaseMode === "hq_only" ? "본사일괄" : "가맹점구매"}
                  </span>
                  {p.purchaseMode === "store_purchase" && (
                    <button onClick={() => testSearch(p.searchKeyword, p.id)} disabled={searching === p.id}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 hover:bg-gray-200">
                      <Search size={12} /> {searching === p.id ? "검색중..." : "테스트"}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400">키워드: {p.searchKeyword} · {p.category}</p>
            </div>
          ))}
        </div>
      )}

      {/* 검색 결과 모달 */}
      {searchResults.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSearchResults([])}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-4">검색 결과</h3>
            <div className="space-y-3">
              {searchResults.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{(r.title || r.productName || "").substring(0, 40)}</p>
                    <p className="text-xs text-gray-400">{r.mall || r.source || "네이버"}</p>
                  </div>
                  <a href={r.link || r.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#1B4332]">
                    {r.price.toLocaleString()}원
                  </a>
                </div>
              ))}
            </div>
            <button onClick={() => setSearchResults([])} className="mt-4 w-full py-2 bg-gray-100 rounded-lg text-sm">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
