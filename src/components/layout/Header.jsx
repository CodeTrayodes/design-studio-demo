'use client';

import { Sun, Moon, Activity } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export default function Header() {
  const { isDark, toggle } = useTheme();

  return (
    <header
      className={`w-full border-b sticky top-0 z-40 px-4 md:px-6 py-2.5 flex items-center justify-between transition-colors duration-300 no-print ${
        isDark ? 'bg-[#0B0B0E] border-[#1C1C1E]' : 'bg-[#F3F1EC] border-[#E6E2DB]'
      }`}
    >
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <img
          src="/levelshift-logo.png"
          alt="LevelShift"
          className="h-6 w-32 object-contain"
          style={{ filter: isDark ? "none" : "brightness(0.15) saturate(0)" }}
        />
        </div>
        <div className={`hidden sm:block h-4 w-px ${isDark ? 'bg-[#3A3A3C]' : 'bg-[#D5D0C8]'}`} />
        <div className="hidden sm:block">
          <p className={`font-sans text-sm font-medium tracking-tight ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
            ShiftAI
          </p>
          <p className={`font-mono text-[9px] uppercase tracking-widest ${isDark ? 'text-[#8E8E93]' : 'text-[#3D3D44]'}`}>
            by LevelShift
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <span
          className={`text-[11px] px-2.5 py-1 rounded-full font-mono flex items-center space-x-1.5 border ${
            isDark ? 'bg-[#1C1C1E] text-[#8E8E93] border-[#3A3A3C]' : 'bg-white text-[#3D3D44] border-[#D5D0C8]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#30D5C8] animate-pulse" />
          <span>SECURE ENGINE</span>
        </span>

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
            isDark
              ? 'bg-[#1C1C1E] border-[#3A3A3C] text-[#8E8E93] hover:text-[#F5A623] hover:border-[#F5A623]/40'
              : 'bg-white border-[#D5D0C8] text-[#3D3D44] hover:text-[#D4890A] hover:border-[#D4890A]/40'
          }`}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
}
