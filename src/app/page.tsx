import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-6xl font-black mb-4 tracking-tighter italic text-sky-500">KAVACH</h1>
      <p className="text-slate-400 mb-8 text-lg">Autonomous AI Legal Orchestrator</p>
      <Link href="/signup">
        <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-sky-400 transition-all">
          GET STARTED
        </button>
      </Link>
    </div>
  );
}