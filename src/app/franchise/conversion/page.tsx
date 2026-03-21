"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import SubNav from "@/components/SubNav";
import {
  RefreshCw,
  Coffee,
  Wine,
  IceCreamCone,
  Sun,
  Moon,
  BarChart3,
  Wrench,
  ClipboardCheck,
  MapPin,
  FileText,
  GraduationCap,
  HeadphonesIcon,
  ChevronDown,
  Phone,
  ArrowRight,
} from "lucide-react";

/* ── 애니메이션 ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── 고충 데이터 ── */
const painCafe = [
  "주변에 카페가 너무 많아 차별화가 어렵다",
  "아메리카노 마진으로는 운영이 빠듯하다",
  "메뉴를 바꿔봐도 근본적 해결이 되지 않는다",
];
const painBar = [
  "저녁에만 운영하니 낮 시간 공간이 아깝다",
  "낮 매출을 만들고 싶지만 방법을 찾기 어렵다",
  "주류 트렌드 변화에 불안감이 있다",
];

/* ── 전환 프로세스 ── */
const steps = [
  { num: "01", title: "무료 상담 신청", desc: "현재 매장 상황 파악", icon: Phone },
  { num: "02", title: "현장 방문 & 매장 진단", desc: "전환 가능성 분석\n기존 설비 활용도 파악", icon: MapPin },
  { num: "03", title: "맞춤 전환 제안서", desc: "사장님 매장에 맞는\n플랜 & 견적", icon: FileText },
  { num: "04", title: "계약 & 리뉴얼 공사", desc: "기존 설비 최대 활용\n약 4~8주", icon: Wrench },
  { num: "05", title: "교육 & 오픈", desc: "젤라또 제조 + 매장 운영\n집중 교육", icon: GraduationCap },
  { num: "06", title: "지속 관리", desc: "정기 방문, 신메뉴\n마케팅 지원", icon: HeadphonesIcon },
];

/* ── FAQ ── */
const faqs = [
  {
    q: "기존 인테리어를 완전히 바꿔야 하나요?",
    a: "아닙니다. 매장 상태에 따라 부분 리뉴얼로 전환이 가능합니다. 현장 방문 후 사장님 매장에 맞는 맞춤 제안을 드립니다.",
  },
  {
    q: "젤라또 만드는 게 어렵지 않나요?",
    a: "본사에서 2주 이상 집중 교육을 제공합니다. 처음 접하시는 분도 충분히 배우실 수 있도록 체계적으로 안내해드립니다.",
  },
  {
    q: "주류 면허가 없으면 위스키/와인 판매가 안 되나요?",
    a: "주류 면허 취득 절차를 본사에서 안내해드립니다. 기존 바를 운영하셨던 분은 기존 면허를 그대로 활용하실 수 있습니다.",
  },
  {
    q: "전환 기간은 얼마나 걸리나요?",
    a: "매장 상태에 따라 다르지만, 보통 4~8주 내 리뉴얼 오픈이 가능합니다.",
  },
  {
    q: "전환 비용은 얼마인가요?",
    a: "매장 상태, 면적, 기존 설비 활용도에 따라 달라집니다. 무료 상담을 통해 사장님 매장에 맞는 맞춤 견적을 제공해드립니다.",
  },
];

