"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, User, UserX } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  position: string;
  hireDate: string;
  resignDate: string | null;
  isActive: boolean;
  phone: string;
}

export default function StoreEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "resigned">("active");

  useEffect(() => {
    fetch("/api/fms/employees", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setEmployees(d.employees || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeEmployees = employees.filter(e => e.isActive);
  const resignedEmployees = employees.filter(e => !e.isActive);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">직원 관리</h2>
        {activeEmployees.length < 5 && (
          <Link href="/admin/store/employees/new" className="flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
            <Plus size={16} /> 직원 등록
          </Link>
        )}
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "active" ? "bg-[#1B4332] text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          재직 ({activeEmployees.length})
        </button>
        <button
          onClick={() => setTab("resigned")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "resigned" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          퇴사 ({resignedEmployees.length})
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        {tab === "active" ? `재직 ${activeEmployees.length}명 / 최대 5명` : `퇴사자 ${resignedEmployees.length}명`}
      </p>

      {loading ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <>
          {/* 재직 탭 */}
          {tab === "active" && (
            activeEmployees.length === 0 ? (
              <div className="text-center py-12">
                <User size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">등록된 직원이 없습니다</p>
                <p className="text-xs text-gray-400 mt-1">상단 &quot;직원 등록&quot; 버튼을 눌러주세요</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {activeEmployees.map(emp => (
                  <Link key={emp.id} href={`/admin/store/employees/${emp.id}`}
                    className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                        <User size={18} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{emp.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                            {/^[\uAC00-\uD7AF\u0020-\u007E]+$/.test(emp.position || '') ? emp.position : '알바'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          입사일: {emp.hireDate} {emp.phone && `· ${emp.phone}`}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-green-600">재직</span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {/* 퇴사 탭 */}
          {tab === "resigned" && (
            resignedEmployees.length === 0 ? (
              <div className="text-center py-12">
                <UserX size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">퇴사자가 없습니다</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {resignedEmployees.map(emp => (
                  <Link key={emp.id} href={`/admin/store/employees/${emp.id}`}
                    className="block bg-white rounded-xl shadow-sm p-4 opacity-70">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserX size={18} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-500">{emp.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-400">
                            {/^[\uAC00-\uD7AF\u0020-\u007E]+$/.test(emp.position || '') ? emp.position : '알바'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          퇴사일: {emp.resignDate || "-"}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-400">퇴사</span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
