"use client";

import { useState, useEffect } from "react";
import { Check, Circle, Clock } from "lucide-react";

interface Task { id: string; title: string; status: string; dueTime: string; completedAt: string; }

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const fetchTasks = async () => {
    try {
      setError("");
      const res = await fetch(`/api/fms/tasks?date=${today}`, { cache: "no-store" });
      if (res.ok) { const d = await res.json(); setTasks(d.tasks || []); }
      else setError("할일을 불러오지 못했습니다.");
    } catch { setError("네트워크 오류가 발생했습니다."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const toggleTask = async (taskId: string, current: string) => {
    const next = current === "completed" ? "pending" : "completed";
    try {
      const res = await fetch(`/api/fms/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      if (!res.ok) { setError("상태 변경에 실패했습니다. 다시 시도해주세요."); return; }
      setError("");
      fetchTasks();
    } catch { setError("네트워크 오류가 발생했습니다."); }
  };

  const completed = tasks.filter(t => t.status === "completed").length;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">오늘의 할 일</h2>
      <p className="text-sm text-gray-500 mb-4">{completed}/{tasks.length} 완료</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => { setError(""); fetchTasks(); }} className="text-xs text-red-500 underline">다시 시도</button>
        </div>
      )}

      {/* 진행 바 */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
        <div className="h-2 bg-[#1B4332] rounded-full transition-all" style={{ width: `${tasks.length > 0 ? (completed / tasks.length) * 100 : 0}%` }} />
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      tasks.length === 0 ? <div className="text-center py-12 text-gray-400">오늘 할 일이 없습니다 🎉</div> : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} onClick={() => toggleTask(t.id, t.status)}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer active:bg-gray-50">
              {t.status === "completed" ? <Check size={20} className="text-green-600 shrink-0" /> :
               t.status === "in_progress" ? <Clock size={20} className="text-blue-500 shrink-0" /> :
               <Circle size={20} className="text-gray-300 shrink-0" />}
              <div className="flex-1">
                <p className={`text-sm font-medium ${t.status === "completed" ? "text-gray-400 line-through" : "text-gray-800"}`}>
                  {t.title}
                </p>
                {t.dueTime && <p className="text-xs text-gray-400">{t.dueTime}까지</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
