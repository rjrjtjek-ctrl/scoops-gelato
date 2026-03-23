"use client";

import { useState, useEffect } from "react";

interface MenuItem { id: string; name: string; category: string; price: number; storeStatus?: { isAvailable: boolean }; }

export default function StaffMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/fms/auth/me", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setUserRole(d.user?.role || "");
        if (d.user?.storeId) {
          setStoreId(d.user.storeId);
        } else if (d.user?.role === "hq_admin") {
          fetch("/api/fms/stores?status=active", { cache: "no-store" })
            .then(r => r.json())
            .then(sd => {
              const s = (sd.stores || []).map((st: any) => ({ id: st.id, name: st.name }));
              setStores(s);
              if (s.length > 0) setStoreId(s[0].id);
              else setLoading(false);
            }).catch(() => setLoading(false));
        } else { setLoading(false); }
      }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/fms/menu?storeId=${storeId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setItems((d.menuItems || []).filter((i: any) => i.isActive)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  const toggleMenu = async (menuItemId: string, current: boolean) => {
    await fetch("/api/fms/menu/store-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuItemId, isAvailable: !current }),
    });
    setItems(prev => prev.map(i => i.id === menuItemId ? { ...i, storeStatus: { isAvailable: !current } } : i));
  };

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-2">메뉴 ON/OFF</h2>
      <p className="text-xs text-gray-500 mb-4">토글을 끄면 QR 주문에서 품절로 표시됩니다</p>

      {userRole === "hq_admin" && stores.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-gray-500">매장:</span>
          <select value={storeId} onChange={e => setStoreId(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-4xl mb-3">🍨</p>
          <p className="text-sm text-gray-500">메뉴 데이터가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-gray-500 mb-2">{cat}</h3>
              <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                {items.filter(i => i.category === cat).map(item => {
                  const isAvailable = item.storeStatus?.isAvailable !== false;
                  return (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <span className={`text-sm ${isAvailable ? "text-gray-800" : "text-gray-400"}`}>{item.name}</span>
                        {!isAvailable && <span className="ml-2 text-xs text-red-500">품절</span>}
                      </div>
                      <button onClick={() => toggleMenu(item.id, isAvailable)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${isAvailable ? "bg-green-500" : "bg-gray-300"}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isAvailable ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
