"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

interface KnowledgeItem { id: string; category: string; title: string; content: string; tags: string[]; createdAt: string; }

const CATEGORIES = ["전체", "젤라또제조", "매장운영", "장비관리", "경영노하우", "고객응대", "위생안전", "마케팅", "기타", "차단"];

export default function HQKnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [filter, setFilter] = useState("전체");
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const q = filter === "전체" ? "" : `?category=${encodeURIComponent(filter)}`;
    const res = await fetch(`/api/fms/knowledge${q}`, { cache: "no-store" });
    if (res.ok) { const d = await res.json(); setItems(d.items || []); }
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, [filter]);

  const deleteItem = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const res = await fetch(`/api/fms/knowledge/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("오류가 발생했습니다."); return; }
    fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">지식 베이스</h2>
        <Link href="/admin/hq/knowledge/new" className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
          <Plus size={16} /> 지식 추가
        </Link>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${filter === c ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-600"}`}
          >{c}</button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">{items.length}개 항목</p>

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">등록된 지식이 없습니다. 새로운 지식을 추가해보세요.</div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{item.category}</span>
                    <h3 className="text-sm font-medium text-gray-800">{item.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>
                </div>
                <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-400 hover:text-red-500 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
