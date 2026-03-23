"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

interface MenuItem { id: string; name: string; category: string; price: number; isActive: boolean; }

export default function HQMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "젤라또", price: 0 });

  const fetchMenu = async () => {
    const res = await fetch("/api/fms/menu", { cache: "no-store" });
    if (res.ok) { const d = await res.json(); setItems(d.menuItems || []); }
    setLoading(false);
  };
  useEffect(() => { fetchMenu(); }, []);

  const addItem = async () => {
    if (!newItem.name) return;
    await fetch("/api/fms/menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newItem) });
    setShowAdd(false); setNewItem({ name: "", category: "젤라또", price: 0 });
    fetchMenu();
  };

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">메뉴 관리</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
          <Plus size={16} /> 메뉴 추가
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 grid grid-cols-3 gap-3">
          <input placeholder="메뉴명" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
          <input placeholder="카테고리" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
          <div className="flex gap-2">
            <input type="number" placeholder="가격" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            <button onClick={addItem} className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm">추가</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> : (
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">{cat}</h3>
              <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                {items.filter(i => i.category === cat).map(item => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <span className={`text-sm ${item.isActive ? "text-gray-800" : "text-gray-400 line-through"}`}>{item.name}</span>
                    <span className="text-sm font-medium text-gray-600">{item.price.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
