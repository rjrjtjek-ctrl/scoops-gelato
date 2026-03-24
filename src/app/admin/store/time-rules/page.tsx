"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Clock, Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface TimeRule {
  id: string;
  start_hour: number;
  end_hour: number;
  tasks: string[];
  priority: string;
}

export default function TimeRulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState<TimeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [startHour, setStartHour] = useState(10);
  const [endHour, setEndHour] = useState(12);
  const [tasksText, setTasksText] = useState("");
  const [priority, setPriority] = useState("normal");

  const fetchRules = () => {
    setLoading(true);
    fetch("/api/fms/time-rules", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { setRules(d.rules || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRules(); }, []);

  const handleAdd = async () => {
    if (!tasksText.trim()) return alert("업무를 입력해주세요");
    const tasks = tasksText.split("\n").map(t => t.trim()).filter(Boolean);
    const res = await fetch("/api/fms/time-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startHour, endHour, tasks, priority }),
    });
    if (res.ok) {
      setShowAdd(false);
      setTasksText("");
      fetchRules();
    } else {
      const d = await res.json();
      alert(d.error || "오류 발생");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 규칙을 삭제할까요?")) return;
    await fetch(`/api/fms/time-rules?id=${id}`, { method: "DELETE" });
    fetchRules();
  };

  const fmtHour = (h: number) => h < 12 ? `오전 ${h}시` : h === 12 ? "오후 12시" : `오후 ${h - 12}시`;

  const priorityLabel: Record<string, string> = { high: "🔴 바쁜 시간", normal: "🟡 보통", low: "🟢 여유 시간" };

  // 현재 시간대 표시
  const nowHour = (new Date().getUTCHours() + 9) % 24;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1"><ArrowLeft size={20} /></button>
            <h1 className="text-lg font-bold">시간대별 업무 설정</h1>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-[#1B4332] text-white rounded-lg">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-2">
            <AlertCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">시간대별 업무 자동 배정</p>
              <p className="text-xs text-blue-600 mt-1">
                설정한 시간대에 직원이 출근하면, AI가 자동으로 해당 업무를 할일에 추가합니다.
                점주님도 같은 업무 알림을 받습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 추가 폼 */}
        {showAdd && (
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <p className="text-sm font-bold text-gray-800">새 규칙 추가</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">시작 시간</label>
                <select value={startHour} onChange={e => setStartHour(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{fmtHour(i)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">종료 시간</label>
                <select value={endHour} onChange={e => setEndHour(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{fmtHour(i)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">시간대 분류</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="high">🔴 바쁜 시간 (서빙/주문 집중)</option>
                <option value="normal">🟡 보통 (일반 업무)</option>
                <option value="low">🟢 여유 시간 (제조/정리)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">업무 목록 (줄바꿈으로 구분)</label>
              <textarea
                value={tasksText}
                onChange={e => setTasksText(e.target.value)}
                placeholder={"홀 서빙\n주문 처리\n배달 확인"}
                rows={4}
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              />
            </div>

            <button onClick={handleAdd}
              className="w-full py-3 bg-[#1B4332] text-white rounded-xl text-sm font-bold active:scale-95 transition-transform">
              규칙 추가
            </button>
          </div>
        )}

        {/* 타임라인 */}
        {loading ? (
          <div className="text-center py-10 text-gray-400">로딩 중...</div>
        ) : rules.length === 0 ? (
          <div className="text-center py-10">
            <Clock size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">아직 설정된 규칙이 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">+ 버튼을 눌러 시간대별 업무를 설정해보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => {
              const isNow = nowHour >= rule.start_hour && nowHour < rule.end_hour;
              return (
                <div key={rule.id} className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${
                  isNow ? "border-green-500 ring-1 ring-green-200" :
                  rule.priority === "high" ? "border-red-400" :
                  rule.priority === "low" ? "border-blue-400" : "border-amber-400"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">
                        {fmtHour(rule.start_hour)} ~ {fmtHour(rule.end_hour)}
                      </span>
                      {isNow && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">지금</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{priorityLabel[rule.priority] || rule.priority}</span>
                      <button onClick={() => handleDelete(rule.id)} className="p-1 text-gray-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {rule.tasks.map((task, i) => (
                      <p key={i} className="text-xs text-gray-600">• {task}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
