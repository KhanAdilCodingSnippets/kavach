'use client';

import { useState } from 'react';
import { generateHiringFunnel } from '@/lib/funnel-architect';
import { Briefcase, FileText, Loader2, GitMerge, ChevronRight, ShieldCheck, Code, BrainCircuit } from 'lucide-react';

interface FunnelStage {
  stage_order: number;
  stage_name: string;
  evaluation_type: string;
  difficulty: string;
}

export default function Orchestrator() {
  const [loading, setLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [stages, setStages] = useState<FunnelStage[] | null>(null);

  const handleOrchestrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) return;

    setLoading(true);
    setStages(null);

    try {
      const response = await generateHiringFunnel(jobTitle, jobDescription);
      if (response.success) {
        setStages(response.stages);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to orchestrate funnel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('coding') || t.includes('technical')) return <Code className="w-5 h-5 text-indigo-600" />;
    if (t.includes('legal') || t.includes('audit')) return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
    if (t.includes('interview') || t.includes('behavioral')) return <BrainCircuit className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-slate-600" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <GitMerge className="w-8 h-8 text-blue-600" />
            Autonomous Workflow Engine
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Input job requirements and let the AI architect the optimal evaluation pipeline.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Input Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-fit">
            <form onSubmit={handleOrchestrate} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Role Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Backend Engineer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Job Description & Requirements
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description, required skills, and responsibilities here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Architecting Funnel...
                  </>
                ) : (
                  'Generate Hiring Pipeline'
                )}
              </button>
            </form>
          </div>

          {/* Output Section */}
          <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 min-h-[500px] flex flex-col">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Generated Pipeline</h2>
            
            {!stages && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-50">
                <GitMerge className="w-16 h-16 mb-4" />
                <p className="font-medium">Awaiting Job Parameters</p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-blue-600">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-bold animate-pulse text-slate-600">Analyzing Complexity & Risk...</p>
              </div>
            )}

            {stages && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {stages.map((stage, index) => (
                  <div key={index} className="flex items-stretch gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 border-2 border-blue-200">
                        {stage.stage_order}
                      </div>
                      {index !== stages.length - 1 && (
                        <div className="w-0.5 h-full bg-blue-200 my-1"></div>
                      )}
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex-1 mb-2 group hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                          {stage.stage_name}
                        </h3>
                        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {stage.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100 mt-3">
                        {getStageIcon(stage.evaluation_type)}
                        {stage.evaluation_type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}