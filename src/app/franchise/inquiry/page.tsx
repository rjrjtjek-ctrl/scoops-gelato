"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SubNav from "@/components/SubNav";

export default function FranchiseInquiryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", region: "", budget: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/franchise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("전송에 실패했습니다. 다시 시도해주세요.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <main className="pt-[80px]">
      <SubNav category="FRANCHISE" />
      {/* 히어로 */}
      <section className="bg-bg-warm section-padding">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[12px] tracking-[0.2em] text-brand-secondary uppercase mb-4">Franchise Inquiry</p>
          <h1 className="text-3xl md:text-5xl font-light text-brand-primary mb-6">가맹점 상담신청</h1>
          <p className="text-text-body max-w-[600px] mx-auto leading-relaxed">
            스쿱스젤라또 가맹에 관심이 있으시다면 아래 양식을 작성해 주세요.
            담당자가 빠르게 연락드리겠습니다.
          </p>
        </div>
      </section>

      {/* 상담 신청 폼 */}
      <section className="bg-bg-white section-padding">
        <div className="max-w-[700px] mx-auto px-6 md:px-12">
          {submitted ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-brand-primary mb-4">상담 신청이 완료되었습니다</h2>
              <p className="text-text-body">영업일 기준 1~2일 내에 담당자가 연락드리겠습니다.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 필수: 이름 + 전화번호 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brand-primary mb-2">이름 *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-bg-cream focus:outline-none focus:border-brand-primary text-sm" placeholder="홍길동" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-primary mb-2">연락처 *</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-bg-cream focus:outline-none focus:border-brand-primary text-sm" placeholder="010-0000-0000" />
                </div>
              </div>

              {/* 선택사항 접이식 */}
              <button
                type="button"
                onClick={() => setShowExtra(!showExtra)}
                className="flex items-center gap-2 text-sm text-text-light hover:text-brand-primary transition"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showExtra ? "rotate-180" : ""}`} />
                추가 정보 입력 (선택)
              </button>

              {showExtra && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-sm font-medium text-brand-primary mb-2">이메일</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-bg-cream focus:outline-none focus:border-brand-primary text-sm" placeholder="example@email.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-primary mb-2">희망 지역</label>
                    <input type="text" name="region" value={formData.region} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-bg-cream focus:outline-none focus:border-brand-primary text-sm" placeholder="예: 서울 강남구" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-primary mb-2">예상 투자 금액</label>
                    <select name="budget" value={formData.budget} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-bg-cream focus:outline-none focus:border-brand-primary text-sm">
                      <option value="">선택해주세요</option>
                      <option>5,000만원 미만</option>
                      <option>5,000만원 ~ 1억원</option>
                      <option>1억원 ~ 2억원</option>
                      <option>2억원 이상</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-primary mb-2">문의 내용</label>
                    <textarea name="message" rows={5} value={formData.message} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-bg-cream focus:outline-none focus:border-brand-primary text-sm resize-none" placeholder="궁금하신 사항을 자유롭게 작성해 주세요." />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <input type="checkbox" required className="mt-1" />
                <p className="text-xs text-text-body leading-relaxed">
                  개인정보 수집 및 이용에 동의합니다. 수집된 정보는 가맹상담 목적으로만 사용되며, 상담 완료 후 즉시 파기됩니다.
                </p>
              </div>

              <button type="submit" className="w-full btn-filled rounded-xl py-4">
                무료 상담 신청 →
              </button>
            </form>
          )}

          {/* 전화 상담 */}
          <div className="mt-12 p-6 bg-bg-cream rounded-2xl text-center">
            <p className="text-sm text-text-body mb-2">전화 상담을 원하시나요?</p>
            <a href="tel:18110259" className="text-xl text-brand-primary font-medium">1811-0259</a>
            <p className="text-xs text-text-light mt-1">평일 09:00 – 18:00</p>
          </div>
        </div>
      </section>
    </main>
  );
}
