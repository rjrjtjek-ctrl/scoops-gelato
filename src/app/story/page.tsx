"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { menuItems, stores } from "@/lib/data";

/* ─── 애니메이션 ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── 데이터 ─── */
const signatureMenus = menuItems.filter((item) => item.isSignature).slice(0, 4);
const activeStores = stores.filter((s) => !s.isClosed);

export default function StoryPage() {
  return (
    <>
      {/* ══════════ 섹션 1: 히어로 — 풀스크린 사진 배경 ══════════ */}
      <section className="relative h-[100dvh] min-h-[600px]">
        <Image
          src="/images/store-yeouido-ext.jpg"
          alt="스쿱스 젤라떼리아 여의도점"
          fill
          sizes="100vw"
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-16 md:pb-24 w-full">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.h1
                variants={fadeUp}
                className="text-3xl md:text-5xl lg:text-[56px] font-bold text-white leading-[1.3] mb-4"
              >
                스쿱스의 핵심은 재료와
                <br />
                장인의 정성입니다.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-sm text-white/60 tracking-[0.15em] uppercase"
              >
                Scoops Gelateria — since 2018
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ 섹션 2: 브랜드 소개 — 사진 반 + 텍스트 반 ══════════ */}
      <section className="relative">
        <div className="grid md:grid-cols-2">
          {/* 왼쪽: 풀 사진 */}
          <div className="relative h-[50vh] md:h-auto md:min-h-[500px]">
            <Image
              src="/images/store-gwanjeo-int.jpeg"
              alt="스쿱스 관저점 내부"
              fill
              sizes="50vw"
              className="object-cover"
              unoptimized
            />
          </div>
          {/* 오른쪽: 텍스트 */}
          <motion.div
            className="bg-bg-cream px-6 md:px-12 lg:px-16 py-12 md:py-16 flex flex-col justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-sm text-text-light tracking-[0.15em] uppercase mb-4">
              Scoops Gelateria
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-primary leading-[1.4] mb-5">
              이탈리아 정통 레시피와
              <br />
              엄선된 원재료로 만드는
              <br />
              수제 젤라또.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-text-body text-[15px] leading-[1.9] mb-6">
              2018년 충북 청주에서 시작된 스쿱스 젤라떼리아는
              매일 매장에서 직접 만드는 신선한 수제 젤라또를 고집합니다.
              청원생명쌀, 벨기에 다크 카카오 등 엄선된 원재료로
              20여 가지 맛을 선보이고 있습니다.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/" className="btn-outline">
                MORE
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ 섹션 3: 시그니처 메뉴 — 사진 배경 + 오버레이 ══════════ */}
      <section className="relative py-12 md:py-20">
        <Image
          src="/images/gelato-premium.jpg"
          alt="시그니처 젤라또"
          fill
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-brand-primary/80" />
        <motion.div
          className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* 왼쪽: 텍스트 */}
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
                SIGNATURE MENU
              </h2>
              <p className="text-white/70 text-[15px] leading-[1.9] mb-2">
                스쿱스 젤라떼리아의 시그니처 메뉴를 소개합니다.
              </p>
              <p className="text-white/40 text-xs tracking-[0.15em] uppercase mb-6">
                Get Your Gelato On!
              </p>

              <div className="space-y-3 mb-6">
                {signatureMenus.map((menu) => (
                  <div
                    key={menu.id}
                    className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg"
                  >
                    <div className="w-[40px] h-[40px] bg-white/10 rounded-full flex-shrink-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white/50">
                        {menu.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white text-[14px]">
                        {menu.name}
                      </p>
                      <p className="text-white/50 text-xs mt-0.5">
                        {menu.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/menu" className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-2.5 text-sm tracking-[0.1em] font-medium hover:bg-white/10 transition-colors duration-300">
                MORE
              </Link>
            </motion.div>

            {/* 오른쪽: 젤라또 쇼케이스 사진 */}
            <motion.div variants={fadeIn} className="relative h-[300px] md:h-[420px] rounded-2xl overflow-hidden">
              <Image
                src="/images/store-chungbuk-int.jpeg"
                alt="스쿱스 젤라또 쇼케이스"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══════════ 섹션 4: 가격 안내 — 컴팩트 ══════════ */}
      <section className="py-12 md:py-16 bg-bg-cream">
        <motion.div
          className="max-w-[1400px] mx-auto px-6 md:px-12"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* 왼쪽: 가격 안내 */}
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-primary mb-1">
                PRICE
              </h2>
              <p className="text-text-body text-[14px] leading-[1.9] mb-6">
                스쿱스 젤라떼리아의 가격 안내입니다.
              </p>

              <div className="mb-6">
                <p className="text-sm font-bold text-brand-primary mb-3 tracking-wider">
                  매장 이용
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-bg-white p-4 text-center rounded-lg">
                    <p className="text-text-light text-xs mb-1">1가지맛</p>
                    <p className="text-brand-primary font-bold text-lg">5,000원</p>
                  </div>
                  <div className="bg-bg-white p-4 text-center rounded-lg">
                    <p className="text-text-light text-xs mb-1">2가지맛</p>
                    <p className="text-brand-primary font-bold text-lg">6,000원</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-brand-primary mb-3 tracking-wider">
                  테이크아웃 (파인트)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "3가지맛", price: "15,000원" },
                    { label: "4가지맛", price: "20,000원" },
                    { label: "5가지맛", price: "28,000원" },
                    { label: "6가지맛", price: "38,000원" },
                  ].map((item) => (
                    <div key={item.label} className="bg-bg-white p-4 text-center rounded-lg">
                      <p className="text-text-light text-xs mb-1">{item.label}</p>
                      <p className="text-brand-primary font-bold text-base">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 오른쪽: 매장 사진 */}
            <motion.div variants={fadeIn} className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="/images/store-gongdeok-int2.jpg"
                alt="스쿱스 공덕점 메뉴보드"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══════════ 섹션 5: 매장 안내 — 사진 그리드 ══════════ */}
      <section className="relative py-12 md:py-16">
        <Image
          src="/images/store-yeouido-int.jpg"
          alt="스쿱스 여의도점 내부"
          fill
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div variants={fadeUp}>
              <p className="text-sm text-white/50 tracking-[0.15em] uppercase mb-3">
                Scoops Store
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-white leading-[1.4] mb-4">
                전국의 스쿱스 젤라떼리아
                <br />
                매장을 찾아보세요.
              </h2>
              <p className="text-white/70 text-[15px] leading-[1.9] mb-4">
                가까운 매장에 방문하여 스쿱스 젤라떼리아를 즐겨보세요.
              </p>

              <div className="space-y-2 mb-6">
                {activeStores.slice(0, 5).map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center py-2 border-b border-white/10"
                  >
                    <span className="text-white font-medium text-sm">
                      {store.name}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/stores" className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-2.5 text-sm tracking-[0.1em] font-medium hover:bg-white/10 transition-colors duration-300">
                MORE
              </Link>
            </motion.div>

            {/* 오른쪽: 매장 사진 그리드 */}
            <motion.div variants={fadeIn} className="grid grid-cols-2 gap-2">
              {[
                { src: "/images/store-gongdeok-ext.jpg", alt: "공덕점" },
                { src: "/images/store-gwanjeo-ext.jpeg", alt: "관저점" },
                { src: "/images/store-jichuk-ext.jpeg", alt: "지축점" },
                { src: "/images/store-chungbuk-ext.jpg", alt: "청주본점" },
              ].map((s, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image src={s.src} alt={s.alt} fill sizes="25vw" className="object-cover" unoptimized />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══════════ 섹션 6: 가맹 문의 CTA — 사진 배경 ══════════ */}
      <section className="relative py-16 md:py-24">
        <Image
          src="/images/crowd-1.jpg"
          alt="스쿱스 고객 줄서기"
          fill
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-brand-primary/75" />
        <motion.div
          className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={fadeUp}
            className="text-sm text-white/50 tracking-[0.15em] uppercase mb-4"
          >
            Franchise
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-5xl font-bold text-white mb-4 leading-[1.3]"
          >
            함께 성장할
            <br />
            파트너를 찾습니다
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-white/60 text-[15px] leading-[1.9] mb-8 max-w-lg mx-auto"
          >
            체계적인 교육과 본사 지원으로
            성공적인 창업을 함께 만들어갑니다.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/franchise"
              className="inline-flex items-center gap-2 bg-brand-secondary text-white px-10 py-4 text-sm tracking-[0.1em] font-medium hover:bg-brand-secondary/80 transition-colors duration-300"
            >
              가맹 문의하기
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
