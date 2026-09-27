"use client";

import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, LineChart, LogOut, Plus, Trash2, Cpu } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Watchlist() {
  const [tickers, setTickers] = useState<string[]>(['AAPL', 'TSLA', 'NVDA', 'MSFT']);
  const [newTicker, setNewTicker] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else setUserId(session.user.id);
      setIsLoading(false);
    });
  }, [router]);

  const addTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTicker && !tickers.includes(newTicker.toUpperCase())) {
      setTickers([...tickers, newTicker.toUpperCase()]);
      setNewTicker("");
    }
  };

  const removeTicker = (t: string) => {
    setTickers(tickers.filter(ticker => ticker !== t));
  };

  const dispatchSwarm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId || tickers.length === 0) return;
    setStatus("Dispatching background workers...");
    try {
      const res = await fetch("http://localhost:8000/batch-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers, user_id: userId })
      });
      if (res.ok) {
        setStatus("Tasks routed to API background pool!");
        toast.success("Batch scan dispatched!");
        setTimeout(() => router.push('/dashboard/trades'), 1500);
      } else {
        setStatus("Failed to dispatch tasks.");
      }
    } catch (e) {
      setStatus("Cluster connection error.");
    }
  };

  const SkeletonRow = () => (
    <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-4 rounded-lg animate-pulse">
      <div className="h-6 w-20 bg-slate-800 rounded"></div>
      <div className="h-6 w-16 bg-slate-800 rounded"></div>
    </div>
  );

  if (!userId) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400"><Activity className="animate-spin" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-slate-800 p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold text-emerald-400 mb-8">AI Stock Swarm</h2>
        <nav className="space-y-4 flex-1">
          <Link href="/dashboard" className="flex items-center space-x-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-colors">
            <Activity size={20} /> <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/dashboard/watchlist" className="flex items-center space-x-3 text-emerald-400 bg-emerald-400/10 px-4 py-3 rounded-lg">
            <TrendingUp size={20} /> <span className="font-medium">Watchlist</span>
          </Link>
          <Link href="/dashboard/trades" className="flex items-center space-x-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-colors">
            <LineChart size={20} /> <span className="font-medium">Paper Trading</span>
          </Link>
        </nav>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="flex items-center space-x-3 text-slate-500 hover:text-red-400 px-4 py-3 rounded-lg transition-colors mt-auto">
          <LogOut size={20} /> <span className="font-medium">Sign Out</span>
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Swarm Watchlist</h1>
          <p className="text-slate-400 mt-1">Status: <span className="text-emerald-400">{status}</span></p>
        </header>

        <div className="max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <form onSubmit={addTicker} className="flex gap-3 mb-6">
            <input 
              type="text" 
              value={newTicker} 
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              placeholder="Add ticker (e.g. AMZN)" 
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 text-white uppercase font-mono"
            />
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-3 rounded-lg transition-colors flex items-center justify-center">
              <Plus size={20} className="text-emerald-400" />
            </button>
          </form>

          <div className="space-y-3 mb-8">
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : tickers.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-950 border border-slate-800 p-4 rounded-lg">
                <span className="font-bold tracking-wider font-mono">{t}</span>
                <button onClick={() => removeTicker(t)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {tickers.length === 0 && !isLoading && <p className="text-slate-500 text-center py-4">Watchlist is empty.</p>}
          </div>

          <button 
            type="button"
            onClick={dispatchSwarm} 
            disabled={tickers.length === 0 || status.includes("Dispatching")}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Cpu size={20} /> Execute Background Batch Scan
          </button>
        </div>
      </main>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-4 rounded-lg animate-pulse">
      <div className="h-6 w-20 bg-slate-800 rounded"></div>
      <div className="h-6 w-16 bg-slate-800 rounded"></div>
    </div>
  );
}