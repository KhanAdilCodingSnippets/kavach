import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <h1 className="text-6xl font-black mb-4 tracking-tighter italic text-blue-600">KAVACH</h1>
      <p className="text-slate-600 mb-8 text-lg font-medium">Autonomous AI Legal Orchestrator</p>
      <Link href="/signup">
        <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
          GET STARTED
        </button>
      </Link>
    </div>
  );
}