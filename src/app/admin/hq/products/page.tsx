"use client";

import { useState, useEffect } from "react";
import { Plus, Save } from "lucide-react";

interface Product { id: string; name: string; category: string; unit: string; price: number; isActive: boolean; }

export default function HQProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "젤라또 베이스", unit: "개", price: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);

  const fetchProducts = async () => {
    const res = await fetch("/api/fms/hq-products", { cache: "no-store" });
    if (res.ok) { const data = await res.json(); setProducts(data.products || []); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const addProduct = async () => {
    if (!newProduct.name) return;
    await fetch("/api/fms/hq-products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newProduct) });
    setShowAdd(false); setNewProduct({ name: "", category: "젤라또 베이스", unit: "개", price: 0 });
    fetchProducts();
  };

  const savePrice = async (id: string) => {
    await fetch(`/api/fms/hq-products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ price: editPrice }) });
    setEditingId(null); fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">공급 제품 관리</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
          <Plus size={16} /> 제품 추가
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <input placeholder="제품명" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
          <input placeholder="카테고리" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
          <input placeholder="단위" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
          <button onClick={addProduct} className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm">추가</button>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">제품명</th>
                  <th className="text-left px-4 py-3 font-medium">카테고리</th>
                  <th className="text-left px-4 py-3 font-medium">단위</th>
                  <th className="text-left px-4 py-3 font-medium">가격</th>
                  <th className="text-left px-4 py-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category}</td>
                    <td className="px-4 py-3 text-gray-500">{p.unit}</td>
                    <td className="px-4 py-3">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} className="w-20 px-2 py-1 border rounded text-sm" />
                          <button onClick={() => savePrice(p.id)} className="p-1 text-green-600"><Save size={14} /></button>
                        </div>
                      ) : (
                        <span className="cursor-pointer hover:text-blue-600" onClick={() => { setEditingId(p.id); setEditPrice(p.price); }}>
                          {p.price > 0 ? `${p.price.toLocaleString()}원` : "미설정"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        {p.isActive ? "활성" : "비활성"}
                      </span>
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
