'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OrgContextCard          from './OrgContextCard';
import ToolSelector            from './ToolSelector';
import ContextInput            from './ContextInput';
import AnalysisProgress        from './AnalysisProgress';
import MaturityReport          from './MaturityReport';
import CompanyVerificationCard from './CompanyVerificationCard';
import ProcessSelectionCard    from './ProcessSelectionCard';

function TypingDots() {
  return (
    <div className="flex items-center space-x-1.5 py-1">
      {[0, 0.2, 0.4].map(d => (
        <span key={d} className="w-2 h-2 rounded-full bg-[#F5A623] animate-heartbeat-glow" style={{ animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

function UserBubble({ content, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-end"
    >
      <div className={`max-w-[80%] md:max-w-[68%] px-4 py-3 rounded-2xl rounded-tr-sm text-[15px] leading-[1.7] font-sans ${
        isDark
          ? 'bg-[#F5A623]/15 text-[#F1F1F3] border border-[#F5A623]/20'
          : 'bg-[#F5A623]/10 text-[#18181A] border border-[#F5A623]/20'
      }`}>
        {content}
      </div>
    </motion.div>
  );
}

function AssistantBubble({
  message, isDark, isStreaming,
  onOrgConfirm, onToolsConfirm, onContextConfirm, onAnalysisDone,
  analysisResult, analysisApiReady,
  onConfirmCompanyBrief, onConfirmProcessSelection,
}) {
  if (message.type === 'org-context') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <OrgContextCard isDark={isDark} onConfirm={onOrgConfirm} />
      </motion.div>
    );
  }
  if (message.type === 'tool-selection') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <ToolSelector isDark={isDark} onConfirm={onToolsConfirm} inferredStack={message.inferredStack} />
      </motion.div>
    );
  }
  if (message.type === 'context-input') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <ContextInput isDark={isDark} onConfirm={onContextConfirm} />
      </motion.div>
    );
  }
  if (message.type === 'analysis') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <AnalysisProgress isDark={isDark} onComplete={onAnalysisDone} apiReady={analysisApiReady} />
      </motion.div>
    );
  }
  if (message.type === 'report' && analysisResult) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <MaturityReport data={analysisResult} isDark={isDark} />
      </motion.div>
    );
  }
  if (message.type === 'company-verification') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <CompanyVerificationCard
          isDark={isDark}
          companyBrief={message.companyBrief || ''}
          companyName={message.companyName || ''}
          industry={message.industry || ''}
          governance={message.governance || []}
          onVerified={() => onConfirmCompanyBrief(true)}
          onEdit={(brief) => onConfirmCompanyBrief(true, brief)}
          onRetry={() => onConfirmCompanyBrief(false)}
        />
      </motion.div>
    );
  }
  if (message.type === 'process-selection') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <ProcessSelectionCard
          isDark={isDark}
          industry={message.industry || ''}
          companyName={message.companyName || ''}
          processRecommendations={message.processRecommendations || []}
          onSelect={onConfirmProcessSelection}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start space-x-3"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F5A623] to-[#FF6B35] flex items-center justify-center text-black text-[10px] font-bold shrink-0 mt-1 shadow-sm">
        DS
      </div>
      <div className={`max-w-[88%] md:max-w-[78%] text-[15px] leading-[1.75] font-serif ${isDark ? 'text-[#F1F1F3]' : 'text-[#18181A]'}`}>
        {message.content
          ? <span>{message.content}</span>
          : isStreaming ? <TypingDots /> : null
        }
      </div>
    </motion.div>
  );
}

export default function ChatThread({
  messages,
  streaming,
  isDark,
  onOrgConfirm,
  onToolsConfirm,
  onContextConfirm,
  onAnalysisDone,
  analysisResult,
  analysisApiReady,
  onConfirmCompanyBrief = () => {},
  onConfirmProcessSelection = () => {},
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  return (
    <div className="flex flex-col space-y-4 pb-2">
      <AnimatePresence initial={false}>
        {messages.map(m =>
          m.role === 'user' ? (
            <UserBubble key={m.id} content={m.content} isDark={isDark} />
          ) : (
            <AssistantBubble
              key={m.id}
              message={m}
              isDark={isDark}
              isStreaming={streaming && m === messages.at(-1)}
              onOrgConfirm={onOrgConfirm}
              onToolsConfirm={onToolsConfirm}
              onContextConfirm={onContextConfirm}
              onAnalysisDone={onAnalysisDone}
              analysisResult={analysisResult}
              analysisApiReady={analysisApiReady}
              onConfirmCompanyBrief={onConfirmCompanyBrief}
              onConfirmProcessSelection={onConfirmProcessSelection}
            />
          )
        )}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
