"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// /admin 접속 시 인증 체크 → 역할별 리다이렉트
export default function AdminRootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/fms/auth/me", { cache: "no-store" });
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        switch (data.user.role) {
          case "hq_admin":
            router.replace("/admin/hq");
            break;
          case "franchisee":
            router.replace("/admin/store");
            break;
          case "employee":
            router.replace("/admin/staff");
            break;
          default:
            router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-gray-400 text-sm">확인 중...</div>
      </div>
    );
  }

  return null;
}