export default function ConversionPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <SubNav category="FRANCHISE" />
      {/* ════════════ 히어로 ════════════ */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end">
        <Image src="/images/crowd-1.jpg" alt="스쿱스 매장" fill sizes="100vw" className="object-cover" priority unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10" />
        <motion.div
          className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pb-12 md:pb-16 w-full"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-[#A68B5B]/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
            <RefreshCw className="w-3.5 h-3.5 text-[#A68B5B]" />
            <span className="text-xs text-[#A68B5B] font-medium tracking-wide">업종변경 안내</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white mb-4 leading-[1.3]">
            사장님의 매장,<br />스쿱스로 리뉴얼하세요
          </motion.h1>
          <motion.p variants={fadeUp} className="text-white/70 text-[15px] leading-[1.9] mb-8 max-w-lg">
            카페·바 매장을 프리미엄 디저트 바로 전환하는 가장 빠른 방법
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/franchise#inquiry"
              className="inline-flex items-center gap-2 bg-[#A68B5B] text-white px-8 py-4 text-sm tracking-[0.05em] font-medium rounded-full hover:bg-[#A68B5B]/80 transition-colors duration-300"
            >
              무료 전환 상담 신청
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ 섹션 1: 고충 공감 ════════════ */}
      <section className="py-12 md:py-20 bg-bg-cream">
        <motion.div
          className="max-w-[1400px] mx-auto px-6 md:px-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-10 md:mb-14">
            <p className="text-sm text-brand-secondary tracking-[0.15em] uppercase mb-3">Pain Points</p>
            <h2 className="text-2xl md:text-4xl font-bold text-text-dark leading-[1.3]">
              이런 고민, 하고 계시죠?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* 카페 사장님 */}
            <motion.div variants={fadeUp} className="bg-bg-white rounded-2xl p-7 md:p-9 shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="text-lg font-bold text-text-dark">카페 사장님</h3>
              </div>
              <div className="space-y-4">
                {painCafe.map((pain, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary mt-2 flex-shrink-0" />
                    <p className="text-sm text-text-light leading-[1.8]">{pain}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 바 사장님 */}
            <motion.div variants={fadeUp} className="bg-bg-white rounded-2xl p-7 md:p-9 shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <Wine className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="text-lg font-bold text-text-dark">바 사장님</h3>
              </div>
              <div className="space-y-4">
                {painBar.map((pain, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary mt-2 flex-shrink-0" />
                    <p className="text-sm text-text-light leading-[1.8]">{pain}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════ 섹션 2: 스쿱스라는 대안 ════════════ */}
      <section className="relative py-14 md:py-20">
        <Image src="/images/store-gongdeok-int.jpg" alt="스쿱스 매장 내부" fill sizes="100vw" className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-brand-primary/88" />
        <motion.div
          className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-10 md:mb-14">
            <p className="text-sm text-brand-secondary tracking-[0.15em] uppercase mb-3">Solution</p>
            <h2 className="text-2xl md:text-4xl font-bold text-white leading-[1.3] mb-4">
              스쿱스라는 대안
            </h2>
            <p className="text-white/60 text-[15px] max-w-xl mx-auto leading-[1.8]">
              젤라또 + 위스키 + 와인, 하루 종일 매출이 나는 복합매장
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Sun, time: "낮", title: "프리미엄 수제 젤라또 & 커피", desc: "오전부터 오후까지, 수제 젤라또와 스페셜티 커피로 꾸준한 낮 매출을 만듭니다." },
              { icon: Moon, time: "저녁", title: "위스키 & 와인 × 젤라또 페어링", desc: "저녁에는 프리미엄 위스키, 와인과 함께 특별한 젤라또 페어링 경험을 제공합니다." },
              { icon: BarChart3, time: "결과", title: "하루 종일 가동되는 매장", desc: "낮과 밤 모두 매출이 발생하는 구조로, 공간 활용도를 극대화합니다." },
            ].map((item) => (
              <motion.div
                key={item.time}
                variants={fadeUp}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-7 border border-white/10 hover:bg-white/15 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-brand-secondary" />
                </div>
                <span className="text-xs text-brand-secondary font-semibold tracking-wider uppercase">{item.time}</span>
                <h3 className="text-lg font-bold text-white mt-2 mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm leading-[1.8]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ════════════ 섹션 3: 이렇게 바뀝니다 ════════════ */}
      <section className="py-12 md:py-20 bg-bg-white">
        <motion.div
          className="max-w-[1400px] mx-auto px-6 md:px-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-10 md:mb-14">
            <p className="text-sm text-brand-secondary tracking-[0.15em] uppercase mb-3">Transformation</p>
            <h2 className="text-2xl md:text-4xl font-bold text-text-dark leading-[1.3]">
              사장님 매장, 이렇게 바뀝니다
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* 카페 → 스쿱스 */}
            <motion.div variants={fadeUp} className="bg-bg-cream rounded-2xl p-7 md:p-9 border border-black/5">
              <div className="flex items-center gap-3 mb-7">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-dark">
                  <Coffee className="w-4 h-4 text-brand-primary" />
                  <span>카페</span>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-secondary" />
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
                  <IceCreamCone className="w-4 h-4" />
                  <span>스쿱스</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  "기존 냉장/냉동 설비 활용 가능 → 설비 투자 절감",
                  "카운터/싱크대 구조 호환 → 부분 리뉴얼로 전환",
                  "카페에 없던 저녁 주류 매출 추가",
                  "기존 고객 응대 경험 그대로 활용",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ClipboardCheck className="w-4 h-4 text-brand-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-text-light leading-[1.8]">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 바 → 스쿱스 */}
            <motion.div variants={fadeUp} className="bg-bg-cream rounded-2xl p-7 md:p-9 border border-black/5">
              <div className="flex items-center gap-3 mb-7">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-dark">
                  <Wine className="w-4 h-4 text-brand-primary" />
                  <span>바</span>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-secondary" />
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
                  <IceCreamCone className="w-4 h-4" />
                  <span>스쿱스</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  "주류 판매 면허 그대로 활용 → 위스키/와인 즉시 판매",
                  "기존 바 분위기가 프리미엄 콘셉트와 호환",
                  "낮 시간 젤라또+커피 매출 추가",
                  "부분 리뉴얼로 전환 가능",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ClipboardCheck className="w-4 h-4 text-brand-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-text-light leading-[1.8]">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════ 섹션 4: 전환 프로세스 ════════════ */}
      <section className="py-12 md:py-20 bg-bg-cream">
        <motion.div
          className="max-w-[1400px] mx-auto px-6 md:px-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-10 md:mb-14">
            <p className="text-sm text-brand-secondary tracking-[0.15em] uppercase mb-3">Process</p>
            <h2 className="text-2xl md:text-4xl font-bold text-text-dark leading-[1.3]">전환 프로세스</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="bg-bg-white rounded-2xl p-5 text-center shadow-sm border border-black/5 hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-11 h-11 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-5 h-5 text-brand-primary" />
                </div>
                <span className="text-2xl font-bold text-brand-secondary/30">{step.num}</span>
                <h4 className="text-sm font-bold text-text-dark mt-2 mb-2">{step.title}</h4>
                <p className="text-xs text-text-light leading-[1.7] whitespace-pre-line">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ════════════ AI 상권분석 배너 ════════════ */}
      <section className="py-10 md:py-14 bg-bg-white">
        <motion.div
          className="max-w-[1400px] mx-auto px-6 md:px-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="relative overflow-hidden bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-2xl p-8 md:p-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#A68B5B]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#A68B5B]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-[#A68B5B]/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-7 h-7 text-[#A68B5B]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs text-white/40 tracking-wider uppercase mb-1">Scoops × AI</p>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                  창업 전, AI로 상권부터 분석해보세요
                </h3>
                <p className="text-sm text-white/60 leading-[1.8]">
                  스쿱스젤라또가 만든 AI 상권분석 서비스 &ldquo;여기돼?&rdquo;에서
                  주소만 입력하면 업종별 맞춤 분석 리포트를 무료로 받아보실 수 있습니다.
                </p>
              </div>
              <a
                href="https://www.xn--ok0bz3ittr.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#A68B5B] text-white px-7 py-3.5 text-sm font-semibold rounded-full hover:bg-[#A68B5B]/80 transition-colors duration-300 whitespace-nowrap flex-shrink-0"
              >
                무료 상권분석 시작
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ 섹션 5: FAQ ════════════ */}
      <section className="py-12 md:py-20 bg-bg-white">
        <motion.div
          className="max-w-[900px] mx-auto px-6 md:px-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-10 md:mb-14">
            <p className="text-sm text-brand-secondary tracking-[0.15em] uppercase mb-3">FAQ</p>
            <h2 className="text-2xl md:text-4xl font-bold text-text-dark leading-[1.3]">자주 묻는 질문</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-bg-cream rounded-xl border border-black/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-text-dark pr-4">
                    <span className="text-brand-secondary mr-2">Q.</span>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-text-light flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5">
                    <p className="text-sm text-text-light leading-[1.8]">
                      <span className="text-brand-primary font-semibold mr-2">A.</span>
                      {faq.a}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ════════════ 하단 CTA ════════════ */}
      <section className="relative py-16 md:py-24">
        <Image src="/images/crowd-6.jpg" alt="스쿱스 매장" fill sizes="100vw" className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-brand-primary/80" />
        <motion.div
          className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-bold text-white mb-4 leading-[1.3]">
            사장님의 매장,<br />새로운 시작을 함께하겠습니다
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 text-[15px] leading-[1.9] mb-8 max-w-lg mx-auto">
            무료 상담을 통해 사장님 매장에 맞는 최적의 전환 방안을 제안해드립니다.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/franchise#inquiry"
              className="inline-flex items-center gap-2 bg-[#A68B5B] text-white px-10 py-4 text-sm tracking-[0.05em] font-medium rounded-full hover:bg-[#A68B5B]/80 transition-colors duration-300"
            >
              무료 전환 상담 신청
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:18110259"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 text-sm tracking-[0.05em] font-medium rounded-full hover:bg-white/10 transition-colors duration-300"
            >
              <Phone className="w-4 h-4" />
              전화 상담: 1811-0259
            </a>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
