'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Zap, Loader2, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            // Redireciona de volta para o dashboard após confirmar email
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
        alert('Cadastro realizado! Verifique seu e-mail para confirmar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // --- PONTO CRÍTICO ---
        // 1. Vamos direto para o dashboard
        router.push('/dashboard');
        // 2. O refresh() força o Next.js a revalidar o Middleware (proxy.ts)
        // garantindo que ele veja o novo cookie de sessão imediatamente.
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10">
        
        {/* LOGO E TÍTULO */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-3xl mb-4 shadow-xl shadow-blue-600/20 rotate-3">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">
            PoGo Ranker
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
            {isSignUp ? 'New Account' : 'PvP Authenticator'}
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-600 mb-2 ml-1 tracking-widest">
              E-mail Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-zinc-800/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 focus:bg-zinc-800 transition-all placeholder:text-zinc-700"
              placeholder="seu@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-600 mb-2 ml-1 tracking-widest">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-zinc-800/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 focus:bg-zinc-800 transition-all placeholder:text-zinc-700"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                <span className="uppercase tracking-widest text-sm">
                  {isSignUp ? 'Criar Treinador' : 'Acessar Arsenal'}
                </span>
              </>
            )}
          </button>
        </form>

        {/* TOGGLE */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] text-zinc-600 hover:text-blue-400 font-bold uppercase tracking-tighter transition-colors"
          >
            {isSignUp 
              ? 'Já possui uma conta estratégica? Entrar' 
              : 'Novo por aqui? Cadastre-se na liga'}
          </button>
        </div>
      </div>
    </main>
  );
}