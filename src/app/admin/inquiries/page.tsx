"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  message?: string;
  time: string;
  kakaoSent: boolean;
  kakaoError?: string;
  read: boolean;
  createdAt: string;
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9F7F3] flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    }>
      <InquiriesContent />
    </Suspense>
  );
}

function InquiriesContent() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  const token = typeof window !== "undefined" ? (sessionStorage.getItem("admin_token") || localStorage.getItem("fms_token") || sessionStorage.getItem("fms_token")) : null;

  const fetchInquiries = useCallback(async () => {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/admin/inquiries", {
        headers,
        credentials: "include",
      });
      if (res.status === 401) {
        sessionStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch {
      console.error("문의 목록 로딩 실패");
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const markRead = async (id: string) => {
    if (!token) return;
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
  };

  const filteredInquiries = filter === "kakao-fail"
    ? inquiries.filter((i) => !i.kakaoSent)
    : inquiries;

  const selected = inquiries.find((i) => i.id === selectedId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F3] flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* 상단 바 — 대시보드와 통일된 브랜드 컬러 */}
      <header className="bg-[#1B4332] text-white px-4 md:px-6 py-3 md:py-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => router.push("/admin/login")}
                className="text-white/60 hover:text-white transition text-sm"
              >
                ← 대시보드
              </button>
              <h1 className="text-base md:text-xl font-bold">📝 가맹 문의</h1>
            </div>
            {selectedId && (
              <button
                onClick={() => setSelectedId(null)}
                className="lg:hidden text-sm text-white/70 bg-white/10 px-3 py-1.5 rounded-lg"
              >
                ← 목록
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/admin/inquiries")}
              className={`text-xs md:text-sm px-3 py-1.5 rounded-lg transition ${
                !filter ? "bg-white text-[#1B4332] font-semibold" : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              전체 ({inquiries.length})
            </button>
            <button
              onClick={() => router.push("/admin/inquiries?filter=kakao-fail")}
              className={`text-xs md:text-sm px-3 py-1.5 rounded-lg transition ${
                filter === "kakao-fail" ? "bg-red-500 text-white font-semibold" : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              카톡실패 ({inquiries.filter((i) => !i.kakaoSent).length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
            <p className="text-gray-400 text-base md:text-lg">
              {filter === "kakao-fail" ? "카카오톡 전송 실패 건이 없습니다." : "아직 가맹 문의가 없습니다."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* 문의 목록 — 모바일에서 상세 선택 시 숨김 */}
            <div className={`lg:col-span-1 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto ${selectedId ? "hidden lg:block" : ""}`}>
              {filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => {
                    setSelectedId(inquiry.id);
                    if (!inquiry.read) markRead(inquiry.id);
                  }}
                  className={`bg-white rounded-xl p-4 cursor-pointer transition border ${
                    selectedId === inquiry.id
                      ? "border-[#1B4332] shadow-md"
                      : "border-gray-100 hover:border-gray-300"
                  } ${!inquiry.read ? "ring-2 ring-[#1B4332]/20" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {!inquiry.read && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      )}
                      <span className="font-semibold text-[#1B4332]">{inquiry.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {inquiry.kakaoSent ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">카톡전송</span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">카톡실패</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{inquiry.region}</p>
                  <p className="text-xs text-gray-400 mt-1">{inquiry.time}</p>
                </div>
              ))}
            </div>

            {/* 문의 상세 — 모바일에서 선택 안 됐으면 숨김 */}
            <div className={`lg:col-span-2 ${!selectedId ? "hidden lg:block" : ""}`}>
              {selected ? (
                <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#1B4332]">{selected.name}</h2>
                      <p className="text-sm text-gray-400 mt-1">{selected.time}</p>
                    </div>
                    {selected.kakaoSent ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        카카오톡 전송 완료
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium">
                        카카오톡 전송 실패
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">연락처</p>
                        <a href={`tel:${selected.phone}`} className="text-[#1B4332] font-semibold hover:underline">
                          {selected.phone}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">이메일</p>
                        <a href={`mailto:${selected.email}`} className="text-[#1B4332] font-semibold hover:underline">
                          {selected.email}
                        </a>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">희망 지역</p>
                      <p className="text-gray-800 font-medium">{selected.region}</p>
                    </div>

                    {selected.message && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">문의 내용</p>
                        <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm leading-relaxed">
                          {selected.message}
                        </div>
                      </div>
                    )}

                    {!selected.kakaoSent && selected.kakaoError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-xs text-red-500 font-semibold mb-1">카카오톡 전송 실패 사유</p>
                        <p className="text-sm text-red-700">{selected.kakaoError}</p>
                      </div>
                    )}

                    {!selected.kakaoSent && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-800 font-medium">
                          이 문의는 카카오톡 알림이 전송되지 않았습니다. 직접 연락해주세요.
                        </p>
                        <div className="flex gap-3 mt-3">
                          <a
                            href={`tel:${selected.phone}`}
                            className="bg-[#1B4332] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2D6A4F] transition"
                          >
                            전화하기
                          </a>
                          <a
                            href={`mailto:${selected.email}`}
                            className="bg-white text-[#1B4332] border border-[#1B4332] text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                          >
                            이메일 보내기
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 md:p-12 text-center border border-gray-100">
                  <p className="text-gray-400 text-sm md:text-base">문의를 선택하세요</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
