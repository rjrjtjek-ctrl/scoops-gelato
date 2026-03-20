"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone } from "lucide-react";
import { stores } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

export default function StoresPage() {
  return (<>
    {/* 히어로 */}
    <section className="relative h-[60vh] min-h-[400px]">
      <Image src="/images/store-chungbuk-ext.jpg" alt="스쿱스 사창점" fill sizes="100vw" className="object-cover" priority unoptimized />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="absolute inset-0 flex items-end"><div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-12 md:pb-20 w-full">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.p variants={fadeUp} className="text-sm text-white/60 tracking-[0.15em] uppercase mb-3">Visit Us</motion.p>
          <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white leading-[1.3] mb-4">스쿱스 젤라떼리아<br />사창점</motion.h1>
          <motion.p variants={fadeUp} className="text-white/70 text-[15px]">본사 직영 매장에서 스쿱스의 모든 맛을 경험하세요.</motion.p>
        </motion.div>
      </div></div>
    </section>

    {/* 사창점 정보 */}
    <section className="py-12 md:py-16 bg-bg-cream">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12"><div className="grid md:grid-cols-3 gap-5">
        <div className="bg-bg-white rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-brand-primary" /></div>
          <div><p className="text-sm font-semibold text-brand-primary mb-1">주소</p><p className="text-sm text-text-body leading-[1.8]">충북 청주시 서원구<br />1순환로 672번길 35, 1층</p></div>
        </div>
        <div className="bg-bg-white rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-brand-primary" /></div>
          <div><p className="text-sm font-semibold text-brand-primary mb-1">영업시간</p><p className="text-sm text-text-body leading-[1.8]">매일 10:00 — 22:00<br />연중무휴</p></div>
        </div>
        <div className="bg-bg-white rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-brand-primary" /></div>
          <div><p className="text-sm font-semibold text-brand-primary mb-1">전화</p><p className="text-sm text-text-body leading-[1.8]"><a href="tel:1811-0259" className="hover:text-brand-primary transition-colors">1811-0259</a></p></div>
        </div>
      </div></div>
    </section>

    {/* 대표 인사 */}
    <section className="py-12 md:py-16 bg-bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.div variants={fadeUp} className="md:col-span-2">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden relative bg-bg-cream">
              <Image src="/images/owner-profile.jpg" alt="대표 정석주" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" unoptimized />
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="md:col-span-3">
            <p className="text-sm text-text-light tracking-[0.15em] uppercase mb-3">Greeting</p>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-primary mb-6 leading-[1.4]">안녕하세요,<br />스쿱스 젤라떼리아<br />대표 정석주입니다.</h2>
            <div className="text-text-body text-[15px] leading-[2] space-y-4">
              <p>저는 &ldquo;진짜 맛있는 젤라또를 더 많은 분들과 나누고 싶다&rdquo;는 마음 하나로 스쿱스를 시작했습니다. 이탈리아 정통 레시피를 바탕으로, 매일 매장에서 직접 만드는 신선한 수제 젤라또 — 그것이 스쿱스의 약속입니다.</p>
              <p>좋은 원재료를 고르는 것부터 한 스쿱 한 스쿱 정성을 담는 것까지, 저희가 가장 중요하게 생각하는 건 &ldquo;경험&rdquo;입니다. 매장에 들어서는 순간부터 젤라또를 맛보는 그 순간까지, 특별한 경험을 드리고 싶습니다.</p>
              <p>전국 17개 매장에서 여러분을 기다리고 있습니다. 스쿱스에서 행복한 한 스쿱을 만나보세요.</p>
            </div>
            <p className="mt-6 text-brand-primary font-semibold text-[15px]">스쿱스 젤라떼리아 대표 정석주</p>
          </motion.div>
        </motion.div>
      </div>
    </section>

    {/* 매장 갤러리 */}
    <section className="py-12 md:py-16 bg-bg-cream">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div className="mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-sm text-text-light tracking-[0.15em] uppercase mb-3">Gallery</p>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">매장 둘러보기</h2>
        </motion.div>
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          {["/images/store-chungbuk-ext.jpg","/images/store-chungbuk-int.jpeg","/images/store-chungbuk-ext2.jpg","/images/store-gongdeok-int.jpg","/images/store-gongdeok-int2.jpg","/images/store-gwanjeo-int.jpeg","/images/store-yeouido-int.jpg","/images/store-gongdeok-int3.jpeg"].map((src, i) => (
            <motion.div key={i} variants={fadeUp} className="aspect-[4/3] rounded-xl overflow-hidden relative">
              <Image src={src} alt={`매장 사진 ${i+1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover hover:scale-105 transition-transform duration-500" unoptimized />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* 전국 매장 */}
    <section className="py-12 md:py-20 bg-bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <motion.div className="mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-sm text-text-light tracking-[0.15em] uppercase mb-3">Our Stores</p>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">전국 17개 매장</h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {stores.map((store) => (
              <motion.div key={store.id} variants={fadeUp} className={`group ${store.isClosed ? "opacity-50" : ""}`}>
                <div className="aspect-square rounded-2xl overflow-hidden bg-bg-cream relative">
                  {store.image ? (
                    <Image src={store.image} alt={store.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-bg-warm to-bg-cream flex items-center justify-center">
                      <div className="w-[50px] h-[38px] relative opacity-10"><Image src="/images/logo_symbol.png" alt="" fill sizes="50px" className="object-contain" /></div>
                    </div>
                  )}
                </div>
                <p className={`mt-3 text-center text-sm font-medium ${store.isClosed ? "text-text-light" : "text-brand-primary"}`}>{store.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* 하단 */}
    <section className="py-12 md:py-16 bg-bg-cream">
      <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
        <p className="text-text-body text-[15px] leading-[1.9] mb-2">가맹 및 매장 문의</p>
        <p className="text-2xl md:text-3xl font-bold text-brand-primary">1811-0259</p>
      </div>
    </section>
  </>);
}
