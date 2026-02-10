'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  LogOut, 
  Sword, 
  ShieldCheck, 
  Trophy, 
  Zap 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [tierList, setTierList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Busca os dados estruturados do seu Backend
  const fetchTierList = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const api_url = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${api_url}/get_tier_list`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setTierList(data);
      }
    } catch (err) {
      console.error("Erro ao carregar Tier List:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTierList();
  }, [fetchTierList]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); 
  };

  // Cores temáticas para cada liga
  const leagueStyles: any = {
    great: "text-blue-500 border-blue-500/20 bg-blue-500/5",
    ultra: "text-purple-500 border-purple-500/20 bg-purple-500/5",
    master: "text-orange-500 border-orange-500/20 bg-orange-500/5"
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 max-w-7xl mx-auto">
      
      {/* HEADER FIXO */}
      <header className="flex justify-between items-center mb-16 border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Zap className="text-yellow-400 fill-yellow-400" size={32} /> 
            Ranker Dashboard
          </h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em] mt-2">
            Análise Estratégica de Arsenal PvP
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-4 bg-zinc-900 hover:bg-red-950/30 hover:text-red-500 rounded-2xl transition-all border border-zinc-800"
        >
          <LogOut size={20} />
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
          <span className="text-zinc-600 font-black uppercase text-[10px] tracking-widest">Processando Ranks Elementais</span>
        </div>
      ) : tierList ? (
        <div className="space-y-24">
          
          {/* LOOP 1: LIGAS (Great, Ultra, Master) */}
          {Object.entries(tierList).map(([league, types]: [string, any]) => (
            <section key={league} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Título da Seção da Liga */}
              <div className={`flex items-center gap-4 p-6 rounded-3xl border ${leagueStyles[league]} mb-8`}>
                <Trophy size={32} />
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                    {league} League
                  </h2>
                  <p className="opacity-60 text-[10px] font-bold uppercase tracking-widest">Categorias Top Tier</p>
                </div>
              </div>

              {/* LOOP 2: TIPOS (Fogo, Água, etc.) */}
              <div className="space-y-12">
                {Object.entries(types).map(([typeName, pokemons]: [string, any]) => (
                  // Só renderiza o tipo se houver pokémons nele
                  pokemons.length > 0 && (
                    <div key={typeName} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="h-[1px] flex-1 bg-zinc-900"></div>
                        <h3 className="text-zinc-500 font-black uppercase text-[11px] tracking-[0.2em] px-4 py-1 border border-zinc-900 rounded-full">
                          Tipo {typeName}
                        </h3>
                        <div className="h-[1px] flex-1 bg-zinc-900"></div>
                      </div>

                      {/* LOOP 3: OS POKÉMON (Máximo 6) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pokemons.map((poke: any) => (
                          <div 
                            key={poke.id} 
                            className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-[2.5rem] hover:border-zinc-700 hover:bg-zinc-900/40 transition-all group relative overflow-hidden"
                          >
                            {/* Nome e IV */}
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <h4 className="text-xl font-bold uppercase group-hover:text-blue-400 transition-colors">
                                  {poke.nome}
                                </h4>
                                <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">Sincronizado via Supabase</p>
                              </div>
                              <div className="text-right">
                                <div className="text-[9px] font-black text-zinc-500 uppercase mb-1">IV Spreed</div>
                                <div className="text-xs font-mono font-bold bg-zinc-800 px-2 py-1 rounded-lg">
                                  {poke.ataque_iv}|{poke.defesa_iv}|{poke.hp_iv}
                                </div>
                              </div>
                            </div>

                            {/* Rank em Destaque */}
                            <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                              <div className="p-3 bg-zinc-800 rounded-xl">
                                <Sword size={18} className="text-zinc-400" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none">Posição na Liga</p>
                                <p className="text-2xl font-black text-white">
                                  #{league === 'great' ? poke.rank_iv_grande : 
                                    league === 'ultra' ? poke.rank_iv_ultra : 
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
        </div>
      ) : (
        <div className="text-center py-40 border-2 border-dashed border-zinc-900 rounded-[3rem]">
          <ShieldCheck className="mx-auto text-zinc-800 mb-4" size={48} />
          <p className="text-zinc-600 font-bold uppercase text-sm tracking-widest">Nenhum dado calculado para este treinador.</p>
        </div>
      )}
    </main>
  );
}