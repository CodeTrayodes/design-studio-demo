"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Database } from "lucide-react";

const FALLBACK_PROCESSES = [
  { id: 'lead-to-cash', name: 'Lead to Cash', description: 'End-to-end sales pipeline from prospect to payment collection', companyCount: 156, avgAutomationRate: 64, avgSla: '3.2 days' },
  { id: 'procure-to-pay', name: 'Procure to Pay', description: 'Supplier management, procurement, and invoice payment workflow', companyCount: 134, avgAutomationRate: 58, avgSla: '4.1 days' },
  { id: 'order-to-cash', name: 'Order to Cash', description: 'Order fulfillment, invoicing and cash application process', companyCount: 98, avgAutomationRate: 61, avgSla: '2.8 days' },
  { id: 'record-to-report', name: 'Record to Report', description: 'Financial close, consolidation and reporting cycle', companyCount: 112, avgAutomationRate: 47, avgSla: '5.4 days' },
  { id: 'hire-to-retire', name: 'Hire to Retire', description: 'Full employee lifecycle from recruitment to offboarding', companyCount: 89, avgAutomationRate: 52, avgSla: '6 days' },
  { id: 'issue-to-resolution', name: 'Issue to Resolution', description: 'Incident detection, triage, resolution and closure workflow', companyCount: 143, avgAutomationRate: 71, avgSla: '1.9 days' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function ProcessSelectionCard({
  isDark,
  industry,
  companyName,
  processRecommendations,
  onSelect,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [customInput, setCustomInput] = useState("");

  const processes =
    processRecommendations && processRecommendations.length > 0
      ? processRecommendations
      : FALLBACK_PROCESSES;

  const totalInstances = processes.reduce((sum, p) => sum + (p.companyCount || 0), 0);

  const canContinue = selectedId !== null || customInput.trim().length > 0;

  function handleProcessClick(id) {
    setSelectedId(id);
    setCustomInput("");
  }

  function handleCustomChange(e) {
    setCustomInput(e.target.value);
    if (e.target.value.trim().length > 0) {
      setSelectedId(null);
    }
  }

  function handleContinue() {
    if (!canContinue) return;
    if (customInput.trim().length > 0) {
      onSelect("custom", customInput.trim());
    } else {
      onSelect(selectedId);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-5"
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-[#F1F1F3] font-semibold text-sm">
          Key Processes in {industry || "Your Industry"}
        </h3>
        <p className="text-[#8E8E93] text-sm mt-0.5">
          Select a process to discover and optimize
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-1.5 mb-4">
        <Database size={11} className="text-[#8E8E93]" />
        <span className="text-[#8E8E93] text-xs">
          Analyzed across {totalInstances.toLocaleString()} process instances in our database
        </span>
      </div>

      {/* Process list */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {processes.map((process) => {
          const isSelected = selectedId === process.id;
          return (
            <motion.div
              key={process.id}
              variants={itemVariants}
              onClick={() => handleProcessClick(process.id)}
              className={`border rounded-lg p-3 mb-2 cursor-pointer transition-colors duration-150 ${
                isSelected
                  ? "border-[#F5A623] bg-[#F5A623]/5"
                  : "border-[#3A3A3C] hover:border-[#F5A623]/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isSelected && (
                      <CheckCircle2 size={13} className="text-[#F5A623] shrink-0" />
                    )}
                    <span className="text-[#F1F1F3] text-sm font-medium truncate">
                      {process.name}
                    </span>
                  </div>
                  <p className="text-[#8E8E93] text-xs leading-snug">
                    {process.description}
                  </p>
                </div>

                {/* Right badges */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[#8E8E93] text-xs whitespace-nowrap">
                    {process.companyCount} companies
                  </span>
                  <span className="bg-[#30D5C8]/10 text-[#30D5C8] text-xs rounded px-1.5 py-0.5 whitespace-nowrap">
                    {process.avgAutomationRate}% automated
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Custom process section */}
      <div className="mt-3">
        <label className="block text-[#8E8E93] text-sm mb-1.5">
          Or define your own
        </label>
        <input
          type="text"
          value={customInput}
          onChange={handleCustomChange}
          placeholder="e.g., Policy Renewal, Loan Origination, Grant Management..."
          className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-[#F1F1F3] text-sm w-full outline-none focus:border-[#F5A623]/50 placeholder-[#8E8E93]/50 transition-colors"
        />
      </div>

      {/* Continue button */}
      <motion.button
        onClick={handleContinue}
        disabled={!canContinue}
        whileHover={canContinue ? { scale: 1.01 } : {}}
        whileTap={canContinue ? { scale: 0.98 } : {}}
        className={`mt-4 w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
          canContinue
            ? "bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black cursor-pointer"
            : "bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed"
        }`}
      >
        <span>Discover This Process</span>
        <ArrowRight size={12} />
      </motion.button>
    </motion.div>
  );
}
