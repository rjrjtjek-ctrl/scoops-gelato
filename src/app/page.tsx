"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { timeline, stores, menuItems } from "@/lib/data";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const signatureMenus = menuItems.filter((item) => item.isSignature).slice(0, 4);
const activeStores = stores.filter((s) => !s.isClosed);
const storesWithImages = stores.filter(s => s.image);

/* ─── 히어로 슬라이드쇼 데이터 (고해상도 이미지만 선별) ─── */
const heroSlides = [
  { src: "/images/store-gongdeok-int.jpg", alt: "스쿱스 공덕점 내부", caption: "서울 공덕점" },
  { src: "/images/store-gongdeok-ext.jpg", alt: "스쿱스 공덕점 외관", caption: "서울 공덕점" },
  { src: "/images/gelato-plating-hero.jpg", alt: "스쿱스 수제 젤라또", caption: "수제 젤라또" },
  { src: "/images/store-gongdeok-int2.jpg", alt: "스쿱스 공덕점 메뉴보드", caption: "서울 공덕점" },
  { src: "/images/crowd-1.jpg", alt: "스쿱스 매장 풍경", caption: "매장 풍경" },
];

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-14 md:py-20 bg-bg-cream overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          {/* 왼쪽: 사진 슬라이드 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={heroSlides[current].src}
                    alt={heroSlides[current].alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority={current === 0}
                    unoptimized
                  />
                </motion.div>
              </AnimatePresence>

              {/* 캡션 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent pt-12 pb-4 px-5 z-10">
                <p className="text-white/80 text-sm font-medium">{heroSlides[current].caption}</p>
              </div>

              {/* 좌우 버튼 */}
              <button
                onClick={() => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                onClick={() => setCurrent((prev) => (prev + 1) % heroSlides.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>

            {/* 인디케이터 — 사진 아래 */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`rounded-full transition-all duration-500 ${
                    idx === current ? "w-7 h-2 bg-brand-primary" : "w-2 h-2 bg-brand-primary/25"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* 오른쪽: 텍스트 콘텐츠 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="py-4"
          >
            <motion.p variants={fadeUp} className="text-sm text-text-light tracking-[0.15em] uppercase mb-4">
              Our Story
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-primary leading-[1.3] mb-6">
              a scoop of gelato,<br />스쿱스의 이야기
            </motion.h2>
            <motion.p variants={fadeUp} className="text-text-body text-[15px] leading-[1.9] mb-8">
              젤라또를 좋아하는 남매가 시작한 브랜드, 스쿱스 젤라떼리아.<br />
              2018년 충북 청주 봉명동의 작은 매장에서 첫 스쿱을 떠올린 이후,
              매일 매장에서 직접 만드는 신선한 수제 젤라또를 고집하고 있습니다.
            </motion.p>

            {/* 핵심 수치 */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <p className="text-2xl md:text-3xl font-bold text-brand-primary">17</p>
                <p className="text-xs text-text-light mt-1">전국 매장</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <p className="text-2xl md:text-3xl font-bold text-brand-primary">20+</p>
                <p className="text-xs text-text-light mt-1">젤라또 맛</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <p className="text-2xl md:text-3xl font-bold text-brand-primary">8년</p>
                <p className="text-xs text-text-light mt-1">브랜드 역사</p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-3">
              <Link href="/story" className="btn-outline">브랜드 스토리</Link>
              <Link href="/menu" className="inline-flex items-center gap-2 text-brand-primary text-sm font-medium hover:text-brand-accent transition-colors">
                메뉴 보기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const goPrev = useCallback(() => setLightboxIdx(i => i !== null ? (i - 1 + storesWithImages.length) % storesWithImages.length : null), []);
  const goNext = useCallback(() => setLightboxIdx(i => i !== null ? (i + 1) % storesWithImages.length : null), []);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [lightboxIdx, closeLightbox, goPrev, goNext]);

  const currentStore = lightboxIdx !== null ? storesWithImages[lightboxIdx] : null;

  return (<>
    {/* ══════════ 라이트박스 ══════════ */}
    <AnimatePresence>
      {lightboxIdx !== null && currentStore && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/85" />

          {/* close */}
          <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>

          {/* prev */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-3 md:left-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          {/* next */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-3 md:right-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>

          {/* image + info */}
          <div className="relative z-10 flex flex-col items-center px-16 max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-[80vw] max-w-[700px] aspect-square rounded-xl overflow-hidden">
              <Image
                src={currentStore.image!}
                alt={currentStore.name}
                fill
                sizes="80vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-white font-semibold text-lg">{currentStore.name.replace("스쿱스젤라또 ", "")}</p>
              <p className="text-white/30 text-xs mt-2">{lightboxIdx + 1} / {storesWithImages.length}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ══════════ 섹션 1: 전국 매장 쇼케이스 — 첫 화면 ══════════ */}
    <section className="pt-28 md:pt-32 pb-10 md:pb-14 bg-bg-cream">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-8">
            <p className="text-sm text-text-light tracking-[0.15em] uppercase mb-2">Our Stores</p>
            <h2 className="text-2xl md:text-4xl font-bold text-brand-primary mb-2">전국 {stores.length}개 매장</h2>
            <p className="text-text-body text-sm">2018년 청주 봉명동 1호점부터, 전국으로 확장해온 스쿱스 젤라떼리아</p>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {storesWithImages.map((store, idx) => (
              <div key={store.id} className="group relative cursor-pointer" onClick={() => openLightbox(idx)}>
                <div className="aspect-square rounded-lg overflow-hidden relative">
                  <Image src={store.image!} alt={store.name} fill sizes="(max-width:640px) 33vw, (max-width:768px) 25vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  {store.isClosed && <div className="absolute inset-0 bg-black/30" />}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
                  </div>
                </div>
                <p className="text-[11px] text-text-body text-center mt-1.5 truncate">{store.name.replace("스쿱스젤라또 ", "")}</p>
              </div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="text-center mt-6">
            <Link href="/stores" className="btn-outline">매장 찾기</Link>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* ══════════ 섹션 2: 히어로 — 이미지 슬라이드쇼 ══════════ */}
    <HeroSlideshow />

    {/* ══════════ 섹션 3: 브랜드 철학 — 사진 반 + 텍스트 반 ══════════ */}
    <section className="relative">
      <div className="grid md:grid-cols-2">
        <div className="relative h-[50vh] md:h-auto md:min-h-[500px]">
          <Image src="/images/store-gwanjeo-int.jpeg" alt="스쿱스 관저점 내부" fill sizes="50vw" className="object-cover" unoptimized />
        </div>
        <motion.div
          className="bg-bg-cream px-6 md:px-12 lg:px-16 py-12 md:py-16 flex flex-col justify-center"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-sm text-text-light tracking-[0.15em] uppercase mb-3">Philosophy</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-primary leading-[1.4] mb-5">
            &ldquo;장사는 기술이다&rdquo;
          </motion.h2>
          <motion.p variants={fadeUp} className="text-text-body text-[15px] leading-[1.9] mb-3">
            젤라또를 좋아하는 남매 둘이 이곳저곳 돌아다니면서 젤라또를 맛보고, 공부하고, 배우며 시작한 브랜드입니다. 2018년 5월, 충북 청주 봉명동의 작은 매장에서 첫 스쿱을 떠올린 이후 매일 매장에서 직접 만드는 신선한 수제 젤라또를 고집하고 있습니다.
          </motion.p>
          <motion.p variants={fadeUp} className="text-text-body text-[15px] leading-[1.9] mb-6">
            청원생명쌀로 만든 &lsquo;갓지은쌀&rsquo; 젤라또를 비롯해 고소한 흑임자, 거친쑥 같은 한국 고유의 재료부터 벨기에 다크 카카오, 피에몬테 누텔라 같은 유럽 프리미엄 원재료까지 — 20여 가지 수제 젤라또로 세계와 한국의 맛을 하나로 담아냅니다.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/menu" className="btn-outline">MENU</Link>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* ══════════ 섹션 3: 시그니처 메뉴 — 사진 배경 + 오버레이 ══════════ */}
    <section className="relative py-12 md:py-20">
      <Image src="/images/gelato-premium.jpg" alt="시그니처 젤라또" fill sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-brand-primary/80" />
      <motion.div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div variants={fadeUp}>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">SIGNATURE MENU</h2>
            <p className="text-white/70 text-[15px] leading-[1.9] mb-2">스쿱스 젤라떼리아의 시그니처 메뉴를 소개합니다.</p>
            <p className="text-white/40 text-xs tracking-[0.15em] uppercase mb-6">Get Your Gelato On!</p>
            <div className="space-y-3 mb-6">
              {signatureMenus.map((menu) => (
                <div key={menu.id} className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  <div className="w-[40px] h-[40px] bg-white/10 rounded-full flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white/50">{menu.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white text-[14px]">{menu.name}</p>
                    <p className="text-white/50 text-xs mt-0.5">{menu.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/menu" className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-2.5 text-sm tracking-[0.1em] font-medium hover:bg-white/10 transition-colors duration-300">
              MORE
            </Link>
          </motion.div>
          <motion.div variants={fadeIn} className="relative h-[300px] md:h-[420px] rounded-2xl overflow-hidden">
            <Image src="/images/store-chungbuk-int.jpeg" alt="스쿱스 젤라또 쇼케이스" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized />
          </motion.div>
        </div>
      </motion.div>
    </section>

    {/* ══════════ 섹션 5: 가격 안내 ══════════ */}
    <section className="py-12 md:py-16 bg-bg-white">
      <motion.div className="max-w-[1400px] mx-auto px-6 md:px-12" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <motion.div variants={fadeUp}>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-primary mb-1">PRICE</h2>
            <p className="text-text-body text-[14px] leading-[1.9] mb-6">스쿱스 젤라떼리아의 가격 안내입니다.</p>
            <div className="mb-6">
              <p className="text-sm font-bold text-brand-primary mb-3 tracking-wider">매장 이용</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-bg-cream p-4 text-center rounded-lg">
                  <p className="text-text-light text-xs mb-1">1가지맛</p>
                  <p className="text-brand-primary font-bold text-lg">5,000원</p>
                </div>
                <div className="bg-bg-cream p-4 text-center rounded-lg">
                  <p className="text-text-light text-xs mb-1">2가지맛</p>
                  <p className="text-brand-primary font-bold text-lg">6,000원</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-brand-primary mb-3 tracking-wider">테이크아웃 (파인트)</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "3가지맛", price: "15,000원" },
                  { label: "4가지맛", price: "20,000원" },
                  { label: "5가지맛", price: "28,000원" },
                  { label: "6가지맛", price: "38,000원" },
                ].map((item) => (
                  <div key={item.label} className="bg-bg-cream p-4 text-center rounded-lg">
                    <p className="text-text-light text-xs mb-1">{item.label}</p>
                    <p className="text-brand-primary font-bold text-base">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeIn} className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
            <Image src="/images/store-gongdeok-int2.jpg" alt="스쿱스 공덕점 메뉴보드" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized />
          </motion.div>
        </div>
      </motion.div>
    </section>

    {/* ══════════ 섹션 6: 브랜드 히스토리 — 타임라인 ══════════ */}
    <section id="history" className="relative py-12 md:py-20 scroll-mt-[80px]">
      <Image src="/images/store-gongdeok-int3.jpeg" alt="공덕점" fill sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-brand-primary/90" />
      <div className="relative z-10 max-w-[1000px] mx-auto px-6 md:px-12">
        <motion.div className="mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-sm text-white/50 tracking-[0.15em] uppercase mb-3">History</p>
          <h2 className="text-2xl md:text-4xl font-bold text-white">브랜드 히스토리</h2>
        </motion.div>
        <motion.div className="relative" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <div className="absolute left-[7px] md:left-[9px] top-2 bottom-2 w-[2px] bg-brand-secondary/30 rounded-full" />
          {timeline.map((event) => (
            <motion.div key={event.year} variants={fadeUp} className="relative flex gap-8 md:gap-12 mb-10 last:mb-0">
              <div className="relative shrink-0"><div className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] bg-brand-secondary rounded-full relative z-10 border-4 border-brand-primary" /></div>
              <div className="pb-2 -mt-1">
                <p className="text-brand-secondary text-sm font-semibold tracking-wider mb-1">{event.year}</p>
                <h3 className="text-lg md:text-xl text-white font-semibold mb-1.5">{event.title}</h3>
                <p className="text-white/70 text-sm leading-[1.8]">{event.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ══════════ 섹션 7: 뉴스 ══════════ */}
    <section id="news" className="bg-bg-cream py-12 md:py-20 scroll-mt-[80px]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-text-light tracking-[0.15em] uppercase mb-3">News</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-bold text-brand-primary mb-8">스쿱스 소식</motion.h2>
          <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-6">
            {[
              { date: "2025.12", title: "서울 공덕점 오픈", desc: "서울 마포구 공덕동에 새로운 매장이 오픈했습니다. 공덕역 도보 3분 거리에서 스쿱스 젤라또를 만나보세요." },
              { date: "2025.06", title: "여의도점 오픈", desc: "여의도 IFC몰 인근에 스쿱스 젤라떼리아 여의도점이 새롭게 오픈했습니다." },
              { date: "2025.03", title: "경기 지축점 오픈", desc: "경기도 고양시 지축동에 스쿱스 젤라떼리아 지축점이 오픈했습니다." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
                <p className="text-sm text-brand-secondary font-semibold mb-2">{item.date}</p>
                <h3 className="text-lg font-bold text-brand-primary mb-2">{item.title}</h3>
                <p className="text-text-body text-sm leading-[1.8]">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* ══════════ 섹션 8: 이벤트 ══════════ */}
    <section id="events" className="relative py-12 md:py-20 scroll-mt-[80px]">
      <Image src="/images/store-yeouido-int.jpg" alt="" fill sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-white/50 tracking-[0.15em] uppercase mb-3">Events</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-bold text-white mb-8">이벤트</motion.h2>
          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="inline-block bg-brand-secondary text-white text-xs font-bold px-3 py-1 rounded-full mb-3">진행중</div>
              <h3 className="text-lg font-bold text-white mb-2">가맹점 오픈 기념 할인 이벤트</h3>
              <p className="text-white/70 text-sm leading-[1.8]">신규 매장 오픈 시 오픈 기념 특별 할인 이벤트가 진행됩니다. 가까운 매장에서 확인해보세요!</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">상시</div>
              <h3 className="text-lg font-bold text-white mb-2">SNS 팔로우 이벤트</h3>
              <p className="text-white/70 text-sm leading-[1.8]">스쿱스 공식 인스타그램을 팔로우하고 매장 방문 시 특별 혜택을 받아보세요.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* ══════════ 섹션 9: 가맹 문의 CTA ══════════ */}
    <section className="relative py-16 md:py-24">
      <Image src="/images/crowd-1.jpg" alt="스쿱스 고객" fill sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-brand-primary/75" />
      <motion.div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
        <motion.p variants={fadeUp} className="text-sm text-white/50 tracking-[0.15em] uppercase mb-4">Franchise</motion.p>
        <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white mb-4 leading-[1.3]">
          함께 성장할<br />파트너를 찾습니다
        </motion.h2>
        <motion.p variants={fadeUp} className="text-white/60 text-[15px] leading-[1.9] mb-8 max-w-lg mx-auto">
          체계적인 교육과 본사 지원으로 성공적인 창업을 함께 만들어갑니다.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link href="/franchise" className="inline-flex items-center gap-2 bg-brand-secondary text-white px-10 py-4 text-sm tracking-[0.1em] font-medium hover:bg-brand-secondary/80 transition-colors duration-300">
            가맹 문의하기
          </Link>
        </motion.div>
      </motion.div>
    </section>

    {/* ══════════ 섹션 10: 업종변경 유도 배너 ══════════ */}
    <section className="py-10 md:py-14 bg-bg-cream">
      <motion.div
        className="max-w-[1400px] mx-auto px-6 md:px-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#A68B5B]/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#A68B5B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-text-dark mb-1">카페·바를 운영 중이신가요?</h3>
              <p className="text-sm text-text-light">기존 매장을 스쿱스로 리뉴얼하는 맞춤 전환 상담을 받아보세요.</p>
            </div>
          </div>
          <Link
            href="/franchise/conversion"
            className="inline-flex items-center gap-2 bg-[#A68B5B] text-white px-7 py-3 text-sm font-medium rounded-full hover:bg-[#A68B5B]/80 transition-colors duration-300 whitespace-nowrap flex-shrink-0"
          >
            업종변경 안내 보기
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  </>);
}

