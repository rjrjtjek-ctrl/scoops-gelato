"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Check, Shield, GraduationCap, Handshake, Coffee, Wine, Smartphone, ChevronDown } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// 전화번호 입력 + 제출 컴포넌트
function PhoneForm({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPhone = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
  };

  const handleSubmit = async () => {
    const nums = phone.replace(/\D/g, "");
    if (nums.length < 10) return;
    setLoading(true);
    try {
      await fetch("/api/franchise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "랜딩페이지 문의",
          phone: phone,
          email: "",
          region: "",
          budget: "",
          message: "가맹비 0원 랜딩페이지에서 신청",
        }),
      });
      setSubmitted(true);
    } catch {
      alert("전송 실패. 1811-0259로 전화해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-lg font-semibold ${variant === "dark" ? "text-green-300" : "text-[#1B4332]"}`}>
        <Check className="w-6 h-6" />
        신청 완료! 곧 연락드리겠습니다
      </div>
    );
  }

  return (
    <div className="flex gap-2 w-full max-w-[420px] mx-auto">
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        placeholder="010-0000-0000"
        className="flex-1 px-5 py-4 rounded-xl text-[16px] text-[#1B4332] bg-white border-0 outline-none placeholder:text-gray-400"
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || phone.replace(/\D/g, "").length < 10}
        className="px-6 py-4 bg-[#A68B5B] text-white rounded-xl font-bold text-sm whitespace-nowrap disabled:opacity-50 active:scale-[0.97] transition-all"
      >
        {loading ? "전송중..." : "무료 상담 신청 →"}
      </button>
    </div>
  );
}

export default function FranchiseLandingPage() {
  return (
    <div className="min-h-screen font-sans">
      {/* ═══ 섹션 1: 히어로 ═══ */}
      <section className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white px-6 py-20 md:py-28">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-[600px] mx-auto text-center"
        >
          <p className="text-[#A68B5B] text-sm tracking-widest mb-4">SCOOPS GELATERIA</p>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">가맹비 0원</h1>
          <p className="text-white/70 text-lg mb-10">스쿱스젤라또와 함께 시작하세요</p>

          <PhoneForm variant="dark" />

          <p className="text-white/40 text-xs mt-4">24시간 내 대표가 직접 연락드립니다</p>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-12 text-white/30"
          >
            <ChevronDown className="w-6 h-6 mx-auto" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 섹션 2: 신뢰 ═══ */}
      <section className="bg-[#F5F0EB] px-6 py-16 md:py-20">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-[800px] mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B4332] text-center mb-12">부풀리지 않습니다</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "가맹비 0원", desc: "다른 프랜차이즈처럼 높게 책정하고 할인해주는 척 하지 않습니다" },
              { icon: GraduationCap, title: "교육비 100만원", desc: "실제 교육에 드는 비용만 받습니다" },
              { icon: Handshake, title: "보증금 조건부 면제", desc: "신뢰가 곧 보증입니다" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center"
              >
                <item.icon className="w-8 h-8 text-[#A68B5B] mx-auto mb-3" />
                <p className="text-[#1B4332] font-bold text-lg mb-2">{item.title}</p>
                <p className="text-[#555] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ 섹션 3: 경쟁력 ═══ */}
      <section className="bg-white px-6 py-16 md:py-20">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-[800px] mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B4332] text-center mb-3">
            사장님 혼자 돌리는 프리미엄 디저트 바
          </h2>
          <p className="text-center text-[#999] text-sm mb-12">1인 운영 구조로 설계되었습니다</p>

          <div className="space-y-6">
            {[
              { icon: Coffee, title: "프리믹스 생산 시스템", desc: "우유 + 생크림 + 프리믹스 + 맛 원료만으로 프리미엄 젤라또" },
              { icon: Wine, title: "낮엔 젤라또, 저녁엔 위스키&와인", desc: "하루 두 번 매출 구조" },
              { icon: Smartphone, title: "QR 모바일 주문", desc: "인건비 절감, 1인 운영 가능" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 bg-[#F5F0EB] rounded-2xl p-5"
              >
                <div className="w-12 h-12 bg-[#1B4332] rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[#1B4332] font-bold mb-1">{item.title}</p>
                  <p className="text-[#555] text-sm">{item.desc}</p>
                  {i === 2 && (
                    <Link
                      href="/order/demo"
                      className="inline-block mt-2 px-4 py-1.5 border border-[#A68B5B] text-[#A68B5B] text-xs font-bold rounded-lg hover:bg-[#A68B5B] hover:text-white transition-colors"
                    >
                      👆 직접 체험해보기
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-[#999] text-xs mt-8">현재 전국 17개 매장 운영 중</p>
        </motion.div>
      </section>

      {/* ═══ 섹션 4: 비용 투명 공개 ═══ */}
      <section className="bg-[#F5F0EB] px-6 py-16 md:py-20">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-[600px] mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B4332] text-center mb-10">숨기는 비용 없습니다</h2>

          <div className="bg-white rounded-2xl overflow-hidden">
            {[
              { item: "가맹비", price: "0원 (면제)", highlight: true },
              { item: "교육비", price: "100만원", highlight: false },
              { item: "보증금", price: "조건부 면제", highlight: false },
              { item: "인테리어", price: "별도 (평당 약 250만원)", highlight: false },
              { item: "초도물품", price: "2,500만원~", highlight: false },
            ].map((row, i) => (
              <div key={i} className={`flex items-center justify-between px-6 py-4 ${i > 0 ? "border-t border-gray-100" : ""} ${row.highlight ? "bg-[#1B4332]/5" : ""}`}>
                <span className="text-[#555] text-sm">{row.item}</span>
                <span className={`font-bold text-sm ${row.highlight ? "text-[#1B4332] text-lg" : "text-[#2A2A2A]"}`}>{row.price}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-[#999] text-xs mt-4">상담 시 평수별 정확한 견적을 안내드립니다</p>
        </motion.div>
      </section>

      {/* ═══ 섹션 5: 마지막 CTA ═══ */}
      <section className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white px-6 py-20">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-[600px] mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">지금 바로 상담받으세요</h2>
          <p className="text-white/60 mb-10">가맹비 0원 파트너 모집 중</p>

          <PhoneForm variant="dark" />

          <div className="mt-6">
            <a
              href="tel:1811-0259"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition"
            >
              <Phone className="w-4 h-4" />
              전화로 바로 상담 1811-0259
            </a>
          </div>

          <p className="text-white/20 text-xs mt-16">© SCOOPS GELATERIA | 대표번호 1811-0259</p>
        </motion.div>
      </section>
    </div>
  );
}
