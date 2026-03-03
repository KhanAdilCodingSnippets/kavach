'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { auditContract } from '@/lib/ai-auditor';
import { Upload, ShieldCheck, Loader2, LogOut, FileText, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface AuditResult {
  summary: string;
  trustScore: number;
  clauses: {
    title: string;
    description: string;
    riskLevel: 'High' | 'Medium' | 'Low';
    legalReference: string | null;
  }[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      alert("File is too large. Please upload a document under 1MB.");
      return;
    }

    setLoading(true);
    setResult(null);

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const fullBase64 = reader.result;
        if (typeof fullBase64 !== 'string') throw new Error("Invalid format");
        
        const base64Data = fullBase64.split(",")[1];
        const auditDataString = await auditContract(base64Data, file.type);
        
        const parsedData: AuditResult = JSON.parse(auditDataString);
        setResult(parsedData);
      } catch (error) {
        console.error("Dashboard Parsing Error:", error);
        alert("Failed to parse the document. Please ensure it is a clear contract.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'High': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'Medium': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'Low': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      default: return null;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-50 border-red-200 text-red-900';
      case 'Medium': return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'Low': return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      default: return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold tracking-widest text-slate-900">KAVACH</h1>
        </div>
        <button 
          onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto">
        <label className="group block p-16 bg-white border-2 border-dashed border-slate-300 rounded-3xl hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer text-center relative overflow-hidden shadow-sm hover:shadow-md">
          <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
          
          <div className="flex flex-col items-center justify-center">
            {loading ? (
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            ) : (
              <Upload className="w-12 h-12 text-slate-400 group-hover:text-blue-600 transition-colors mb-4" />
            )}
            
            <p className="text-xl font-semibold text-slate-800">
              {loading ? 'Orchestrating AI Analysis...' : 'Upload Contract for Audit'}
            </p>
            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
              Secure OCR processing via encrypted AI channels
            </p>
          </div>
        </label>

        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* Summary & Trust Score Card */}
            <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-lg flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-800">Document Summary</h2>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {result.summary}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 min-w-[160px]">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Trust Score</span>
                <span className={`text-5xl font-black ${result.trustScore > 70 ? 'text-emerald-600' : result.trustScore > 40 ? 'text-amber-500' : 'text-red-600'}`}>
                  {result.trustScore}
                </span>
              </div>
            </div>

            {/* Clauses Grid */}
            <div className="grid gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-2 mt-4 mb-2">Clause Breakdown</h3>
              {result.clauses.map((clause, index) => (
                <div key={index} className={`p-6 rounded-2xl border shadow-sm flex items-start gap-4 ${getRiskColor(clause.riskLevel)}`}>
                  <div className="mt-1 flex-shrink-0">
                    {getRiskIcon(clause.riskLevel)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg">{clause.title}</h4>
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/50 border border-current opacity-80">
                        {clause.riskLevel} Risk
                      </span>
                    </div>
                    <p className="text-sm font-medium opacity-90 leading-relaxed">
                      {clause.description}
                    </p>
                    {clause.legalReference && (
                      <div className="mt-3 text-xs font-semibold opacity-75 pt-3 border-t border-current/20">
                        Reference: {clause.legalReference}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}