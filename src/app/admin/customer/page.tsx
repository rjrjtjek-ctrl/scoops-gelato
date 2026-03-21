"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Post {
  id: string;
  category: string;
  author: string;
  title: string;
  content: string;
  status: string;
  reply?: string;
  createdAt: string;
}

export default function AdminCustomerPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyingId, setReplyingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const authRes = await fetch("/api/admin");
    const authData = await authRes.json();
    if (!authData.authenticated) { router.push("/admin/login"); return; }

    const res = await fetch("/api/customer");
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;

    const res = await fetch("/api/customer", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, reply: replyText }),
    });

    if (res.ok) {
      setPosts(posts.map((p) =>
        p.id === id ? { ...p, reply: replyText, status: "답변완료" } : p
      ));
      setReplyText("");
      setReplyingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">로딩 중...</p></div>;

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 relative"><Image src="/images/logo_symbol.png" alt="SCOOPS" fill className="object-contain" /></div>
            <div>
              <h1 className="text-sm font-semibold text-gray-800">고객의 소리 관리</h1>
              <p className="text-xs text-gray-400">SCOOPS ADMIN</p>
            </div>
          </Link>
          <Link href="/admin" className="text-xs text-gray-500 hover:text-gray-800">← 대시보드</Link>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">고객 게시글 목록</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">총 {posts.length}건</span>
            <span className="text-sm text-amber-600">미답변 {posts.filter((p) => p.status === "확인중").length}건</span>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{post.category}</span>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                    post.status === "답변완료" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>{post.status}</span>
                  <span className="text-sm font-medium text-gray-800">{post.title}</span>
                  <span className="text-xs text-gray-400 ml-auto">{post.author} · {formatDate(post.createdAt)}</span>
                </div>
              </div>

              {expandedId === post.id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 mb-4">{post.content}</p>

                  {post.reply ? (
                    <div className="bg-[#1B4332]/5 rounded-lg p-4 border-l-4 border-[#1B4332]">
                      <p className="text-xs text-[#1B4332] font-medium mb-1">관리자 답변</p>
                      <p className="text-sm text-gray-700">{post.reply}</p>
                    </div>
                  ) : (
                    <>
                      {replyingId === post.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="답변을 작성해주세요..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReply(post.id)}
                              className="bg-[#1B4332] text-white text-xs px-4 py-2 rounded-lg hover:bg-[#2D6A4F]"
                            >
                              답변 등록
                            </button>
                            <button
                              onClick={() => { setReplyingId(null); setReplyText(""); }}
                              className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-lg hover:bg-gray-200"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingId(post.id)}
                          className="bg-[#1B4332] text-white text-xs px-4 py-2 rounded-lg hover:bg-[#2D6A4F]"
                        >
                          답변 작성
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
