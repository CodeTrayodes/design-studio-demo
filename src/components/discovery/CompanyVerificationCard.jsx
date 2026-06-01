import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, CheckCircle, Edit2, RefreshCw, Pencil, Info, ChevronDown } from "lucide-react";

const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance & Banking",
  "Insurance",
  "Retail & E-commerce",
  "Manufacturing",
  "Energy & Utilities",
  "Telecommunications",
  "Education",
  "Government",
  "Defense & Aerospace",
  "Pharmaceuticals",
  "Legal Services",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Transportation & Logistics",
  "Non-Profit",
  "Hospitality",
  "Agriculture",
];

const GOVERNANCE_OPTIONS = [
  "SOC 2",
  "ISO 27001",
  "HIPAA",
  "GDPR",
  "PCI-DSS",
  "NIST",
  "FedRAMP",
  "HITRUST",
  "SOX",
  "CCPA",
];

export default function CompanyVerificationCard({
  isDark,
  companyBrief,
  companyName,
  industry,
  governance,
  onVerified,
  onEdit,
  onRetry,
}) {
  const [editing, setEditing] = useState(false);
  const [editedBrief, setEditedBrief] = useState(companyBrief);
  const [selectedIndustry, setSelectedIndustry] = useState(industry || "");
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [selectedGovernance, setSelectedGovernance] = useState(
    Array.isArray(governance) ? governance : []
  );

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowIndustryDropdown(false);
      }
    }
    if (showIndustryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showIndustryDropdown]);

  function handleSave() {
    onEdit(editedBrief);
    setEditing(false);
  }

  function handleCancel() {
    setEditedBrief(companyBrief);
    setEditing(false);
  }

  function toggleGovernance(framework) {
    setSelectedGovernance((prev) =>
      prev.includes(framework)
        ? prev.filter((f) => f !== framework)
        : [...prev, framework]
    );
  }

  function handleVerified() {
    try {
      const existing = JSON.parse(localStorage.getItem("demo_research") || "{}");
      localStorage.setItem(
        "demo_research",
        JSON.stringify({
          ...existing,
          industry: selectedIndustry,
          governance: selectedGovernance,
        })
      );
    } catch (_) {
      // localStorage unavailable — proceed silently
    }
    onVerified();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Building2 size={16} className="text-[#8E8E93] shrink-0" />
        <span className="text-[#F1F1F3] font-semibold text-sm">
          Company Profile
        </span>
      </div>

      {/* Company name badge */}
      {companyName && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#F5A623]/10 text-[#F5A623] px-2 py-0.5 rounded text-xs font-mono">
            {companyName}
          </span>
        </div>
      )}

      {/* Brief display or edit textarea */}
      <div className="bg-[#2C2C2E] rounded-lg p-4">
        {editing || !editedBrief ? (
          <>
            {!editedBrief && !editing && (
              <p className="text-[#8E8E93] text-xs italic mb-2">
                We couldn&apos;t find public data for this company. Add a brief description to get more accurate results.
              </p>
            )}
            <textarea
              value={editedBrief}
              onChange={(e) => setEditedBrief(e.target.value)}
              rows={4}
              placeholder="e.g. A mid-market financial services firm focused on commercial lending and risk management..."
              className="w-full bg-transparent border-none outline-none ring-0 resize-none text-[#F1F1F3] text-sm leading-relaxed placeholder-[#8E8E93]/40 focus:outline-none focus:ring-0"
              autoFocus={!editedBrief}
            />
          </>
        ) : (
          <p className="text-[#F1F1F3] text-sm leading-relaxed">{editedBrief}</p>
        )}
      </div>

      {/* Edit mode save/cancel */}
      {editing && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            className="bg-[#F5A623] text-black rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#F5A623]/90 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="border border-[#3A3A3C] text-[#F1F1F3] rounded-lg px-4 py-2 text-sm hover:border-[#8E8E93] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Auto-detected section */}
      <div className="space-y-3 pt-1">
        <p className="text-[#8E8E93] text-xs font-medium uppercase tracking-wide">
          Auto-detected by LevelShift
        </p>

        {/* Industry editable chip */}
        <div className="space-y-1.5">
          <p className="text-[#8E8E93] text-xs">Industry</p>
          <div className="relative" ref={dropdownRef}>
            {selectedIndustry ? (
              <button
                onClick={() => setShowIndustryDropdown((v) => !v)}
                className="flex items-center gap-1.5 bg-[#30D5C8]/10 border border-[#30D5C8]/40 text-[#30D5C8] px-2.5 py-1 rounded-full text-xs font-medium hover:border-[#30D5C8] transition-colors"
              >
                {selectedIndustry}
                <Pencil size={10} className="opacity-70" />
                <ChevronDown size={10} className="opacity-60" />
              </button>
            ) : (
              <button
                onClick={() => setShowIndustryDropdown((v) => !v)}
                className="flex items-center gap-1.5 text-[#8E8E93] text-xs italic hover:text-[#F1F1F3] transition-colors"
              >
                Detecting industry...
                <ChevronDown size={10} />
              </button>
            )}

            <AnimatePresence>
              {showIndustryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 top-full mt-1.5 left-0 w-52 bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg shadow-xl overflow-hidden"
                >
                  <div className="max-h-48 overflow-y-auto py-1">
                    {INDUSTRY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedIndustry(option);
                          setShowIndustryDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          selectedIndustry === option
                            ? "bg-[#30D5C8]/15 text-[#30D5C8]"
                            : "text-[#F1F1F3] hover:bg-[#3A3A3C]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Governance toggle chips */}
        <div className="space-y-1.5">
          <p className="text-[#8E8E93] text-xs">Compliance & Governance</p>
          <div className="flex flex-wrap gap-1.5">
            {GOVERNANCE_OPTIONS.map((framework) => {
              const active = selectedGovernance.includes(framework);
              return (
                <button
                  key={framework}
                  onClick={() => toggleGovernance(framework)}
                  className={`px-2.5 py-1 rounded-full text-xs border font-medium transition-colors ${
                    active
                      ? "bg-[#F5A623]/10 border-[#F5A623] text-[#F5A623]"
                      : "bg-[#2C2C2E] border-[#3A3A3C] text-[#8E8E93] hover:border-[#8E8E93] hover:text-[#F1F1F3]"
                  }`}
                >
                  {framework}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source attribution */}
      <div className="flex items-center gap-1.5">
        <Info size={11} className="text-[#8E8E93] shrink-0" />
        <p className="text-[#8E8E93] text-xs italic">
          {companyBrief
            ? 'Sourced from public company data + AI analysis'
            : 'Company not found in public data — add details for better results'}
        </p>
      </div>

      {/* Action buttons — always visible when not in edit mode */}
      {!editing && (
        <>
          <p className="text-[#F1F1F3] text-sm font-medium">Is this accurate?</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleVerified}
              className="flex items-center gap-1.5 bg-[#F5A623] text-black rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#F5A623]/90 transition-colors"
            >
              <CheckCircle size={14} />
              That&apos;s Right
            </button>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 border border-[#3A3A3C] text-[#F1F1F3] rounded-lg px-4 py-2 text-sm hover:border-[#8E8E93] transition-colors"
            >
              <Edit2 size={13} />
              Edit Details
            </button>
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-[#8E8E93] text-sm hover:text-[#F1F1F3] transition-colors px-2 py-2"
            >
              <RefreshCw size={13} />
              Not Quite
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
