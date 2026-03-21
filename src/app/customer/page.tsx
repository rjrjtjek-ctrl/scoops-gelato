"use client";

import { useState, useEffect, useCallback } from "react";
import SubNav from "@/components/SubNav";

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

const categories = ["전체", "매장 이용", "메뉴", "가맹", "기타"];

export default function CustomerPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/customer");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      console.error("글 목록 불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: formCategory, author: formName, title: formTitle, content: formContent }),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormName(""); setFormCategory(""); setFormTitle(""); setFormContent("");
        fetchPosts();
      }
    } catch {
      alert("등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const filtered = activeCategory === "전체" ? posts : posts.filter((r) => r.category === activeCategory);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <main className="pt-[80px]">
      <SubNav category="CUSTOMER" />
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Customer Voice</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">고객의 소리</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            소중한 의견 하나하나가 스쿱스를 더 좋은 브랜드로 만듭니다.
          </p>
        </div>
      </section>

      <section className="bg-bg-white section-padding">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`text-sm px-4 py-2 rounded-full transition-colors ${activeCategory === cat ? "bg-brand-primary text-white" : "bg-bg-cream text-text-body hover:bg-brand-primary/10"}`}>
                  {cat}
                </button>
              ))}
            </div>
            <button onClick={() => { setShowForm(!showForm); setSubmitted(false); }} className="btn-filled rounded-xl px-6 py-2.5 text-sm">
              {showForm ? "목록 보기" : "글쓰기"}
            </button>
          </div>

          {showForm ? (
            submitted ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-xl font-light text-brand-primary mb-3">소중한 의견 감사합니다</h2>
                <p className="text-sm text-text-body">빠른 시일 내에 확인 후 답변드리겠습니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-primary mb-2">이름 *</label>
                    <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-bg-cream focus:outline-none focus:border-brand-primary text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-primary mb-2">카테고리 *</label>
                    <select required value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-bg-cream focus:outline-none focus:border-brand-primary text-sm">
                      <option value="">선택해주세요</option>
                      <option>매장 이용</option><option>메뉴</option><option>가맹</option><option>기타</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-primary mb-2">제목 *</label>
                  <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-bg-cream focus:outline-none focus:border-brand-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-primary mb-2">내용 *</label>
                  <textarea rows={6} required value={formContent} onChange={(e) => setFormContent(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-bg-cream focus:outline-none focus:border-brand-primary text-sm resize-none" />
                </div>
                <button type="submit" className="w-full btn-filled rounded-xl py-4">등록하기</button>
              </form>
            )
          ) : loading ? (
            <div className="text-center py-16 text-text-light">불러오는 중...</div>
          ) : (
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-text-light">등록된 글이 없습니다.</div>
              ) : filtered.map((review) => (
                <div key={review.id} className="p-6 bg-bg-cream rounded-2xl cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => setExpandedId(expandedId === review.id ? null : review.id)}>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-[11px] bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full">{review.category}</span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${review.status === "답변완료" ? "bg-brand-primary text-white" : "bg-brand-secondary/20 text-brand-secondary"}`}>{review.status}</span>
                    <span className="text-xs text-text-light ml-auto">{formatDate(review.createdAt)}</span>
                  </div>
                  <h3 className="text-base font-medium text-brand-primary mb-2">{review.title}</h3>
                  <p className="text-sm text-text-body leading-relaxed">{review.content}</p>
                  <p className="text-xs text-text-light mt-3">{review.author}</p>
                  {expandedId === review.id && review.reply && (
                    <div className="mt-4 p-4 bg-bg-white rounded-xl border-l-4 border-brand-primary">
                      <p className="text-[11px] text-brand-secondary font-medium mb-1">스쿱스젤라또 답변</p>
                      <p className="text-sm text-text-body leading-relaxed">{review.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-bg-cream py-16">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <p className="text-sm text-text-body mb-2">급한 문의는 전화로 연락주세요</p>
          <a href="tel:18110259" className="text-xl text-brand-primary font-medium">1811-0259</a>
          <p className="text-xs text-text-light mt-1">평일 09:00 – 18:00</p>
        </div>
      </section>
    </main>
  );
}
