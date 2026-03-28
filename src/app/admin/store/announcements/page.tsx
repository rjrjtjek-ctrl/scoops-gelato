"use client";

import { useState, useEffect } from "react";
import { Plus, Send } from "lucide-react";

interface Announcement {
  id: string; title: string; content: string; type: string;
  createdAt: string; isRead: boolean; authorName: string; authorRole: string;
}

const roleLabel: Record<string, string> = { hq_admin: "🏢 본사", franchisee: "🏪 점주", employee: "👤 직원" };

export default function StoreAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/fms/announcements", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const d = await res.json(); setAnnouncements(d.announcements || []);
    } catch { /* 무시 */ }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const markRead = async (id: string) => {
    setExpanded(expanded === id ? null : id);
    try {
      await fetch(`/api/fms/announcements/${id}/read`, { method: "POST" });
    } catch { /* 무시 */ }
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const submit = async () => {
    if (!form.title || !form.content) return;
    setSending(true);
    try {
      const res = await fetch("/api/fms/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setShowForm(false); setForm({ title: "", content: "" });
      fetchData();
    } catch { alert("오류가 발생했습니다."); }
    setSending(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">공지사항</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
          <Plus size={14} /> 메모 작성
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-4">본사 공지 + 내 메모만 표시됩니다. 다른 점주의 메모는 보이지 않습니다.</p>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-3">
          <p className="text-xs text-gray-500">이 메모는 본인과 본사만 볼 수 있습니다.</p>
          <input placeholder="제목" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
          <textarea placeholder="내용" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm h-24 resize-none" />
          <button onClick={submit} disabled={sending} className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm disabled:opacity-50">
            <Send size={14} /> {sending ? "저장 중..." : "저장"}
          </button>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      announcements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-4xl mb-3">📢</p>
          <h3 className="font-bold text-gray-800 mb-1">공지사항이 없습니다</h3>
          <p className="text-sm text-gray-500">본사에서 공지를 보내면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {announcements.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div onClick={() => markRead(a.id)} className="p-4 cursor-pointer flex items-center gap-3">
                {!a.isRead && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">{roleLabel[a.authorRole] || ""}</span>
                    <p className={`text-sm font-medium ${a.isRead ? "text-gray-500" : "text-gray-800"}`}>{a.title}</p>
                  </div>
                  <p className="text-xs text-gray-400">{a.authorName} · {new Date(a.createdAt).toLocaleDateString("ko-KR")}</p>
                </div>
              </div>
              {expanded === a.id && (
                <div className="px-4 pb-4 border-t pt-3">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{a.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
