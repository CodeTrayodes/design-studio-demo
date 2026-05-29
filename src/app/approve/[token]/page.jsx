'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ApprovePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [decision, setDecision] = useState(null); // 'approved' | 'changes'
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(token)));
      setData(decoded);
    } catch {
      setError('This approval link is invalid or has expired.');
    }
  }, [token]);

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid Link</h2>
        <p className="text-sm text-slate-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (decision === 'approved') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Subprocess Approved</h2>
        <p className="text-sm text-slate-500 mb-2">
          <strong>{data.spName}</strong> has been approved by {data.ownerName}.
        </p>
        <p className="text-xs text-slate-400">
          Approved at {new Date().toLocaleString()}
        </p>
        <p className="text-xs text-slate-400 mt-4">
          You can close this tab. The session owner will see the updated status in the demo.
        </p>
      </div>
    );
  }

  if (decision === 'changes') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">↩</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Changes Requested</h2>
        <p className="text-sm text-slate-500 mb-2">
          Your feedback on <strong>{data.spName}</strong> has been recorded.
        </p>
        {feedback && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-3 text-left">
            {feedback}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-4">
          You can close this tab. The session owner will see your feedback.
        </p>
      </div>
    );
  }

  const { spName, summary, ownerName, ownerRole } = data;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full">
            Awaiting Your Approval
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mt-2">{spName}</h1>
        <p className="text-sm text-slate-400">
          Assigned to {ownerName}{ownerRole ? ` · ${ownerRole}` : ''}
        </p>
      </div>

      {summary && (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4 shadow-sm">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Approval Summary</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{summary.summary}</p>
          </div>

          {summary.keyDecisions?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Key Decisions</h2>
              <ul className="space-y-2">
                {summary.keyDecisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-blue-500 mt-0.5">▸</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.expectedImpact && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4">
              <h2 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Expected Impact</h2>
              <p className="text-sm text-blue-700">{summary.expectedImpact}</p>
            </div>
          )}

          {summary.timeline && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-6">
              <span className="text-slate-400">⏱</span>
              <span className="text-sm text-slate-600">{summary.timeline}</span>
            </div>
          )}
        </>
      )}

      {/* Action buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Your Decision</h2>

        <button
          onClick={() => setDecision('approved')}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors mb-3"
        >
          ✓ Approve this subprocess
        </button>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Request Changes (optional feedback, max 200 chars)
          </label>
          <input
            type="text"
            maxLength={200}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Describe the change needed..."
            className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>

        <button
          onClick={() => setDecision('changes')}
          className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          ↩ Request Changes
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center mt-5">
        This is a demo approval link. Decisions recorded here are for demonstration only.
      </p>
    </div>
  );
}
