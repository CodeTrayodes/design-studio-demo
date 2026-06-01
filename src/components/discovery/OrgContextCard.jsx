"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function OrgContextCard({ isDark, onConfirm }) {
  const [companyName, setCompanyName] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const ready = companyName.trim().length > 1;

  function confirm() {
    if (!ready) return;
    setConfirmed(true);
    onConfirm({ companyName: companyName.trim(), industry: "", governance: [] });
  }

  if (confirmed) {
    return (
      <div className={`rounded-2xl border p-4 flex items-center justify-between ${
        isDark ? "bg-[#1C1C1E] border-[#3A3A3C]" : "bg-white border-[#D5D0C8]"
      }`}>
        <div>
          <p className={`text-[10px] font-mono uppercase tracking-wider mb-0.5 ${isDark ? "text-[#30D5C8]" : "text-[#0D9488]"}`}>
            Organisation confirmed
          </p>
          <p className={`text-sm font-sans ${isDark ? "text-[#F1F1F3]" : "text-[#18181A]"}`}>
            {companyName}
          </p>
        </div>
        <Check size={15} className={`shrink-0 ${isDark ? "text-[#30D5C8]" : "text-[#0D9488]"}`} />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${
      isDark ? "bg-[#1C1C1E] border-[#3A3A3C]" : "bg-white border-[#D5D0C8]"
    }`}>
      <div className="p-5 space-y-5">
        {/* Header */}
        <div>
          <p className={`text-sm font-semibold font-sans ${isDark ? "text-[#F1F1F3]" : "text-[#18181A]"}`}>
            Who are we analyzing today?
          </p>
          <p className={`text-[11px] font-mono mt-1 ${isDark ? "text-[#8E8E93]" : "text-[#3D3D44]"}`}>
            Enter your company name to begin process discovery
          </p>
        </div>

        {/* Company name input */}
        <div>
          <label className={`block text-[10px] font-mono uppercase tracking-wider mb-2 ${
            isDark ? "text-[#8E8E93]" : "text-[#3D3D44]"
          }`}>
            Company name
          </label>
          <div className={`border-b pb-1.5 ${isDark ? "border-[#3A3A3C]" : "border-[#D5D0C8]"}`}>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && ready && confirm()}
              placeholder="e.g. Walmart"
              autoFocus
              className={`w-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none text-base font-serif leading-snug ${
                isDark ? "text-white placeholder-[#8E8E93]/40" : "text-[#18181A] placeholder-[#3D3D44]/40"
              }`}
            />
          </div>
        </div>

        {/* Continue button */}
        <motion.button
          onClick={confirm}
          disabled={!ready}
          whileHover={ready ? { scale: 1.01 } : {}}
          whileTap={ready ? { scale: 0.98 } : {}}
          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
            ready
              ? "bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black cursor-pointer"
              : `cursor-not-allowed ${isDark ? "bg-[#3A3A3C] text-[#8E8E93]" : "bg-[#E6E2DB] text-[#3D3D44]"}`
          }`}
        >
          <span>Continue</span>
          <ArrowRight size={12} />
        </motion.button>
      </div>
    </div>
  );
}
