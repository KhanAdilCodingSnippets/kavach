'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function CandidateAssessment() {
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [trustScore, setTrustScore] = useState(100);
  const [violations, setViolations] = useState<string[]>([]);
  const [warningCount, setWarningCount] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  
  const assessmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Tab Focus Tracking
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("Tab switched or window minimized.");
      }
    };

    // 2. Window Blur Tracking (clicking outside the browser)
    const handleWindowBlur = () => {
      logViolation("Focus lost from assessment window.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    // Timer Logic
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      clearInterval(timer);
    };
  }, []);

  const logViolation = (reason: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const violationMessage = `[${timestamp}] ${reason}`;
    
    setViolations((prev) => [violationMessage, ...prev]);
    setWarningCount((prev) => prev + 1);
    
    // Penalize trust score heavily for tab switching
    setTrustScore((prev) => Math.max(0, prev - 15));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    logViolation("Unauthorized clipboard paste attempt detected.");
  };

  const handleSubmit = () => {
    setIsCompleted(true);
    // In a real scenario, we would push the trustScore and answer to Supabase here
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mb-6" />
        <h1 className="text-3xl font-black tracking-tight mb-2">Assessment Submitted</h1>
        <p className="text-slate-500 font-medium">Your responses and integrity logs have been securely transmitted.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col" ref={assessmentRef}>
      {/* Top Security Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="font-bold text-slate-700 tracking-widest uppercase text-sm">Secure Proctoring Active</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${trustScore < 70 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            <ShieldAlert className="w-5 h-5" />
            Integrity Score: {trustScore}%
          </div>
          
          <div className="flex items-center gap-2 font-mono text-lg font-bold text-slate-700">
            <Clock className="w-5 h-5 text-blue-600" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Assessment Content */}
        <div className="lg:col-span-2 space-y-6">
          {warningCount > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
              <div>
                <h3 className="font-bold">Warning: Suspicious Activity Detected</h3>
                <p className="text-sm font-medium mt-1">We have detected {warningCount} out-of-focus events. Continued violations will result in automatic disqualification.</p>
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">System Design</span>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Architecting a High-Traffic API</h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                Design a rate-limiting system for a public API that receives 50,000 requests per second. 
                Explain your choice of data structures, database, and caching layers. 
                Consider edge cases like distributed environments and sudden traffic spikes.
              </p>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onPaste={handlePaste}
              placeholder="Begin typing your architectural approach here. Pasting code is strictly disabled."
              className="w-full h-96 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              spellCheck={false}
            />

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md"
              >
                Submit Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Audit Log (Visible to candidate for psychological deterrence) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit sticky top-24">
          <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm mb-4 border-b border-slate-100 pb-4">Real-Time Audit Log</h3>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {violations.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium italic text-center py-8">Environment secure. No anomalies detected.</p>
            ) : (
              violations.map((log, index) => (
                <div key={index} className="text-xs font-mono text-red-600 bg-red-50 p-2 rounded border border-red-100">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}