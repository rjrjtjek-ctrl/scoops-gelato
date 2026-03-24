"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ name: string; loginId: string; password: string } | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", residentNum: "",
    position: "알바", hireDate: new Date().toISOString().split("T")[0],
    loginId: "", password: "scoops1234!", characteristics: "",
  });

  const handleNameChange = (name: string) => {
    setForm({ ...form, name });
    if (!form.loginId || form.loginId.startsWith("emp_")) {
      const slug = name.replace(/[^a-zA-Z0-9]/g, "") || Date.now().toString().slice(-6);
      setForm(prev => ({ ...prev, name, loginId: `emp_${slug}` }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/fms/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "등록 실패"); return; }
      setSuccess({ name: form.name, loginId: form.loginId, password: form.password });
    } catch { setError("서버 오류"); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">{success.name} 등록 완료</h2>
          <div className="bg-gray-50 rounded-lg p-4 mt-4 text-left">
            <p className="text-sm text-gray-600 mb-2">직원 로그인 정보:</p>
            <p className="text-sm font-mono"><strong>ID:</strong> {success.loginId}</p>
            <p className="text-sm font-mono"><strong>PW:</strong> {success.password}</p>
            <p className="text-xs text-red-500 mt-2">⚠️ 이 정보는 다시 확인할 수 없습니다. 반드시 메모해주세요.</p>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(`아이디: ${success.loginId}\n비밀번호: ${success.password}`).catch(() => {}); alert("복사되었습니다!"); }}
            className="mt-4 w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">📋 로그인 정보 복사</button>
          <button onClick={() => router.push("/admin/store/employees")} className="mt-2 w-full py-2 bg-[#1B4332] text-white rounded-lg text-sm">
            직원 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/admin/store/employees" className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <ArrowLeft size={16} /> 직원 목록
      </Link>
      <h2 className="text-lg font-bold text-gray-800 mb-6">직원 등록</h2>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div><label className="block text-xs text-gray-500 mb-1">이름 *</label><input required value={form.name} onChange={e => handleNameChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">전화번호</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">이메일</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">주민등록번호</label><input value={form.residentNum} onChange={e => setForm({...form, residentNum: e.target.value})} placeholder="앞 6자리만 저장됩니다" className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">직급 *</label>
            <select value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="알바">알바</option>
              <option value="매니저">매니저</option>
            </select>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">입사일 *</label><input required type="date" value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">로그인 아이디 *</label><input required value={form.loginId} onChange={e => setForm({...form, loginId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">임시 비밀번호 *</label><input required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" /></div>
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">특징/메모</label><textarea value={form.characteristics} onChange={e => setForm({...form, characteristics: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none" /></div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-[#1B4332] text-white rounded-lg text-sm font-medium disabled:opacity-50">
          {loading ? "등록 중..." : "직원 등록"}
        </button>
      </form>
    </div>
  );
}
