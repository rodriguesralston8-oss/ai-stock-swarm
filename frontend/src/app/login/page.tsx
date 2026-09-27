"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Registration successful. If confirmation is required, check your email.');
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-50">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30">
            <ShieldCheck size={40} className="text-emerald-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">AI Stock Swarm</h2>
        <p className="text-slate-400 text-center mb-8">Authenticate to access your workspace.</p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 text-white" 
              placeholder="agent@swarm.ai" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 text-white" 
              placeholder="••••••••" 
            />
          </div>
          
          {message && <div className="text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded border border-emerald-400/20">{message}</div>}
          
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={handleSignUp} 
              disabled={loading} 
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Sign Up
            </button>
            <button 
              type="button"
              onClick={handleSignIn} 
              disabled={loading} 
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
