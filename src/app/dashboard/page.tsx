'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { auditContract } from '@/lib/ai-auditor';
import { Upload, ShieldCheck, Loader2, LogOut, FileText } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
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
        
        if (typeof fullBase64 !== 'string') {
            throw new Error("Failed to process file as a valid string format.");
        }

        const base64Parts = fullBase64.split(",");
        
        if (base64Parts.length !== 2) {
          throw new Error("Invalid base64 encoding detected.");
        }

        const base64Data = base64Parts[1];

        const auditData = await auditContract(base64Data, file.type);
        setResult(auditData);
      } catch (error) {
        console.error("Dashboard Parsing Error:", error);
        alert("Failed to parse the document locally before sending. Check browser console.");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      alert("Browser failed to read the file locally.");
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-sky-500" />
          <h1 className="text-xl font-bold tracking-widest text-white">KAVACH</h1>
        </div>
        <button 
          onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto">
        <label className="group block p-16 bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl hover:border-sky-500/50 hover:bg-slate-900/50 transition-all cursor-pointer text-center relative overflow-hidden">
          <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
          
          <div className="flex flex-col items-center justify-center">
            {loading ? (
              <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-4" />
            ) : (
              <Upload className="w-12 h-12 text-slate-600 group-hover:text-sky-500 transition-colors mb-4" />
            )}
            
            <p className="text-xl font-semibold text-slate-200">
              {loading ? 'Analyzing Legal Structure...' : 'Upload Contract for Audit'}
            </p>
            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
              Secure OCR processing via encrypted AI channels
            </p>
          </div>
        </label>

        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <FileText className="w-5 h-5 text-sky-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Audit Intelligence Report</h2>
              </div>
              <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-mono text-sm">
                {result}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}