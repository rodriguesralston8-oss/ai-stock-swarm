"use client";

import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, LineChart, BarChart2, ShieldCheck, Loader2, Search, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [ticker, setTicker] = useState("AAPL");
  const [isScanning, setIsScanning] = useState(false);
  const [apiStatus, setApiStatus] = useState("Idle");
  const [aiResult, setAiResult] = useState<{ direction: string; confidence: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else setUserId(session.user.id);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleScan = async () => {
    if (!ticker || !userId) return;
    setIsScanning(true);
    setApiStatus(`Agents analyzing ${ticker.toUpperCase()}...`);
    setAiResult(null);
    
    try {
      const res = await fetch(`http://localhost:8000/predict?ticker=${ticker.toUpperCase()}&user_id=${userId}`);
      const data = await res.json();
      
      if (res.ok && !data.error) {
        setAiResult({ direction: data.direction, confidence: `${data.confidence}%` });
        setApiStatus("Analysis Complete");
      } else {
        setAiResult({ direction: "ERROR", confidence: data.error || "Unknown Error" });
        setApiStatus("Analysis Failed");
      }
    } catch (error) {
      setApiStatus("Offline - Connection Failed");
    } finally {
      setTimeout(() => setIsScanning(false), 500);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-slate-800 p-6 flex flex-col hidden md:flex">
        <h2 className="text-xl font-bold text-emerald-400 mb-8">AI Stock Swarm</h2>
        <nav className="space-y-4 flex-1">
          <Link href="/dashboard" className="flex items-center space-x-3 text-emerald-400 bg-emerald-400/10 px-4 py-3 rounded-lg"><Activity size={20} /> <span className="font-medium">Dashboard</span></Link>
          {/* CRITICAL FIX: Replaced dead anchor tag with a proper Next.js Link router */}
          <Link href="/dashboard/watchlist" className="flex items-center space-x-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-colors"><TrendingUp size={20} /> <span className="font-medium">Watchlist</span></Link>
          <Link href="/dashboard/trades" className="flex items-center space-x-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-colors"><LineChart size={20} /> <span className="font-medium">Paper Trading</span></Link>
        </nav>
        <button onClick={handleLogout} className="flex items-center space-x-3 text-slate-500 hover:text-red-400 px-4 py-3 rounded-lg transition-colors mt-auto">
          <LogOut size={20} /> <span className="font-medium">Sign Out</span>
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
            <p className="text-slate-400 mt-1">Status: {apiStatus}</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="Enter Ticker..." className="bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500 w-32 uppercase" />
            </div>
            <button onClick={handleScan} disabled={isScanning || !ticker} className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2">
              {isScanning ? <Loader2 className="animate-spin" size={20} /> : "Analyze"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4"><h3 className="text-slate-400 font-medium">Active Agents</h3><ShieldCheck size={20} className="text-blue-400" /></div>
            <p className="text-4xl font-bold">4 <span className="text-lg text-slate-500 font-normal">/ 4</span></p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4"><h3 className="text-slate-400 font-medium">AI Direction</h3><Activity size={20} className={`text-emerald-400 ${isScanning ? 'animate-pulse' : ''}`} /></div>
            <p className={`text-4xl font-bold ${aiResult?.direction === 'ERROR' ? 'text-red-500' : aiResult?.direction === 'BEARISH' ? 'text-red-400' : 'text-emerald-400'}`}>
              {aiResult ? aiResult.direction : "--"}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4"><h3 className="text-slate-400 font-medium">Model Confidence</h3><TrendingUp size={20} className="text-purple-400" /></div>
            <p className={`font-bold ${aiResult?.direction === 'ERROR' ? 'text-sm text-red-400' : 'text-4xl text-purple-400'}`}>
              {aiResult ? aiResult.confidence : "--"}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl min-h-[500px] flex flex-col shadow-sm">
          {!aiResult || aiResult.direction === 'ERROR' ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <BarChart2 size={48} className="text-slate-700 mb-4" />
              <p className="text-slate-400 text-lg">Awaiting ticker selection to render TradingView charts.</p>
            </div>
          ) : (
            <div className="flex-1 w-full h-full min-h-[450px] rounded-lg overflow-hidden border border-slate-800">
              <iframe 
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${ticker}&interval=D&symboledit=1&saveimage=1&toolbarbg=0f172a&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en`} 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allowTransparency={true} 
                scrolling="no" 
                allowFullScreen={true}
              ></iframe>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
