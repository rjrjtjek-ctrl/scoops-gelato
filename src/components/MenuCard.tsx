"use client";

import { motion } from "framer-motion";
import type { MenuItem } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

export default function MenuCard({ item }: { item: MenuItem }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group bg-bg-white rounded-2xl p-5 hover:shadow-md transition-all duration-400 border border-black/5"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <h3 className="text-brand-primary font-semibold text-[15px]">
            {item.name}
          </h3>
          {item.isSignature && (
            <span className="bg-brand-primary text-white text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full">
              Signature
            </span>
          )}
        </div>
        {item.price && (
          <span className="text-brand-secondary text-sm font-medium">
            {item.price}
          </span>
        )}
      </div>
      <p className="text-text-light text-[13px] leading-relaxed">
        {item.description}
      </p>
    </motion.div>
  );
}
