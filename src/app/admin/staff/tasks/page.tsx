"use client";

import { useState, useEffect } from "react";
import { Check, Circle, Clock, History } from "lucide-react";

interface Task {
  id: string; title: string; status: string; dueTime: string;
  dueDate: string; completedAt: string; assigneeName: string;
  isOverdue: boolean;
}

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"today" | "history">("today");
  const [overdueCount, setOverdueCount] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  const fetchTasks = async () => {
    try {
      setError("");
      setLoading(true);
      const url = tab === "today"
        ? `/api/fms/tasks?date=${today}`
        : `/api/fms/tasks?history=true`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setTasks(d.tasks || []);
        if (d.overdueCount) setOverdueCount(d.overdueCount);
      } else setError("할일을 불러오지 못했습니다.");
    } catch { setError("네트워크 오류가 발생했습니다."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [tab]);

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
  const total = tasks.filter(t => t.status !== "deleted").length;

  const statusIcon = (s: string) => {
    if (s === "completed") return <Check size={18} className="text-green-600" />;
    if (s === "in_progress") return <Clock size={18} className="text-blue-500" />;
    return <Circle size={18} className="text-gray-300" />;
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">
        {tab === "today" ? "오늘의 할 일" : "과거 내역"}
      </h2>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("today")}
          className={`px-4 py-2 rounded-lg text-sm ${tab === "today" ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-600"}`}>
          {overdueCount > 0 ? `오늘 (${overdueCount}건 이월)` : "오늘"}
        </button>
        <button onClick={() => setTab("history")}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm ${tab === "history" ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-600"}`}>
          <History size={14} /> 과거 내역
        </button>
      </div>

      {tab === "today" && (
        <p className="text-sm text-gray-500 mb-4">{completed}/{total} 완료</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-600">
          {error}
          <button onClick={fetchTasks} className="ml-2 underline">다시 시도</button>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      tasks.filter(t => t.status !== "deleted").length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <p className="text-3xl mb-2">{tab === "today" ? "🎉" : "📋"}</p>
          <p className="text-sm text-gray-500">
            {tab === "today" ? "오늘 할 일이 없습니다" : "과거 내역이 없습니다"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.filter(t => t.status !== "deleted").map(t => (
            <div key={t.id} className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 ${tab === "today" ? "cursor-pointer active:bg-gray-50" : ""}`}
              onClick={tab === "today" ? () => toggleTask(t.id, t.status) : undefined}>
              {statusIcon(t.status)}
              <div className="flex-1">
                <p className={`text-sm font-medium ${t.status === "completed" ? "text-gray-400 line-through" : "text-gray-800"}`}>
                  {t.isOverdue && <span className="inline-block bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded mr-1.5">이월</span>}
                  {t.title?.includes("[구매요청]") && <span className="inline-block bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded mr-1.5">구매</span>}
                  {t.title?.replace("[구매요청] ", "")}
                </p>
                <p className="text-xs text-gray-400">
                  {t.dueTime && `${t.dueTime} · `}
                  {tab === "history" && t.dueDate && `${t.dueDate} · `}
                  {t.status === "completed" ? "완료 ✓" : "미완료"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
