"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, User } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/fms/employees", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setEmployees(d.employees || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount = employees.filter(e => e.isActive).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">직원 관리</h2>
        {activeCount < 5 && (
          <Link href="/admin/store/employees/new" className="flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white text-sm rounded-lg">
            <Plus size={16} /> 직원 등록
          </Link>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">재직 {activeCount}명 / 최대 5명</p>

      {loading ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12 text-gray-400">등록된 직원이 없습니다.</div>
      ) : (
        <div className="grid gap-3">
          {employees.map(emp => (
            <Link key={emp.id} href={`/admin/store/employees/${emp.id}`} className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User size={18} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{emp.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{/^[\uAC00-\uD7AF\u0020-\u007E]+$/.test(emp.position || '') ? emp.position : '알바'}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    입사일: {emp.hireDate} {emp.phone && `· ${emp.phone}`}
                  </p>
                </div>
                <span className={`text-xs font-medium ${emp.isActive ? "text-green-600" : "text-gray-400"}`}>
                  {emp.isActive ? "재직" : `퇴사 (${emp.resignDate})`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
