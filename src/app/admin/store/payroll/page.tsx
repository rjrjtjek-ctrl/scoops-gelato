"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, DollarSign, Clock, Calendar, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

interface PayrollItem {
  userId: string;
  name: string;
  totalMinutes: number;
  totalHours: number;
  workDays: number;
  basePay: number;
  weeklyAllowance: number;
  qualifiedWeeks: number;
  totalPay: number;
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
}

export default function PayrollPage() {
  const router = useRouter();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [payroll, setPayroll] = useState<PayrollItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [minWage, setMinWage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/fms/payroll?month=${month}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setPayroll(d.payroll || []);
        setTotalAmount(d.totalAmount || 0);
        setMinWage(d.minWage || 0);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [month]);

  const fmt = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-1"><ArrowLeft size={20} /></button>
          <h1 className="text-lg font-bold">급여 관리</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* 월 선택 */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
        </div>

        {/* 총 급여 카드 */}
        <div className="bg-[#1B4332] text-white rounded-xl p-5">
          <p className="text-sm opacity-80">이번 달 총 급여</p>
          <p className="text-3xl font-bold mt-1">{fmt(totalAmount)}원</p>
          <p className="text-xs opacity-60 mt-2">최저시급 {fmt(minWage)}원 기준</p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">로딩 중...</div>
        ) : payroll.length === 0 ? (
          <div className="text-center py-10">
            <Clock size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">이번 달 출퇴근 기록이 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">직원이 출근 버튼을 누르면 자동으로 기록됩니다</p>
          </div>
        ) : (
          payroll.map(p => (
            <div key={p.userId} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.workDays}일 근무 · 총 {p.totalHours}시간</p>
                </div>
                <p className="text-lg font-bold text-[#1B4332]">{fmt(p.totalPay)}원</p>
              </div>

              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>기본급 ({p.totalHours}시간 × {fmt(minWage)}원)</span>
                  <span>{fmt(p.basePay)}원</span>
                </div>
                {p.weeklyAllowance > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>주휴수당 ({p.qualifiedWeeks}주 해당)</span>
                    <span>+{fmt(p.weeklyAllowance)}원</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800 pt-1 border-t mt-1">
                  <span>총 급여</span>
                  <span>{fmt(p.totalPay)}원</span>
                </div>
              </div>

              {/* 계좌 정보 */}
              {p.bankName ? (
                <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                  <CreditCard size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {p.bankName} {p.accountNumber} ({p.accountHolder})
                  </span>
                </div>
              ) : (
                <div className="mt-3 bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-amber-600">💡 계좌 미등록 — 직원에게 계좌 등록을 안내해주세요</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
