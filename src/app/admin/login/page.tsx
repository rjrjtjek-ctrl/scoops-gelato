"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/fms/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password, remember }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }

      // 토큰 저장
      if (remember) {
        localStorage.setItem("fms_token", data.token);
      } else {
        sessionStorage.setItem("fms_token", data.token);
      }

      // 기존 admin 호환: admin_token도 설정
      if (data.user.role === "hq_admin") {
        sessionStorage.setItem("admin_token", data.token);
      }

      // 역할별 리다이렉트
      switch (data.user.role) {
        case "hq_admin":
          router.push("/admin/hq");
          break;
        case "franchisee":
          router.push("/admin/store");
          break;
        case "employee":
          router.push("/admin/staff");
          break;
        default:
          router.push("/admin");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-8">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 relative mx-auto mb-4">
            <Image src="/images/logo_symbol.png" alt="SCOOPS" fill className="object-contain" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "#2C1810" }}>
            SCOOPS GELATO
          </h1>
          <p className="text-sm text-gray-500 mt-1">가맹점 관리 시스템</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2C1810] text-sm"
              placeholder="아이디를 입력하세요"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2C1810] text-sm"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              로그인 정보 기억하기
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-medium text-sm transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#2C1810" }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
