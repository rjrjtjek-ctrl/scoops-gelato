"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { menuItems, priceInfo, type MenuCategory } from "@/lib/data";
import MenuCard from "@/components/MenuCard";

const categories: ("전체" | MenuCategory)[] = ["전체", "Gelato", "Sorbetto", "Coffee", "Whiskey", "Wine"];
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

export default function MenuPage() {
  const [active, setActive] = useState<"전체" | MenuCategory>("전체");
  const filtered = active === "전체" ? menuItems : menuItems.filter((item) => item.category === active);

  return (<>
    {/* 히어로 — 풀스크린 사진 배경 */}
    <section className="relative h-[55vh] min-h-[400px]">
      <Image src="/images/store-chungbuk-int.jpeg" alt="스쿱스 젤라또 쇼케이스" fill sizes="100vw" className="object-cover" priority unoptimized />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="absolute inset-0 flex items-end"><div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-12 md:pb-20 w-full">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-white/60 tracking-[0.15em] uppercase mb-3">Our Menu</motion.p>
          <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white leading-[1.3] mb-3">매일 신선하게 만드는<br />수제 젤라또</motion.h1>
          <motion.p variants={fadeUp} className="text-white/70 text-[15px]">이탈리아 정통 레시피로 매일 매장에서 직접 만드는 20여 가지 젤라또와 소르베또</motion.p>
        </motion.div>
      </div></div>
    </section>

    {/* 카테고리 필터 + 메뉴 그리드 */}
    <section id="gelato" className="py-10 md:py-16 bg-bg-white scroll-mt-[80px]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActive(cat)} className={`px-6 py-2.5 text-sm tracking-wider rounded-full transition-all duration-300 ${active === cat ? "bg-brand-primary text-white" : "bg-bg-cream text-text-body hover:bg-brand-primary/5"}`}>
              {cat === "전체" ? "전체" : cat}
            </button>
          ))}
        </div>
        <motion.div key={active} variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (<MenuCard key={item.id} item={item} />))}
        </motion.div>
      </div>
    </section>

    {/* 소르베또 앵커 */}
    <div id="sorbetto" className="scroll-mt-[80px]" />

    {/* 가격 안내 — 사진 배경 */}
    <section className="relative py-10 md:py-16">
      <Image src="/images/gelato-premium.jpg" alt="프리미엄 젤라또" fill sizes="100vw" className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-brand-primary/85" />
      <motion.div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div variants={fadeUp}>
            <p className="text-sm text-white/50 tracking-[0.15em] uppercase mb-3">Price</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">가격 안내</h2>
            <div className="mb-6">
              <p className="text-sm font-semibold text-brand-secondary mb-3 tracking-wider">매장 이용</p>
              <div className="grid grid-cols-2 gap-2">
                {priceInfo.eatNow.map((item) => (<div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"><p className="text-white/60 text-xs mb-1">{item.label}</p><p className="text-white font-bold text-lg">{item.price}</p></div>))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-secondary mb-3 tracking-wider">테이크아웃 (파인트)</p>
              <div className="grid grid-cols-2 gap-2">
                {priceInfo.takeAway.map((item) => (<div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"><p className="text-white/60 text-xs mb-1">{item.label}</p><p className="text-white font-bold text-base">{item.price}</p></div>))}
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="relative h-[300px] md:h-[380px] rounded-2xl overflow-hidden">
            <Image src="/images/store-gongdeok-int2.jpg" alt="공덕점 메뉴보드" fill sizes="50vw" className="object-cover" unoptimized />
          </motion.div>
        </div>
      </motion.div>
    </section>

    {/* 커피 메뉴 안내 — 사진 반 + 텍스트 반 */}
    <section id="coffee" className="relative scroll-mt-[80px]">
      <div className="grid md:grid-cols-2">
        <div className="relative h-[40vh] md:h-auto md:min-h-[350px]">
          <Image src="/images/store-gongdeok-int4.jpeg" alt="공덕점 좌석" fill sizes="50vw" className="object-cover" unoptimized />
        </div>
        <motion.div className="bg-bg-cream px-6 md:px-12 lg:px-16 py-10 md:py-14 flex flex-col justify-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-text-light tracking-[0.15em] uppercase mb-3">Coffee & Affogato</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-brand-primary mb-4">진한 에스프레소와<br />젤라또의 만남</motion.h2>
          <motion.p variants={fadeUp} className="text-text-body text-[15px] leading-[1.9] mb-5">깊고 진한 에스프레소 베이스의 아메리카노와 에스프레소 위에 신선한 젤라또를 올린 아포가토까지. 스쿱스만의 특별한 커피 메뉴를 즐겨보세요.</motion.p>
          <motion.div variants={fadeUp} className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-black/5"><span className="text-brand-primary font-medium text-[15px]">아메리카노</span><span className="text-brand-secondary font-medium">4,000원</span></div>
            <div className="flex items-center justify-between py-2 border-b border-black/5"><span className="text-brand-primary font-medium text-[15px]">아포가토</span><span className="text-brand-secondary font-medium">5,500원</span></div>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* 디저트 메뉴 */}
    <section id="dessert" className="py-10 md:py-16 bg-bg-cream scroll-mt-[80px]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-text-light tracking-[0.15em] uppercase mb-3">Dessert</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-brand-primary mb-6">디저트 메뉴</motion.h2>
          <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
              <h3 className="text-lg font-bold text-brand-primary mb-2">아포가토</h3>
              <p className="text-text-body text-sm leading-[1.8] mb-3">진한 에스프레소 위에 신선한 수제 젤라또를 올린 스쿱스의 시그니처 디저트</p>
              <p className="text-brand-secondary font-semibold">5,500원</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
              <h3 className="text-lg font-bold text-brand-primary mb-2">젤라또 케이크</h3>
              <p className="text-text-body text-sm leading-[1.8] mb-3">수제 젤라또를 겹겹이 쌓아 만든 프리미엄 아이스 케이크 (예약 주문)</p>
              <p className="text-brand-secondary font-semibold">매장 문의</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
              <h3 className="text-lg font-bold text-brand-primary mb-2">파인트 아이스크림</h3>
              <p className="text-text-body text-sm leading-[1.8] mb-3">집에서도 즐기는 스쿱스 젤라또. 473ml 파인트 사이즈로 테이크아웃</p>
              <p className="text-brand-secondary font-semibold">9,900원~</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* 위스키 메뉴 — 사진 반 + 텍스트 반 */}
    <section id="whiskey" className="relative scroll-mt-[80px]">
      <div className="grid md:grid-cols-2">
        <motion.div
          className="bg-brand-primary px-6 md:px-12 lg:px-16 py-10 md:py-14 flex flex-col justify-center order-2 md:order-1"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-sm text-white/50 tracking-[0.15em] uppercase mb-3">Whiskey</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mb-4">
            프리미엄 싱글몰트<br />위스키 셀렉션
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/70 text-[15px] leading-[1.9] mb-6">
            스쿱스 젤라떼리아는 발베니, 글랜피딕, 달모어 등 프리미엄 싱글몰트 위스키를
            기본으로 제공합니다. 젤라또와 함께 즐기는 특별한 페어링을 경험해보세요.
            매장마다 바텐더가 직접 선별한 다양한 위스키를 추가로 만나보실 수 있습니다.
          </motion.p>
          <motion.div variants={fadeUp} className="space-y-3">
            <div className="flex items-center gap-4 py-3 border-b border-white/10">
              <span className="text-brand-secondary font-semibold text-[15px] w-[140px]">발베니 더블우드 12년</span>
              <span className="text-white/60 text-sm">꿀, 바닐라, 시나몬의 부드러운 풍미</span>
            </div>
            <div className="flex items-center gap-4 py-3 border-b border-white/10">
              <span className="text-brand-secondary font-semibold text-[15px] w-[140px]">글랜피딕 12년</span>
              <span className="text-white/60 text-sm">배, 크리미한 버터스카치의 우아한 밸런스</span>
            </div>
            <div className="flex items-center gap-4 py-3 border-b border-white/10">
              <span className="text-brand-secondary font-semibold text-[15px] w-[140px]">달모어 12년</span>
              <span className="text-white/60 text-sm">오렌지 마멀레이드, 초콜릿, 스파이시한 피니시</span>
            </div>
          </motion.div>
          <motion.p variants={fadeUp} className="text-white/40 text-xs mt-5 leading-relaxed">
            * 위스키 라인업은 매장마다 다를 수 있으며, 시즌별 스페셜 셀렉션이 추가됩니다.<br />
            * 가격은 매장에 문의해주세요.
          </motion.p>
        </motion.div>
        <div className="relative h-[40vh] md:h-auto md:min-h-[450px] order-1 md:order-2">
          <Image src="/images/store-gongdeok-int.jpg" alt="스쿱스 매장 바" fill sizes="50vw" className="object-cover" unoptimized />
        </div>
      </div>
    </section>

    {/* 와인 메뉴 — 텍스트 반 + 사진 반 */}
    <section id="wine" className="relative scroll-mt-[80px]">
      <div className="grid md:grid-cols-2">
        <div className="relative h-[40vh] md:h-auto md:min-h-[400px]">
          <Image src="/images/store-gongdeok-int4.jpeg" alt="스쿱스 매장 내부" fill sizes="50vw" className="object-cover" unoptimized />
        </div>
        <motion.div
          className="bg-bg-cream px-6 md:px-12 lg:px-16 py-10 md:py-14 flex flex-col justify-center"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-sm text-text-light tracking-[0.15em] uppercase mb-3">Wine</motion.p>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-brand-primary mb-4">
            젤라또와 함께하는<br />와인 셀렉션
          </motion.h2>
          <motion.p variants={fadeUp} className="text-text-body text-[15px] leading-[1.9] mb-6">
            과일 향이 풍부한 레드 와인부터 상큼한 화이트 와인, 청량한 스파클링까지.
            스쿱스의 수제 젤라또와 특별한 페어링을 즐겨보세요.
            매장마다 다양한 와인을 셀렉션하여 제공하고 있습니다.
          </motion.p>
          <motion.div variants={fadeUp} className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-black/5">
              <span className="text-brand-primary font-medium text-[15px]">하우스 레드 와인</span>
              <span className="text-text-light text-sm">미디엄 바디, 과일향</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-black/5">
              <span className="text-brand-primary font-medium text-[15px]">하우스 화이트 와인</span>
              <span className="text-text-light text-sm">시트러스 노트, 상큼</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-black/5">
              <span className="text-brand-primary font-medium text-[15px]">스파클링 와인</span>
              <span className="text-text-light text-sm">청량한 기포, 과일향</span>
            </div>
          </motion.div>
          <motion.p variants={fadeUp} className="text-text-light text-xs mt-5 leading-relaxed">
            * 와인 셀렉션은 매장마다 다를 수 있습니다. 자세한 내용은 매장에 문의해주세요.
          </motion.p>
        </motion.div>
      </div>
    </section>
  </>);
}
