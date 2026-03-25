"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Clock, Circle, Trash2, Edit2, X, Search, ExternalLink, ShoppingCart, Loader2 } from "lucide-react";

interface Task {
  id: string; title: string; description: string; status: string;
  dueTime: string; assigneeName: string; assignedTo: string;
  isRecurring: boolean; recurPattern: string; completedAt: string;
}

interface PriceResult {
  title: string;
  price: number;
  link: string;
  mall: string;
  image: string;
}

export default function StoreTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<"today" | "tomorrow" | "recurring" | "history" | "purchase">("today");
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueTime: "", assignedTo: "", isRecurring: false, recurPattern: "daily" });
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [userRole, setUserRole] = useState("");
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");

  // 구매 검색 관련
  const [searchingTaskId, setSearchingTaskId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Record<string, PriceResult[]>>({});
  const [searchLoading, setSearchLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  useEffect(() => {
    fetch("/api/fms/auth/me", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setUserRole(d.user?.role || "");
        if (d.user?.role === "hq_admin") {
          fetch("/api/fms/stores?status=active", { cache: "no-store" })
            .then(r => r.json())
            .then(sd => {
              const s = (sd.stores || []).map((st: any) => ({ id: st.id, name: st.name }));
              setStores(s);
              if (s.length > 0) setSelectedStoreId(s[0].id);
            }).catch(() => {});
        }
      }).catch(() => {});
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    let url = "/api/fms/tasks";
    if (tab === "today") url += `?date=${today}`;
    else if (tab === "tomorrow") url += `?date=${tomorrow}`;
    else if (tab === "history") url += "?history=true";
    else if (tab === "purchase") url += "?purchase=true";
    else url += "?recurring=true";
    if (userRole === "hq_admin" && selectedStoreId) {
      url += (url.includes("?") ? "&" : "?") + `storeId=${selectedStoreId}`;
    }
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setTasks(d.tasks || []);
      if (d.overdueCount) setOverdueCount(d.overdueCount);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [tab, selectedStoreId, userRole]);
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
      body: JSON.stringify({ ...newTask, dueDate: tab === "tomorrow" ? tomorrow : today, storeId: selectedStoreId || undefined }),
    });
    setShowAdd(false); setNewTask({ title: "", description: "", dueTime: "", assignedTo: "", isRecurring: false, recurPattern: "daily" });
    fetchTasks();
  };

  const toggleStatus = async (taskId: string, current: string) => {
    const next = current === "completed" ? "pending" : "completed";
    await fetch(`/api/fms/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
    fetchTasks();
  };

  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const deleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 할일을 삭제할까요?")) return;
    await fetch(`/api/fms/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "deleted" }) });
    fetchTasks();
  };

  const startEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (taskId: string) => {
    if (!editTitle.trim()) return;
    await fetch(`/api/fms/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: editTitle }) });
    setEditingTask(null);
    fetchTasks();
  };

  // 구매 요청인지 확인
  const isPurchaseRequest = (title: string) => {
    return title.includes("[구매요청]") || title.includes("[구매 요청]") || title.includes("구매 필요");
  };

  // 구매 키워드 추출
  const extractProductName = (title: string) => {
    return title.replace(/\[구매요청\]|\[구매 요청\]|구매 필요[:\s]*/g, "").trim();
  };

  // 최저가 검색
  const searchPrice = async (taskId: string, title: string) => {
    const keyword = extractProductName(title);
    if (!keyword) return;

    setSearchingTaskId(taskId);
    setSearchLoading(true);
    try {
      const res = await fetch("/api/fms/price-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(prev => ({ ...prev, [taskId]: data.results || [] }));
      }
    } catch {
      // 에러 무시
    }
    setSearchLoading(false);
  };

  const statusIcon = (s: string) => {
    if (s === "completed") return <Check size={16} className="text-green-600" />;
    if (s === "in_progress") return <Clock size={16} className="text-blue-500" />;
    return <Circle size={16} className="text-gray-300" />;
  };

  const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";

  return (
    <div>
      {/* 본사: 매장 선택 */}
      {userRole === "hq_admin" && stores.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-gray-500">매장 선택:</span>
          <select value={selectedStoreId} onChange={e => setSelectedStoreId(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm">
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
      {userRole === "hq_admin" && stores.length === 0 && (
        <div className="mb-4 bg-yellow-50 rounded-lg p-3 text-sm text-yellow-700">
          매장을 먼저 등록해주세요. <a href="/admin/hq/stores/new" className="underline font-medium">매장 등록 →</a>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">할일 관리</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
          <Plus size={14} /> 추가
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: "today" as const, label: overdueCount > 0 ? `오늘 (${overdueCount}건 이월)` : "오늘" },
          { key: "tomorrow" as const, label: "내일" },
          { key: "purchase" as const, label: "구매요청" },
          { key: "history" as const, label: "과거내역" },
          { key: "recurring" as const, label: "반복" },
        ].map(t => (
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
      tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center mb-4">
            <p className="text-4xl mb-3">📋</p>
            <h3 className="font-bold text-gray-800 mb-1">할일을 추가해보세요</h3>
            <p className="text-sm text-gray-500">직원에게 할 일을 배정하고 진행 상황을 관리합니다</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-2">
            <p><strong>사용 방법:</strong></p>
            <p>1. 상단 <strong>&quot;+ 추가&quot;</strong> 버튼을 눌러 할일을 만듭니다</p>
            <p>2. 담당 직원을 지정하면 직원 앱에 자동 표시됩니다</p>
            <p>3. 직원이 완료하면 체크 표시가 됩니다</p>
            <p>4. <strong>AI 채팅</strong>으로도 할일을 만들 수 있습니다</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.filter(t => t.status !== "deleted").map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                {editingTask === t.id ? (
                  <div className="flex items-center gap-2">
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" autoFocus
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(t.id); if (e.key === "Escape") setEditingTask(null); }} />
                    <button onClick={() => saveEdit(t.id)} className="px-3 py-2 bg-[#1B4332] text-white text-xs rounded-lg">저장</button>
                    <button onClick={() => setEditingTask(null)} className="p-2 text-gray-400"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleStatus(t.id, t.status)} className="flex-shrink-0">
                      {statusIcon(t.status)}
                    </button>
                    <div className="flex-1" onClick={() => toggleStatus(t.id, t.status)}>
                      <p className={`text-sm font-medium ${t.status === "completed" ? "text-gray-400 line-through" : "text-gray-800"}`}>
                        {(t as any).isOverdue && <span className="inline-block bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded mr-1.5">이월</span>}
                        {isPurchaseRequest(t.title) && <span className="inline-block bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded mr-1.5">구매</span>}
                        {isPurchaseRequest(t.title) ? extractProductName(t.title) : t.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t.assigneeName || "미지정"} {t.dueTime && `· ${t.dueTime}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {isPurchaseRequest(t.title) && t.status !== "completed" && (
                        <button onClick={(e) => { e.stopPropagation(); searchPrice(t.id, t.title); }}
                          className="p-1.5 text-orange-400 hover:text-orange-600" title="최저가 검색">
                          <Search size={14} />
                        </button>
                      )}
                      <button onClick={(e) => startEdit(t, e)} className="p-1.5 text-gray-300 hover:text-blue-500">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={(e) => deleteTask(t.id, e)} className="p-1.5 text-gray-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 최저가 검색 결과 */}
              {searchingTaskId === t.id && (
                <div className="border-t bg-gray-50 p-4">
                  {searchLoading ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-gray-400 text-sm">
                      <Loader2 size={16} className="animate-spin" /> 최저가 검색 중...
                    </div>
                  ) : searchResults[t.id]?.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-gray-600">🔍 검색 결과 (최저가순)</p>
                        <button onClick={() => setSearchingTaskId(null)} className="text-gray-400 hover:text-gray-600">
                          <X size={14} />
                        </button>
                      </div>
                      {searchResults[t.id].slice(0, 5).map((r, i) => (
                        <a key={i} href={r.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-[#1B4332] hover:shadow-sm transition-all">
                          {r.image && (
                            <img src={r.image} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 line-clamp-2">{r.title.replace(/<[^>]*>/g, "")}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{r.mall}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-sm font-bold text-[#1B4332]">{formatPrice(r.price)}</span>
                            <ExternalLink size={12} className="text-gray-300" />
                          </div>
                        </a>
                      ))}
                      <p className="text-[10px] text-gray-400 text-center mt-2">터치하면 해당 쇼핑몰로 이동합니다</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400">검색 결과가 없습니다</p>
                      <button onClick={() => setSearchingTaskId(null)} className="text-xs text-[#1B4332] mt-2">닫기</button>
                    </div>
                  )}
                </div>
              )}
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
