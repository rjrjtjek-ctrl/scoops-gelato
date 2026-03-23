"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  content: string;
  createdAt: string;
  reviewerName: string;
}

export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [resigning, setResigning] = useState(false);

  const fetchData = async () => {
    try {
      const empRes = await fetch("/api/fms/employees", { cache: "no-store" });
      const empData = await empRes.json();
      const emp = (empData.employees || []).find((e: any) => e.id === employeeId);
      setEmployee(emp || null);

      const revRes = await fetch(`/api/fms/employees/${employeeId}/reviews`, { cache: "no-store" });
      const revData = await revRes.json();
      setReviews(revData.reviews || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [employeeId]);

  const handleSendReview = async () => {
    if (!newReview.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/fms/employees/${employeeId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newReview.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(prev => [data.review, ...prev]);
        setNewReview("");
      }
    } catch {} finally { setSending(false); }
  };

  const handleResign = async () => {
    setResigning(true);
    try {
      const res = await fetch("/api/fms/employees/resign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      if (res.ok) {
        router.push("/admin/store/employees");
      }
    } catch {} finally { setResigning(false); }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">로딩 중...</div>;
  if (!employee) return <div className="text-center py-12 text-gray-400">직원을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/admin/store/employees" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <ArrowLeft size={16} /> 직원 목록
      </Link>

      {/* 직원 정보 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">{employee.name}</h2>
          <span className={`text-xs px-2 py-1 rounded-full ${employee.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {employee.isActive ? "재직" : "퇴사"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">직급:</span> {employee.position}</div>
          <div><span className="text-gray-500">입사일:</span> {employee.hireDate}</div>
          <div><span className="text-gray-500">연락처:</span> {employee.phone || "-"}</div>
          <div><span className="text-gray-500">주민번호:</span> {employee.residentNum || "-"}</div>
        </div>
        {employee.characteristics && (
          <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{employee.characteristics}</p>
        )}
      </div>

      {/* 인사 평가 (채팅형) */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h3 className="font-semibold text-gray-800 mb-4">인사 평가 기록</h3>

        {/* 평가 목록 */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">아직 평가 기록이 없습니다.</p>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-800">{rev.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(rev.createdAt).toLocaleDateString("ko-KR")} · {rev.reviewerName}
                </p>
              </div>
            ))
          )}
        </div>

        {/* 입력창 */}
        {employee.isActive && (
          <div className="flex gap-2">
            <input
              value={newReview}
              onChange={e => setNewReview(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendReview()}
              placeholder="평가 내용을 입력하세요..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button onClick={handleSendReview} disabled={sending || !newReview.trim()} className="p-2 bg-[#1B4332] text-white rounded-lg disabled:opacity-50">
              <Send size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 퇴사 처리 */}
      {employee.isActive && (
        <button onClick={() => setShowResignModal(true)} className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100">
          퇴사 처리
        </button>
      )}

      {/* 퇴사 확인 모달 */}
      {showResignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-500" />
              <h3 className="font-bold text-gray-800">퇴사 처리</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">{employee.name}님을 퇴사 처리하시겠습니까? 로그인이 불가능해지며, 기록은 보관됩니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResignModal(false)} className="flex-1 py-2 border rounded-lg text-sm">취소</button>
              <button onClick={handleResign} disabled={resigning} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50">
                {resigning ? "처리 중..." : "퇴사 처리"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
