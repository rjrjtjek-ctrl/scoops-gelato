"use client";

import { useState, useEffect } from "react";
import { Plus, Send } from "lucide-react";

interface Announcement {
  id: string; title: string; content: string; type: string;
  createdAt: string; isRead: boolean; authorName: string; authorRole: string;
}

const roleLabel: Record<string, string> = {
  hq_admin: "🏢 본사",
  franchisee: "🏪 점주",
  employee: "👤 직원",
};

const roleBadge: Record<string, string> = {
  hq: "bg-green-100 text-green-700",
  franchisee: "bg-blue-100 text-blue-600",
  employee: "bg-purple-100 text-purple-600",
  all: "bg-green-100 text-green-700",
};

export default function HQAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    const res = await fetch("/api/fms/announcements", { cache: "no-store" });
    if (res.ok) { const d = await res.json(); setAnnouncements(d.announcements || []); }
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const submit = async () => {
    if (!form.title || !form.content) return;
    setSending(true);
    const res = await fetch("/api/fms/announcements", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { alert("오류가 발생했습니다."); setSending(false); return; }
    setShowForm(false); setForm({ title: "", content: "" });
    fetchAnnouncements();
    setSending(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">공지사항 관제</h2>
          <p className="text-xs text-gray-400">본사·점주·직원 모든 공지를 볼 수 있습니다</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
          <Plus size={16} /> 본사 공지 작성
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4 space-y-4">
          <p className="text-xs text-gray-500">본사 공지는 모든 점주와 직원에게 표시됩니다.</p>
          <input placeholder="제목" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
          <textarea placeholder="내용" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm h-32 resize-none" />
          <button onClick={submit} disabled={sending} className="flex items-center gap-1 px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm disabled:opacity-50">
            <Send size={14} /> {sending ? "발송 중..." : "전체 발송"}
          </button>
        </div>
      )}

      {/* 권한 설명 */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-500">
        <strong>권한 규칙:</strong> 🏢 본사 공지 → 전체 공개 | 🏪 점주 메모 → 점주 본인+본사만 | 👤 직원 메모 → 직원 본인+본사만
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      announcements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-4xl mb-3">📢</p>
          <h3 className="font-bold text-gray-800 mb-1">아직 공지사항이 없습니다</h3>
          <p className="text-sm text-gray-500">상단 &quot;본사 공지 작성&quot; 버튼으로 첫 공지를 작성해보세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {announcements.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div onClick={() => setExpanded(expanded === a.id ? null : a.id)} className="p-4 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleBadge[a.type] || "bg-gray-100 text-gray-500"}`}>
                    {roleLabel[a.authorRole] || a.type}
                  </span>
                  <h3 className="text-sm font-medium text-gray-800 flex-1">{a.title}</h3>
                </div>
                <p className="text-xs text-gray-400">{a.authorName} · {new Date(a.createdAt).toLocaleDateString("ko-KR")}</p>
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
