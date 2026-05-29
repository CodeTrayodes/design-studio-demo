'use client';
import { useEffect, useState } from 'react';

/* Inline SVG so the black letterforms follow --c-tx (white in dark mode) */
function LevelShiftLogo({ height = 28 }) {
  const ratio = 540 / 217.4;
  const width = Math.round(height * ratio);
  return (
    <svg
      viewBox="0 0 540 217.4"
      width={width}
      height={height}
      style={{ display: 'block', color: 'var(--c-tx)' }}
      aria-label="LevelShift"
    >
      {/* Black letterforms (L E E L) — use currentColor so dark mode inverts them */}
      <path fill="currentColor" d="M2.6,134.3V81.3h9.2V125h35.6v9.2H2.6z"/>
      <path fill="currentColor" d="M54.1,134.3V81.3h47.2v9.2H63.3V125h38.1v9.2H54.1z M70.1,111.3v-7.8h29.3v7.8H70.1z"/>
      <path fill="currentColor" d="M186.9,134.3V81.3h47.2v9.2h-38.1V125h38.1v9.2H186.9z M202.9,111.3v-7.8h29.3v7.8H202.9z"/>
      <path fill="currentColor" d="M242.2,134.3V81.3h9.2V125H287v9.2H242.2z"/>
      {/* Blue elements (SHIFT + triangle mark) — always #009ADA */}
      <path fill="#009ADA" d="M293.7,134.3V125h39.7c5,0,7.7-2.8,7.7-6.9c0-4.5-2.8-6.8-7.7-6.8H309c-10,0-16.2-6.3-16.2-15.1c0-8.5,5.8-14.9,16.3-14.9h38v9.2h-38c-4.2,0-6.7,2.5-6.7,6.5s2.5,6.4,6.6,6.4h24.2c10.7,0,16.5,5,16.5,15.3c0,8.9-5.4,15.5-16.5,15.5H293.7z"/>
      <path fill="#009ADA" d="M357.7,134.5V81.3h9.2v53.1H357.7z M400.3,134.5v-23h-26.6v-8.2h26.6V81.3h9.2v53.1H400.3z"/>
      <path fill="#009ADA" d="M419.3,134.3V81.3h9.2v52.9H419.3z"/>
      <path fill="#009ADA" d="M438.2,134.3V81.3h44.9v9.2h-35.7v43.7H438.2z M454.1,112.3v-8.1h26.8v8.1H454.1z"/>
      <path fill="#009ADA" d="M509.5,134.3V90.6h-20.1v-9.2h49.4v9.2h-20.1v43.7H509.5z"/>
      <polygon fill="#009ADA" points="119.1,97.5 124.9,107 164.4,107 170.2,97.5"/>
      <polygon fill="#009ADA" points="137.2,127.4 152.1,127.4 155.6,121.7 133.8,121.7"/>
      <polygon fill="#009ADA" points="179.6,81.9 109.7,81.9 117.2,94.3 172.1,94.3"/>
      <polygon fill="#009ADA" points="131.8,118.5 157.5,118.5 162.5,110.2 126.8,110.2"/>
      <path fill="#009ADA" d="M140.7,133.1c1.8,3,6.2,3,8,0l1.5-2.5h-11L140.7,133.1z"/>
    </svg>
  );
}

export default function TopBar() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('demo-theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('demo-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  return (
    <header className="topbar no-print">
      <div className="topbar-inner">
        <div className="topbar-brand">
          <LevelShiftLogo height={22} />
          <span className="brand-sep">·</span>
          <span className="brand-sub">Process Intelligence</span>
        </div>
        <div className="topbar-actions">
          <button className="theme-toggle-btn" onClick={toggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? '☀︎' : '☾'}
          </button>
        </div>
      </div>
    </header>
  );
}
