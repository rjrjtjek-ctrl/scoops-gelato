"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, TrendingUp, Truck, HeadphonesIcon, CheckCircle, ArrowRight } from "lucide-react";
import { regionOptions } from "@/lib/data";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const benefits = [
  { icon: GraduationCap, title: "체계적인 교육", desc: "젤라또 제조부터 매장 운영까지 본사의 전문 교육 프로그램을 제공합니다." },
  { icon: TrendingUp, title: "체계적인 운영 시스템", desc: "효율적인 운영 매뉴얼과 체계적인 시스템으로 안정적인 매장 운영을 지원합니다." },
  { icon: Truck, title: "원재료 직접 공급", desc: "본사가 직접 엄선한 프리미엄 원재료를 안정적으로 공급합니다." },
  { icon: HeadphonesIcon, title: "지속적인 지원", desc: "오픈 후에도 마케팅, 운영 컨설팅 등 지속적인 본사 지원을 받습니다." },
];

export default function FranchisePage() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};
    const name = data.get("name") as string, phone = data.get("phone") as string, email = data.get("email") as string, region = data.get("region") as string, message = data.get("message") as string;
    if (!name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!phone.trim()) newErrors.phone = "연락처를 입력해주세요"; else if (!/^[\d-]{10,13}$/.test(phone.replace(/\s/g, ""))) newErrors.phone = "올바른 전화번호 형식이 아닙니다";
    if (!email.trim()) newErrors.email = "이메일을 입력해주세요"; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "올바른 이메일 형식이 아닙니다";
    if (!region) newErrors.region = "희망 지역을 선택해주세요";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({}); setLoading(true);
    try { await fetch("/api/franchise", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, email, region, message }) }); setSubmitted(true); } catch { alert("전송 중 오류가 발생했습니다."); } finally { setLoading(false); }
  };
  const ic = "w-full px-5 py-3.5 border border-black/10 bg-bg-cream text-sm text-text-dark rounded-xl focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/20 outline-none transition-all placeholder:text-text-muted";

  return (<>
    {/* 히어로 — 고객 줄서기 풀스크린 */}
    <section className="relative h-[70vh] min-h-[500px]">
      <Image src="/images/crowd-1.jpg" alt="스쿱스 고객이 줄 서는 매장" fill sizes="100vw" className="object-cover" priority unoptimized />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="absolute inset-0 flex items-end"><div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-12 md:pb-20 w-full">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-white/60 tracking-[0.15em] uppercase mb-3">Franchise</motion.p>
          <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white leading-[1.3] mb-4">스쿱스와 함께<br />체계적인 창업 준비를</motion.h1>
          <motion.p variants={fadeUp} className="text-white/70 text-[15px]">체계적인 교육과 본사 지원으로 안정적인 창업을 함께 준비합니다.</motion.p>
        </motion.div>
      </div></div>
    </section>

    {/* 핵심 수치 */}
    <section className="py-10 md:py-14 bg-bg-cream">
      <motion.div className="max-w-[1400px] mx-auto px-6 md:px-12" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {[{ number: "17", label: "전국 매장 운영" }, { number: "20+", label: "수제 젤라또 메뉴" }, { number: "1811-0259", label: "가맹 상담 전화" }].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center bg-bg-white rounded-2xl py-8 md:py-10">
              <p className="text-2xl md:text-3xl text-brand-primary font-bold mb-1">{s.number}</p>
              <p className="text-text-light text-xs md:text-sm tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>

    {/* 가맹 장점 — 사진 배경 */}
    <section id="benefits" className="relative py-12 md:py-16 scroll-mt-[80px]">
      <Image src="/images/store-gwanjeo-int2.jpeg" alt="관저점 내부" fill sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-brand-primary/85" />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div className="mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-sm text-white/50 tracking-[0.15em] uppercase mb-3">Why Scoops?</p>
          <h2 className="text-2xl md:text-4xl font-bold text-white">스쿱스와 함께하는 이유</h2>
        </motion.div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          {benefits.map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4"><item.icon className="w-5 h-5 text-brand-secondary" /></div>
              <h3 className="text-lg text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-white/70 text-sm leading-[1.8]">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* QR 모바일 주문 체험 */}
    <section className="py-12 md:py-16 bg-bg-cream">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-text-light tracking-[0.15em] uppercase mb-2">Smart Order</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-brand-primary mb-3">QR 모바일 주문 시스템</motion.h2>
          <motion.p variants={fadeUp} className="text-text-body text-sm leading-[1.8] mb-8 max-w-2xl">
            고객이 테이블에서 QR코드를 스캔하면 메뉴 선택부터 주문까지 자동으로 처리됩니다.
            별도 인력 없이 1인 운영이 가능한 스마트 주문 시스템입니다.
          </motion.p>

          {/* 6단계 실제 UI 캡쳐 */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
            {[
              { step: "01", title: "매장식사 · 포장", img: "/images/demo/step1.jpg" },
              { step: "02", title: "메뉴 선택", img: "/images/demo/step2.jpg" },
              { step: "03", title: "맛 고르기", img: "/images/demo/step3.jpg" },
              { step: "04", title: "장바구니 추가", img: "/images/demo/step4.jpg" },
              { step: "05", title: "주류 메뉴", img: "/images/demo/step5.jpg" },
              { step: "06", title: "주문 완료", img: "/images/demo/step6.jpg" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EDE6DD]/60 hover:shadow-md transition-shadow"
              >
                <div className="aspect-[9/16] relative overflow-hidden bg-[#FDFBF8]">
                  <Image src={item.img} alt={item.title} fill sizes="(max-width: 768px) 33vw, 16vw" className="object-cover object-top" unoptimized />
                </div>
                <div className="p-2 text-center">
                  <p className="text-[9px] text-brand-secondary font-bold">STEP {item.step}</p>
                  <p className="text-[11px] font-bold text-brand-primary">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* 핵심 장점 + 체험 버튼 */}
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <ul className="space-y-2 text-sm text-text-body">
                <li className="flex items-start gap-2"><span className="text-brand-secondary font-bold">✓</span> 고객 QR 스캔 → 메뉴 선택 → 자동 주문 접수</li>
                <li className="flex items-start gap-2"><span className="text-brand-secondary font-bold">✓</span> 영수증 자동 출력 — 직원 없이도 주문 처리</li>
                <li className="flex items-start gap-2"><span className="text-brand-secondary font-bold">✓</span> 인건비 절감으로 수익성 향상</li>
              </ul>
            </div>
            <Link
              href="/order/demo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-white font-bold text-base rounded-2xl hover:bg-brand-accent transition-colors shadow-lg"
            >
              📱 직접 체험해보기 →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* 매장 갤러리 */}
    <section className="py-10 md:py-14 bg-bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div className="mb-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-sm text-text-light tracking-[0.15em] uppercase mb-2">Real Stores</p>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">고객이 줄 서는 매장</h2>
        </motion.div>
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          {["/images/crowd-2.jpg","/images/crowd-3.jpg","/images/crowd-4.jpg","/images/crowd-5.jpg","/images/store-gwanjeo-int.jpeg","/images/store-gongdeok-int3.jpeg","/images/store-yeouido-int.jpg","/images/store-gongdeok-int4.jpeg"].map((src, i) => (
            <motion.div key={i} variants={fadeUp} className="aspect-[4/3] rounded-xl overflow-hidden relative">
              <Image src={src} alt={`매장 사진 ${i+1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover hover:scale-105 transition-transform duration-500" unoptimized />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* 가맹점 개설절차 */}
    <section id="process" className="py-12 md:py-16 bg-bg-white scroll-mt-[80px]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-text-light tracking-[0.15em] uppercase mb-3">Process</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-bold text-brand-primary mb-8">가맹점 개설절차</motion.h2>
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "가맹 상담", desc: "전화 또는 온라인으로\n가맹 문의" },
              { step: "02", title: "현장 미팅", desc: "본사 방문 또는\n희망 상권 미팅" },
              { step: "03", title: "계약 체결", desc: "가맹 계약서 작성\n및 서명" },
              { step: "04", title: "매장 공사", desc: "인테리어 설계\n및 시공" },
              { step: "05", title: "교육·오픈", desc: "젤라또 제조 교육\n후 매장 오픈" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-bg-cream rounded-2xl p-5 text-center relative">
                <p className="text-3xl font-bold text-brand-secondary/30 mb-2">{item.step}</p>
                <h3 className="text-base font-bold text-brand-primary mb-1">{item.title}</h3>
                <p className="text-text-body text-xs leading-[1.7] whitespace-pre-line">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* 가맹점 개설비용 */}
    <section id="costs" className="relative py-12 md:py-16 scroll-mt-[80px]">
      <Image src="/images/store-gwanjeo-ext.jpeg" alt="관저점 외부" fill sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-brand-primary/90" />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-white/50 tracking-[0.15em] uppercase mb-3">Investment</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-bold text-white mb-8">가맹점 개설비용</motion.h2>
          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">기본 개설비용 (15평 기준)</h3>
              <div className="space-y-3">
                {[
                  { label: "가맹비", value: "0원 (면제)" },
                  { label: "교육비", value: "100만원" },
                  { label: "보증금", value: "조건부 면제 — 자세한 내용은 상담 시 안내" },
                  { label: "인테리어", value: "별도 (평당 약 250만원)" },
                  { label: "초도물품 (설비·집기)", value: "2,500만원~" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-white/70 text-sm">{item.label}</span>
                    <span className="text-white font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">본사 지원 항목</h3>
              <ul className="space-y-3">
                {[
                  "오픈 전 집중 교육 (2주 이상)",
                  "인테리어 설계 및 시공 관리",
                  "초기 마케팅 지원 (SNS, 배달앱)",
                  "정기 슈퍼바이저 방문 관리",
                  "신메뉴 레시피 지속 업데이트",
                  "원재료 안정 공급 시스템",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3"><CheckCircle className="w-4 h-4 text-brand-secondary mt-0.5 shrink-0" /><span className="text-white/80 text-sm">{text}</span></li>
                ))}
              </ul>
            </div>
          </motion.div>
          <motion.p variants={fadeUp} className="text-white/50 text-xs mt-4">※ 실제 비용은 매장 규모와 입지에 따라 달라질 수 있습니다. 자세한 상담은 전화로 문의해주세요.</motion.p>
        </motion.div>
      </div>
    </section>

    {/* FAQ */}
    <section id="faq" className="py-12 md:py-16 bg-bg-cream scroll-mt-[80px]">
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-text-light tracking-[0.15em] uppercase mb-3">FAQ</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-bold text-brand-primary mb-8">가맹문의 Q&A</motion.h2>
          <motion.div variants={fadeUp} className="space-y-4">
            {[
              { q: "젤라또 제조 경험이 없어도 창업할 수 있나요?", a: "네, 가능합니다. 본사에서 2주 이상의 체계적인 교육 프로그램을 통해 젤라또 제조부터 매장 운영까지 모든 노하우를 전수합니다." },
              { q: "가맹점 운영에 필요한 인원은 몇 명인가요?", a: "매장 규모에 따라 다르지만, 일반적으로 점주 포함 2~3명이면 운영이 가능합니다. 피크 시간대에는 추가 인원이 필요할 수 있습니다." },
              { q: "상권 분석도 도와주시나요?", a: "네, 본사에서 희망하시는 지역의 상권 분석을 진행하고 최적의 입지를 함께 선정합니다." },
              { q: "오픈 후에도 본사 지원을 받을 수 있나요?", a: "물론입니다. 정기적인 슈퍼바이저 방문, 마케팅 지원, 신메뉴 업데이트 등 지속적으로 가맹점을 지원합니다." },
              { q: "가맹점 운영 비용 구조는 어떻게 되나요?", a: "원재료비, 임대료, 인건비 등 주요 비용 항목과 구조는 상담 시 상세히 안내해 드립니다." },
            ].map((item, i) => (
              <div key={i} className="bg-bg-white rounded-xl p-5 shadow-sm border border-black/5">
                <h3 className="text-[15px] font-bold text-brand-primary mb-2">Q. {item.q}</h3>
                <p className="text-text-body text-sm leading-[1.8]">A. {item.a}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* 고객의 소리 */}
    <section id="voice" className="relative py-12 md:py-16 scroll-mt-[80px]">
      <Image src="/images/crowd-7.jpg" alt="스쿱스 고객" fill sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-white/50 tracking-[0.15em] uppercase mb-3">Customer Voice</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-bold text-white mb-8">고객의 소리</motion.h2>
          <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-6">
            {[
              { name: "김○○", store: "여의도점 방문", text: "매장에서 직접 만드는 젤라또라서 신선하고 맛이 정말 좋아요. 특히 갓지은쌀 맛이 독특하고 맛있습니다!" },
              { name: "이○○", store: "공덕점 방문", text: "인테리어가 너무 예쁘고 젤라또도 맛있어요. 에스프레소와 함께 먹는 아포가토가 최고입니다." },
              { name: "박○○", store: "청주본점 단골", text: "본점부터 다니는 단골인데 항상 품질이 일정하고 맛있어요. 새로운 메뉴가 나올 때마다 기대됩니다." },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <p className="text-white/90 text-sm leading-[1.9] mb-4">&ldquo;{item.text}&rdquo;</p>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-white font-semibold text-sm">{item.name}</p>
                  <p className="text-white/50 text-xs">{item.store}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* 정보공개서 등록번호 */}
    <section className="py-6 bg-bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="bg-bg-cream rounded-xl p-5 border border-black/5 text-center">
          <p className="text-sm text-text-body leading-[1.8]">본 가맹사업은 공정거래위원회에 정보공개서가 등록되어 있습니다.</p>
          <p className="text-sm text-brand-primary font-semibold mt-1">정보공개서 등록번호: 추후 안내 예정</p>
        </div>
      </div>
    </section>

    {/* 문의 폼 — 2컬럼 */}
    <section id="inquiry" className="py-10 md:py-14 bg-bg-white scroll-mt-[80px]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12"><div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-[300px] md:h-auto rounded-2xl overflow-hidden">
          <Image src="/images/store-gongdeok-int.jpg" alt="공덕점 내부" fill sizes="50vw" className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6"><div><p className="text-white/60 text-xs tracking-wider uppercase mb-1">Contact Us</p><p className="text-white text-xl font-bold">가맹 문의하기</p></div></div>
        </div>
        <div>
          <div className="mb-5"><h2 className="text-xl md:text-2xl font-bold text-brand-primary mb-2">가맹 문의하기</h2><p className="text-text-body text-sm">아래 양식을 작성해주시면 담당자가 연락드리겠습니다.</p></div>
          {submitted ? (
            <motion.div className="text-center py-10 bg-bg-cream rounded-2xl px-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
              <CheckCircle className="w-10 h-10 text-brand-secondary mx-auto mb-4" /><h3 className="text-lg text-brand-primary font-semibold mb-2">문의가 접수되었습니다</h3><p className="text-text-light text-sm mb-6">영업일 기준 1~2일 내에 연락드리겠습니다.</p>
              <div className="border-t border-black/5 pt-6">
                <p className="text-sm text-text-light mb-3">상담 대기 중, 희망 지역의 상권을 미리 분석해보세요!</p>
                <a href="https://www.xn--ok0bz3ittr.kr/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#A68B5B] text-white px-6 py-3 text-sm font-semibold rounded-full hover:bg-[#A68B5B]/80 transition-colors duration-300">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                  AI 무료 상권분석 바로가기
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
                </a>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-brand-primary font-medium mb-1.5">이름 *</label><input type="text" name="name" placeholder="홍길동" className={ic} />{errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name}</p>}</div>
              <div><label className="block text-sm text-brand-primary font-medium mb-1.5">연락처 *</label><input type="tel" name="phone" placeholder="010-0000-0000" className={ic} />{errors.phone && <p className="mt-1 text-red-500 text-xs">{errors.phone}</p>}</div>
              <div><label className="block text-sm text-brand-primary font-medium mb-1.5">이메일 *</label><input type="email" name="email" placeholder="example@email.com" className={ic} />{errors.email && <p className="mt-1 text-red-500 text-xs">{errors.email}</p>}</div>
              <div><label className="block text-sm text-brand-primary font-medium mb-1.5">희망 지역 *</label><select name="region" defaultValue="" className={ic}><option value="" disabled>지역을 선택해주세요</option>{regionOptions.map((r) => (<option key={r} value={r}>{r}</option>))}</select>{errors.region && <p className="mt-1 text-red-500 text-xs">{errors.region}</p>}</div>
              <div><label className="block text-sm text-brand-primary font-medium mb-1.5">문의 내용</label><textarea name="message" rows={4} placeholder="궁금하신 점이나 요청사항을 자유롭게 작성해주세요." className={`${ic} resize-none`} /></div>
              {/* 개인정보 수집 동의 */}
              <div className="bg-bg-cream rounded-xl p-4 border border-black/5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-brand-primary shrink-0" />
                  <span className="text-sm text-brand-primary font-medium">[필수] 개인정보 수집·이용에 동의합니다.</span>
                </label>
                <div className="mt-2 ml-7 text-xs text-text-body leading-[1.8] space-y-0.5">
                  <p>• 수집 목적: 가맹 상담 문의 접수 및 회신</p>
                  <p>• 수집 항목: 이름, 연락처, 이메일, 희망 지역, 문의 내용</p>
                  <p>• 보유 기간: 문의 접수일로부터 3년 (또는 동의 철회 시까지)</p>
                  <p>• 동의를 거부할 수 있으며, 거부 시 문의 접수가 제한됩니다.</p>
                </div>
                <div className="mt-2 ml-7"><Link href="/privacy" className="text-xs text-brand-secondary underline underline-offset-2">개인정보처리방침 전문 보기</Link></div>
              </div>
              <div className="pt-1"><button type="submit" disabled={loading || !privacyAgreed} className="w-full flex items-center justify-center gap-3 bg-brand-primary text-white py-3.5 text-sm tracking-[0.1em] font-medium rounded-full hover:bg-brand-accent transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "접수 중..." : "문의 접수하기"}{!loading && <ArrowRight className="w-4 h-4" />}</button></div>
            </form>
          )}
        </div>
      </div></div>
    </section>

    {/* 하단 전화 CTA — 사진 배경 */}
    <section className="relative py-12 md:py-16">
      <Image src="/images/crowd-6.jpg" alt="스쿱스 매장" fill sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-brand-primary/80" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">지금 바로 상담 받아보세요</h2>
        <p className="text-white/70 text-[15px] mb-6">전화 한 통으로 시작하는 체계적인 창업 준비</p>
        <a href="tel:1811-0259" className="inline-flex items-center gap-2 bg-brand-secondary text-white px-10 py-4 text-sm tracking-[0.1em] font-medium rounded-full hover:bg-brand-secondary/80 transition-colors duration-300">1811-0259 전화 상담</a>
      </div>
    </section>
  </>);
}
