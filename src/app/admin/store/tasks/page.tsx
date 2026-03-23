"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Clock, Circle } from "lucide-react";

interface Task {
  id: string; title: string; description: string; status: string;
  dueTime: string; assigneeName: string; assignedTo: string;
  isRecurring: boolean; recurPattern: string; completedAt: string;
}

export default function StoreTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<"today" | "tomorrow" | "recurring">("today");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueTime: "", assignedTo: "", isRecurring: false, recurPattern: "daily" });
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const fetchTasks = async () => {
    setLoading(true);
    let url = "/api/fms/tasks";
    if (tab === "today") url += `?date=${today}`;
    else if (tab === "tomorrow") url += `?date=${tomorrow}`;
    else url += "?recurring=true";

    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) { const d = await res.json(); setTasks(d.tasks || []); }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [tab]);
  useEffect(() => {
    fetch("/api/fms/employees", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setEmployees((d.employees || []).filter((e: any) => e.isActive).map((e: any) => ({ id: e.userId, name: e.name }))))
      .catch(() => {});
  }, []);

  const addTask = async () => {
    if (!newTask.title) return;
    await fetch("/api/fms/tasks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, dueDate: tab === "tomorrow" ? tomorrow : today }),
    });
    setShowAdd(false); setNewTask({ title: "", description: "", dueTime: "", assignedTo: "", isRecurring: false, recurPattern: "daily" });
    fetchTasks();
  };

  const toggleStatus = async (taskId: string, current: string) => {
    const next = current === "completed" ? "pending" : "completed";
    await fetch(`/api/fms/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    fetchTasks();
  };

  const statusIcon = (s: string) => {
    if (s === "completed") return <Check size={16} className="text-green-600" />;
    if (s === "in_progress") return <Clock size={16} className="text-blue-500" />;
    return <Circle size={16} className="text-gray-300" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">할일 관리</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
          <Plus size={14} /> 추가
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {[{ key: "today" as const, label: "오늘" }, { key: "tomorrow" as const, label: "내일" }, { key: "recurring" as const, label: "반복" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm ${tab === t.key ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-600"}`}
          >{t.label}</button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 space-y-3">
          <input placeholder="할일 제목 *" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <select value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">담당자 미지정</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <input type="time" value={newTask.dueTime} onChange={e => setNewTask({...newTask, dueTime: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button onClick={addTask} className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm">추가</button>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">로딩 중...</div> :
      tasks.length === 0 ? <div className="text-center py-12 text-gray-400">할일이 없습니다.</div> : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer" onClick={() => toggleStatus(t.id, t.status)}>
              {statusIcon(t.status)}
              <div className="flex-1">
                <p className={`text-sm font-medium ${t.status === "completed" ? "text-gray-400 line-through" : "text-gray-800"}`}>{t.title}</p>
                <p className="text-xs text-gray-400">
                  {t.assigneeName || "미지정"} {t.dueTime && `· ${t.dueTime}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <a href="/admin/store/tasks/logs" className="block mt-4 text-center text-sm text-[#1B4332] hover:underline">
        작업 기록 보기 →
      </a>
    </div>
  );
}
