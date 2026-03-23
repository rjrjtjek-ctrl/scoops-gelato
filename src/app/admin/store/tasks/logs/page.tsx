"use client";

import { useState, useEffect } from "react";

interface Log { id: string; userName: string; action: string; description: string; photoUrl: string | null; createdAt: string; }

export default function StoreTaskLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/fms/task-logs?date=${date}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setLogs(d.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [date]);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">작업 기록</h2>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mb-4 px-3 py-2 border rounded-lg text-sm" />

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      logs.length === 0 ? <div className="text-center py-12 text-gray-400">기록이 없습니다.</div> : (
        <div className="space-y-1">
          {logs.map((l, i) => {
            // 이전 기록과의 시간 차이 확인 (30분 이상이면 유휴 표시)
            let idleMinutes = 0;
            if (i > 0) {
              const prev = new Date(logs[i - 1].createdAt).getTime();
              const curr = new Date(l.createdAt).getTime();
              idleMinutes = Math.round((curr - prev) / 60000);
            }

            return (
              <div key={l.id}>
                {idleMinutes >= 30 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-red-400 bg-red-50 px-3 py-1 rounded-full">
                      유휴 시간 {idleMinutes}분
                    </span>
                  </div>
                )}
                <div className="bg-white rounded-lg p-3 flex items-start gap-3">
                  <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{formatTime(l.createdAt)}</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">{l.userName}</span>
                    <p className="text-sm text-gray-600">{l.description}</p>
                    {l.photoUrl && <span className="text-xs text-blue-500">📷 사진 첨부</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
