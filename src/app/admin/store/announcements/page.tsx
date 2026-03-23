"use client";

import { useState, useEffect } from "react";

interface Announcement { id: string; title: string; content: string; createdAt: string; isRead: boolean; }

export default function StoreAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/fms/announcements", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setAnnouncements(d.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    setExpanded(expanded === id ? null : id);
    await fetch(`/api/fms/announcements/${id}/read`, { method: "POST" });
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">공지사항</h2>
      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      announcements.length === 0 ? <div className="text-center py-12 text-gray-400">공지사항이 없습니다.</div> : (
        <div className="space-y-2">
          {announcements.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div onClick={() => markRead(a.id)} className="p-4 cursor-pointer flex items-center gap-3">
                {!a.isRead && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${a.isRead ? "text-gray-500" : "text-gray-800"}`}>{a.title}</p>
                  <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString("ko-KR")}</p>
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
