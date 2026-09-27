"use client";

import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, LineChart, Clock, LogOut, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Trades() {
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserAndTrades = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUserId(session.user.id);
    try {
      const res = await fetch(`http://localhost:8000/trades?user_id=${session.user.id}`);
      const data = await res.json();
      if (data.trades) setTrades(data.trades);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndTrades();
  }, [router]);

  const handleCloseTrade = async (tradeId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:8000/trades/${tradeId}/close?user_id=${userId}`, {
        method: 'PUT'
      });
      if (res.ok) {
        toast.success('Position Closed', {
          style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' },
        });
        fetchUserAndTrades();
      }
    } catch (err) {
      console.error("Failed to close trade", err);
      toast.error('Failed to close position');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!userId) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400"><Activity className="animate-spin" size={40} /></div>;

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-5 w-20 bg-slate-800 rounded"></div></td>
      <td className="p-4"><div className="h-5 w-16 bg-slate-800 rounded"></div></td>
      <td className="p-4"><div className="h-5 w-20 bg-slate-800 rounded"></div></td>
      <td className="p-4"><div className="h-5 w-20 bg-slate-800 rounded"></div></td>
      <td className="p-4"><div className="h-5 w-24 bg-slate-800 rounded"></div></td>
      <td className="p-4"><div className="h-5 w-16 bg-slate-800 rounded"></div></td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-slate-800 p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold text-emerald-400 mb-8">AI Stock Swarm</h2>
        <nav className="space-y-4 flex-1">
          <Link href="/dashboard" className="flex items-center space-x-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-colors">
            <Activity size={20} /> <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/dashboard/watchlist" className="flex items-center space-x-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 px-4 py-3 rounded-lg transition-colors">
            <TrendingUp size={20} /> <span className="font-medium">Watchlist</span>
          </Link>
          <Link href="/dashboard/trades" className="flex items-center space-x-3 text-emerald-400 bg-emerald-400/10 px-4 py-3 rounded-lg">
            <LineChart size={20} /> <span className="font-medium">Paper Trading</span>
          </Link>
        </nav>
        <button onClick={handleLogout} className="flex items-center space-x-3 text-slate-500 hover:text-red-400 px-4 py-3 rounded-lg transition-colors mt-auto">
          <LogOut size={20} /> <span className="font-medium">Sign Out</span>
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Paper Trading Ledger</h1>
          <p className="text-slate-400 mt-1">Track historical AI predictions and active market positions.</p>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="p-4 font-medium text-slate-300 font-mono">Ticker</th>
                  <th className="p-4 font-medium text-slate-300">AI Direction</th>
                  <th className="p-4 font-medium text-slate-300 font-mono">Confidence</th>
                  <th className="p-4 font-medium text-slate-300">Status</th>
                  <th className="p-4 font-medium text-slate-300 font-mono">Timestamp</th>
                  <th className="p-4 font-medium text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : trades.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No paper trades logged yet. Scan a ticker on the dashboard!
                    </td>
                  </tr>
                ) : (
                  trades.map((trade, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/25 transition-colors">
                      <td className="p-4 font-bold font-mono">{trade.ticker}</td>
                      <td className={`p-4 font-bold ${trade.direction === 'BEARISH' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {trade.direction}
                      </td>
                      <td className="p-4 font-mono text-blue-400">{trade.confidence_score}%</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded border ${trade.status === 'CLOSED' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-mono flex items-center gap-2">
                        <Clock size={14} /> 
                        {new Date(trade.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        {trade.status === 'OPEN' ? (
                          <button 
                            onClick={() => handleCloseTrade(trade.id)}
                            className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded border border-emerald-500/30 transition-colors"
                          >
                            <CheckCircle2 size={14} /> Close
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 px-3 py-1.5">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-5 w-20 bg-slate-800 rounded"></div></td>
      <td className="p-4"><div className="h-5 w-16 bg-slate-800 rounded"></div></td>
      <td className="p-4"><div className="h-5 w-20 bg-slate-800 rounded"></div></td>
      <td className="p-4"><div className="h-5 w-20 bg-slate-800 rounded"></div></td>
      <td className="p-4"><div className="h-5 w-24 bg-slate-800 rounded"></div></td>
      <td className="p-4"><div className="h-5 w-16 bg-slate-800 rounded"></div></td>
    </tr>
  );
}