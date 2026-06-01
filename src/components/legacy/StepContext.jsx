'use client';

import { useRouter } from 'next/navigation';

const STEPS = [
  { num: 1, label: 'Scope',    path: '/'         },
  { num: 2, label: 'Stack',    path: '/setup'    },
  { num: 3, label: 'Context',  path: '/input'    },
  { num: 4, label: 'Analysis', path: '/discover' },
  { num: 5, label: 'Roadmap',  path: '/roadmap'  },
];

export function StepIndicator({ current }) {
  const router = useRouter();
  return (
    <div className="step-row no-print">
      {STEPS.map((step, i) => {
        const done   = step.num < current;
        const active = step.num === current;
        return (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => done && router.push(step.path)}
              className={`step-pill ${active ? 'step-pill-active' : done ? 'step-pill-done' : 'step-pill-future'}`}
            >
              <span style={{ fontFamily: 'JetBrains Mono, IBM Plex Mono', fontSize: 9, fontWeight: 700 }}>
                {done ? '✓' : step.num}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${done ? 'step-line-done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StoryContext({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="story-row animate-slide-down">
      <span className="story-label">Assessment</span>
      <span style={{ color: 'var(--c-dm)', fontSize: 11 }}>·</span>
      {items.map((item, i) => (
        <span key={i} className="story-chip">{item.label}</span>
      ))}
    </div>
  );
}
