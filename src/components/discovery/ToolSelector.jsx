'use client';

import { useState, useMemo } from 'react';
import { Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { TOOL_CATEGORIES } from '@/lib/toolCategories';

/* Build initial selection from research-inferred tech stack.
   inferredStack shape: { crm: "Salesforce", erp: "SAP S/4HANA", ... }
   OR { crm: ["Salesforce", "HubSpot"], ... } */
function buildInitialSelected(inferredStack) {
  if (!inferredStack || typeof inferredStack !== 'object') return {};
  const result = {};
  for (const [catId, value] of Object.entries(inferredStack)) {
    const names = Array.isArray(value) ? value : [value];
    const cat   = TOOL_CATEGORIES.find(c => c.id === catId);
    if (!cat) continue;
    const matchedIds = new Set(
      names
        .map(name => cat.tools.find(t => t.name.toLowerCase().includes(name.toLowerCase().slice(0, 6))))
        ?.filter(Boolean)
        .map(t => t.id) ?? []
    );
    if (matchedIds.size > 0) result[catId] = matchedIds;
  }
  return result;
}

export default function ToolSelector({ isDark, onConfirm, inferredStack }) {
  const initialSelected = useMemo(() => buildInitialSelected(inferredStack), []);

  const [activeTab,   setActiveTab]   = useState(TOOL_CATEGORIES[0].id);
  const [selected,    setSelected]    = useState(initialSelected);
  const [customTools, setCustomTools] = useState({});
  const [customInput, setCustomInput] = useState('');
  const [confirmed,   setConfirmed]   = useState(false);

  const autoSelectedCount = Object.values(initialSelected).reduce((n, s) => n + s.size, 0);
  const activeCategory    = TOOL_CATEGORIES.find(c => c.id === activeTab);

  function toggleTool(catId, toolId) {
    setSelected(prev => {
      const set = new Set(prev[catId] || []);
      set.has(toolId) ? set.delete(toolId) : set.add(toolId);
      return { ...prev, [catId]: set };
    });
  }

  function addCustom() {
    if (!customInput.trim()) return;
    setCustomTools(prev => ({ ...prev, [activeTab]: [...(prev[activeTab] || []), customInput.trim()] }));
    setCustomInput('');
  }

  function getSelectionSummary() {
    return Object.entries(selected)
      .filter(([, s]) => s.size > 0)
      .map(([catId, s]) => {
        const cat = TOOL_CATEGORIES.find(c => c.id === catId);
        return [...s].map(id => cat?.tools.find(t => t.id === id)?.name).filter(Boolean);
      })
      .flat()
      .join(' · ');
  }

  function handleConfirm() {
    setConfirmed(true);
    const result = {};
    for (const [catId, set] of Object.entries(selected)) {
      if (set.size === 0) continue;
      const cat = TOOL_CATEGORIES.find(c => c.id === catId);
      result[catId] = [...set].map(id => cat?.tools.find(t => t.id === id)?.name).filter(Boolean);
    }
    for (const [catId, names] of Object.entries(customTools)) {
      result[catId] = [...(result[catId] || []), ...names];
    }
    onConfirm(result);
  }

  const totalSelected = Object.values(selected).reduce((n, s) => n + s.size, 0);

  if (confirmed) {
    return (
      <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
        <p className="text-[#30D5C8] font-mono text-xs uppercase tracking-wider mb-1">Tools confirmed</p>
        <p className={`font-sans text-xs ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          {getSelectionSummary() || 'No tools selected'}
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#1C1C1E] border-[#3A3A3C]' : 'bg-white border-[#D5D0C8]'}`}>
      {/* Auto-selected notice */}
      {autoSelectedCount > 0 && (
        <div className="px-4 pt-3 pb-0">
          <p className={`text-[10px] font-mono flex items-center gap-1.5 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D5C8] inline-block" />
            {autoSelectedCount} tool{autoSelectedCount > 1 ? 's' : ''} pre-selected based on your company profile — adjust as needed
          </p>
        </div>
      )}

      {/* Category tabs */}
      <div
        className={`flex overflow-x-auto border-b mt-3 ${isDark ? 'border-[#3A3A3C]' : 'border-[#D5D0C8]'}`}
        style={{ scrollbarWidth: 'none' }}
      >
        {TOOL_CATEGORIES.map(cat => {
          const count = (selected[cat.id]?.size || 0) + (customTools[cat.id]?.length || 0);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-mono uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === cat.id
                  ? 'text-[#F5A623] border-b-2 border-[#F5A623]'
                  : isDark ? 'text-[#8E8E93] hover:text-[#F1F1F3]' : 'text-[#3D3D44] hover:text-[#18181A]'
              }`}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#F5A623] text-black text-[9px] flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tool grid */}
      <div className="p-4">
        <p className={`text-[10px] font-mono uppercase tracking-wider mb-3 ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
          {activeCategory.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {activeCategory.tools.map(tool => {
            const isSelected  = selected[activeTab]?.has(tool.id);
            const wasInferred = initialSelected[activeTab]?.has(tool.id);
            return (
              <motion.button
                key={tool.id}
                onClick={() => toggleTool(activeTab, tool.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center space-x-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#F5A623] bg-[#F5A623]/10'
                    : isDark ? 'border-[#3A3A3C] hover:border-[#8E8E93]' : 'border-[#D5D0C8] hover:border-[#3D3D44]'
                }`}
              >
                <div className={`w-6 h-6 rounded-md text-[9px] font-bold flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-[#F5A623] text-black' : isDark ? 'bg-[#3A3A3C] text-[#8E8E93]' : 'bg-[#E6E2DB] text-[#3D3D44]'
                }`}>
                  {isSelected ? <Check size={10} /> : tool.logo}
                </div>
                <span className={`text-[11px] font-sans leading-tight flex-1 ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
                  {tool.name}
                </span>
                {wasInferred && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30D5C8]/60 shrink-0" title="Suggested from profile" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Custom tool input */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder={`Add custom ${activeTab} tool...`}
            className={`flex-1 text-xs px-3 py-2 rounded-lg border bg-transparent outline-none font-mono ${
              isDark
                ? 'border-[#3A3A3C] text-[#F1F1F3] placeholder-[#8E8E93]'
                : 'border-[#D5D0C8] text-[#18181A] placeholder-[#3D3D44]'
            }`}
          />
          <button
            onClick={addCustom}
            className={`p-2 rounded-lg border cursor-pointer ${
              isDark ? 'border-[#3A3A3C] text-[#8E8E93] hover:text-[#F5A623]' : 'border-[#D5D0C8] text-[#3D3D44] hover:text-[#F5A623]'
            }`}
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-mono ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            {totalSelected > 0
              ? `${totalSelected} tool${totalSelected > 1 ? 's' : ''} selected`
              : 'Select your stack'}
          </span>
          <button
            onClick={handleConfirm}
            disabled={totalSelected === 0}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              totalSelected > 0
                ? 'bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] text-black hover:scale-[1.02]'
                : isDark ? 'bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed' : 'bg-[#E6E2DB] text-[#3D3D44] cursor-not-allowed'
            }`}
          >
            Confirm tools
          </button>
        </div>
      </div>
    </div>
  );
}
