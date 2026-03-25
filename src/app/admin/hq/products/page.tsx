"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

interface Product { id: string; name: string; category: string; spec: string; unit: string; price: number; }

const CATEGORIES = ["베이스", "프리믹스", "원재료", "소모품", "장비", "유니폼", "비용", "기타"];

export default function HQProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "프리믹스", spec: "", unit: "", price: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [filterCat, setFilterCat] = useState("전체");
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    const res = await fetch("/api/fms/settlement?view=products", { cache: "no-store" });
    if (res.ok) { const data = await res.json(); setProducts(data.products || []); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const addProduct = async () => {
    if (!newProduct.name) return;
    await fetch("/api/fms/settlement", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "product", ...newProduct }),
    });
    setShowAdd(false);
    setNewProduct({ name: "", category: "프리믹스", spec: "", unit: "", price: 0 });
    fetchProducts();
  };

  const savePrice = async (id: string) => {
    await fetch("/api/fms/settlement", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "product", id, price: editPrice }),
    });
    setEditingId(null);
    fetchProducts();
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`${name}을(를) 삭제할까요?`)) return;
    await fetch(`/api/fms/settlement?type=product&id=${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const filtered = products
    .filter(p => filterCat === "전체" || p.category === filterCat)
    .filter(p => !search || p.name.includes(search));

  const categories = [...new Set(products.map(p => p.category || "기타"))].sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">공급 제품 관리</h2>
          <p className="text-xs text-gray-400 mt-1">총 {products.length}개 제품</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
          <Plus size={16} /> 제품 추가
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="제품명 *" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="규격 (예: 바트, 박스)" value={newProduct.spec} onChange={e => setNewProduct({...newProduct, spec: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" placeholder="단가 (원)" value={newProduct.price || ""} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button onClick={addProduct} className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm">추가</button>
        </div>
      )}

      {/* 검색 + 카테고리 필터 */}
      <div className="flex gap-2 mb-4">
        <input placeholder="🔍 제품 검색..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["전체", ...categories].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${filterCat === cat ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-600"}`}>
            {cat} {cat === "전체" ? `(${products.length})` : `(${products.filter(p => p.category === cat).length})`}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">제품이 없습니다</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">제품명</th>
                  <th className="text-left px-4 py-3 font-medium">카테고리</th>
                  <th className="text-left px-4 py-3 font-medium">규격</th>
                  <th className="text-right px-4 py-3 font-medium">단가</th>
                  <th className="text-center px-4 py-3 font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{p.category || "기타"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.spec || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      {editingId === p.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <input type="number" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} className="w-24 px-2 py-1 border rounded text-sm text-right" autoFocus
                            onKeyDown={e => { if (e.key === "Enter") savePrice(p.id); if (e.key === "Escape") setEditingId(null); }} />
                          <button onClick={() => savePrice(p.id)} className="p-1 text-green-600"><Save size={14} /></button>
                        </div>
                      ) : (
                        <span className="cursor-pointer hover:text-blue-600 font-medium" onClick={() => { setEditingId(p.id); setEditPrice(p.price); }}>
                          {p.price > 0 ? `${p.price.toLocaleString()}원` : "미설정"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => deleteProduct(p.id, p.name)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
