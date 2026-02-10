'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, LogOut, Zap, Trophy, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [tierList, setTierList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTierList = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_tier_list`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTierList(data);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTierList(); }, [fetchTierList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-zinc-500 font-black uppercase text-xs tracking-widest">Sincronizando Arsenal...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 max-w-7xl mx-auto space-y-20">
      
      {/* HEADER */}
      <header className="flex justify-between items-center border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Zap className="text-blue-500 fill-blue-500" /> POGO RANKER
          </h1>
          <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-1">Sua Tier List Estratégica</p>
        </div>
        <button onClick={() => { supabase.auth.signOut(); router.refresh(); }} className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* RENDERIZAÇÃO DAS LIGAS (Object.entries transforma o objeto em lista) */}
      {tierList && Object.entries(tierList).map(([leagueName, types]: [string, any]) => (
        <section key={leagueName} className="space-y-10">
          
          {/* TÍTULO DA LIGA */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/10 p-4 rounded-3xl border border-blue-500/20">
              <Trophy className="text-blue-500" size={32} />
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">
              {leagueName} <span className="text-blue-500">League</span>
            </h2>
          </div>

          {/* RENDERIZAÇÃO DOS TIPOS DENTRO DA LIGA */}
          <div className="space-y-12">
            {Object.entries(types).map(([typeName, pokemons]: [string, any]) => (
              // Só renderiza se houver pokémons no array
              Array.isArray(pokemons) && pokemons.length > 0 && (
                <div key={typeName} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 px-4 py-1 rounded-full border border-zinc-800">
                      Tipo: {typeName}
                    </span>
                    <div className="h-[1px] flex-1 bg-zinc-900"></div>
                  </div>

                  {/* GRID DOS POKÉMONS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pokemons.map((poke: any) => (
                      <div key={poke.id} className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2.5rem] hover:border-blue-500/40 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                          <h4 className="text-xl font-bold uppercase group-hover:text-blue-400">{poke.nome}</h4>
                          <div className="text-[10px] font-mono bg-zinc-800 px-2 py-1 rounded-lg text-zinc-400">
                            {poke.ataque_iv}/{poke.defesa_iv}/{poke.hp_iv}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                          <Target className="text-zinc-600" size={18} />
                          <div>
                            <p className="text-[9px] font-black text-zinc-500 uppercase leading-none">Rank na Liga</p>
                            <p className="text-2xl font-black text-white">
                              #{leagueName === 'great' ? poke.rank_iv_grande : 
                                leagueName === 'ultra' ? poke.rank_iv_ultra : 
                                poke.rank_iv_mestra}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}