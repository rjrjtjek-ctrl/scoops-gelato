"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["젤라또제조", "매장운영", "장비관리", "경영노하우", "고객응대", "위생안전", "마케팅", "기타", "차단"];

export default function NewKnowledgePage() {
  const router = useRouter();
  const [form, setForm] = useState({ category: "젤라또제조", title: "", content: "", tags: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) { setError("제목과 내용을 입력해주세요."); return; }
    setSaving(true);
    setError("");
    try {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch("/api/fms/knowledge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags }),
      });
      if (!res.ok) { setError("저장에 실패했습니다. 다시 시도해주세요."); setSaving(false); return; }
      router.push("/admin/hq/knowledge");
    } catch { setError("네트워크 오류가 발생했습니다."); setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/hq/knowledge" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <ArrowLeft size={16} /> 지식 목록
      </Link>
      <h2 className="text-lg font-bold text-gray-800 mb-6">지식 추가</h2>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">카테고리</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">제목 *</label>
          <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="예: 젤라또가 딱딱할 때 대처법" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">내용 *</label>
          <textarea required value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm h-48 resize-none" placeholder="AI가 참고할 내용을 작성하세요..." />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">태그 (쉼표 구분)</label>
          <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="온도, 보관, 쇼케이스" />
        </div>
        <button type="submit" disabled={saving} className="w-full py-3 bg-[#1B4332] text-white rounded-lg text-sm font-medium disabled:opacity-50">
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}
