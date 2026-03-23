"use client";

import { useState, useEffect } from "react";
import { Plus, Send } from "lucide-react";

interface Announcement { id: string; title: string; content: string; type: string; createdAt: string; }

export default function HQAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "all", targetStoreId: "" });
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [sending, setSending] = useState(false);

  const fetchAnnouncements = async () => {
    const res = await fetch("/api/fms/announcements", { cache: "no-store" });
    if (res.ok) { const d = await res.json(); setAnnouncements(d.announcements || []); }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
    fetch("/api/fms/stores?status=active", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setStores((d.stores || []).map((s: any) => ({ id: s.id, name: s.name }))))
      .catch(() => {});
  }, []);

  const submit = async () => {
    if (!form.title || !form.content) return;
    setSending(true);
    await fetch("/api/fms/announcements", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false); setForm({ title: "", content: "", type: "all", targetStoreId: "" });
    fetchAnnouncements();
    setSending(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">공지사항</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
          <Plus size={16} /> 공지 작성
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4 space-y-4">
          <input placeholder="제목" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
          <textarea placeholder="내용" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm h-32 resize-none" />
          <div className="flex gap-3">
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="all">전체 공지</option>
              <option value="individual">개별 매장</option>
            </select>
            {form.type === "individual" && (
              <select value={form.targetStoreId} onChange={e => setForm({...form, targetStoreId: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
                <option value="">매장 선택</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>
          <button onClick={submit} disabled={sending} className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm disabled:opacity-50">
            <Send size={14} /> {sending ? "발송 중..." : "발송"}
          </button>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">{a.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.type === "all" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                  {a.type === "all" ? "전체" : "개별"}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(a.createdAt).toLocaleDateString("ko-KR")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
