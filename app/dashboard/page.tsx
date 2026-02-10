'use client';

import { useState, useEffect, useCallback, useMemo } from 'react'; // Adicionado useMemo
import { supabase } from '@/lib/supabase';
import { Plus, Loader2, LogOut, Sword, Trophy, BookmarkCheck } from 'lucide-react'; // Adicionado BookmarkCheck
import { useRouter } from 'next/navigation';
import AddPokemonForm from '@/components/AddPokemonForm';

const typeColors: Record<string, string> = {
  overall: 'text-amber-400 border-amber-400/50 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.1)]',
  best_team: 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]',
  fire: 'text-red-500 border-red-500/20 bg-red-500/5',
  water: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
  grass: 'text-green-500 border-green-500/20 bg-green-500/5',
  electric: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5',
  ice: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5',
  fighting: 'text-orange-700 border-orange-700/20 bg-orange-700/5',
  poison: 'text-purple-500 border-purple-500/20 bg-purple-500/5',
  ground: 'text-amber-600 border-amber-600/20 bg-amber-600/5',
  flying: 'text-indigo-400 border-indigo-400/20 bg-indigo-400/5',
  psychic: 'text-pink-500 border-pink-500/20 bg-pink-500/5',
  bug: 'text-lime-500 border-lime-500/20 bg-lime-500/5',
  rock: 'text-yellow-700 border-yellow-700/20 bg-yellow-700/5',
  ghost: 'text-violet-700 border-violet-700/20 bg-violet-700/5',
  dragon: 'text-indigo-600 border-indigo-600/20 bg-indigo-600/5',
  dark: 'text-zinc-600 border-zinc-600/20 bg-zinc-600/5',
  steel: 'text-slate-400 border-slate-400/20 bg-slate-400/5',
  fairy: 'text-rose-400 border-rose-400/20 bg-rose-400/5',
  normal: 'text-zinc-400 border-zinc-400/20 bg-zinc-400/5',
};

export default function DashboardPage() {
  const [tierList, setTierList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLeague, setActiveLeague] = useState<string | null>(null);
  const router = useRouter();

  // NOVO: Lógica para gerar a lista de pokémon únicos a serem guardados
  const saveList = useMemo(() => {
    if (!tierList) return [];
    const uniqueMap = new Map();
    
    Object.values(tierList).forEach((leagueData: any) => {
      Object.values(leagueData).forEach((pokemonArray: any) => {
        if (Array.isArray(pokemonArray)) {
          pokemonArray.forEach((poke) => {
            // Mantém exemplares únicos baseados no ID (preservando IVs diferentes)
            uniqueMap.set(poke.id, poke);
          });
        }
      });
    });

    return Array.from(uniqueMap.values()).sort((a: any, b: any) => 
      a.nome.localeCompare(b.nome)
    );
  }, [tierList]);

  const fetchMyPokemons = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const api_url = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${api_url}/get_tier_list`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTierList(data);
      }
    } catch (err) {
      console.error("Erro ao carregar arsenal:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyPokemons(); }, [fetchMyPokemons]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto bg-black text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Sword className="text-blue-500" /> Meu Arsenal
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Top 6 por Elemento e Liga</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
            <Plus size={20} /> ADICIONAR
          </button>
          <button onClick={handleLogout} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-500 p-3 rounded-2xl transition-colors border border-zinc-800">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-700">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-black uppercase text-xs tracking-[0.2em]">Sincronizando Dados...</p>
        </div>
      ) : tierList ? (
        <div className="space-y-16">
          <div className="flex flex-wrap gap-3 mb-12">
            {Object.keys(tierList).map((league) => (
              <button key={league} onClick={() => setActiveLeague(activeLeague === league ? null : league)} className={`px-8 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all border ${activeLeague === league ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                {league} League
              </button>
            ))}
            
            {/* NOVO: Quarto botão para a lista consolidada */}
            <button 
              onClick={() => setActiveLeague(activeLeague === 'save_list' ? null : 'save_list')} 
              className={`px-8 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all border flex items-center gap-2 ${activeLeague === 'save_list' ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
            >
              <BookmarkCheck size={20} /> Quais pokémon guardar
            </button>
          </div>

          {/* NOVO: Seção consolidada "Quais pokémon guardar" */}
          {activeLeague === 'save_list' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3">
                <BookmarkCheck className="text-amber-500" size={24} />
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-200">Pokémons Essenciais</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {saveList.map((poke: any) => (
                  <div key={poke.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-[1.5rem] hover:border-amber-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        {/* IMAGEM COM DETECÇÃO SHADOW */}
                        {poke.dex && (
                          <img 
                            src={`https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets/pm${poke.dex}${
                              (() => {
                                const n = poke.nome.toLowerCase();
                                let s = "";

                                // 1. Identificação de Formas Regionais/Especiais
                                if (n.includes("alola")) s += ".fALOLAN";
                                if (n.includes("galar")) s += ".fGALARIAN";
                                if (n.includes("hisui")) s += ".fHISUIAN";
                                if (n.includes("paldea")) s += ".fPALDEA";

                                // 2. Oricorio e Formas de Dança (Ajuste Pom-Pom)
                                if (n.includes("pom-pom") || n.includes("pom_pom")) s += ".fPOMPOM";
                                if (n.includes("baile")) s += ".fBAILE";
                                if (n.includes("sensu")) s += ".fSENSU";
                                if (n.includes("p'au") || n.includes("pa'u") || n.includes("pau")) s += ".fPAU";

                                // 3. Casos Especiais: Florges e Flamigo
                                // Florges NÃO tem arquivo base, precisa de uma cor (ex: .fWHITE)
                                if (poke.dex === 671 && !s) s += ".fWHITE"; 
                                // Flamigo às vezes é registrado como .fNORMAL
                                if (poke.dex === 973 && !s) s += ""; // Se falhar, tente mudar para s += ".fNORMAL"

                                // 4. Shadow (Sempre por último na string do arquivo)
                                if (n.includes("shadow")) s += ".fSHADOW";

                                return s;
                              })()
                            }.icon.png`}
                            alt={poke.nome}
                            className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                            onError={(e) => {
                              // Fallback: Pokébola oficial do Pokémon GO
                              e.currentTarget.src = "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/pokeball_sprite.png";
                            }}
                          />
                        )}
                        <div>
                          <h3 className="text-base font-bold uppercase group-hover:text-amber-400 transition-colors truncate max-w-[120px]">{poke.nome}</h3>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {Array.isArray(poke.tipo) && poke.tipo.map((t: string) => (
                              <span key={t} className="text-[8px] font-black uppercase bg-zinc-800 px-1.5 py-0.5 rounded-md text-zinc-400 border border-zinc-700">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-800 text-center min-w-[60px]">
                        <p className="text-[7px] font-black text-zinc-500 uppercase leading-none mb-1">IV</p>
                        <p className="text-xs font-black text-white">{poke.ataque_iv}/{poke.defesa_iv}/{poke.hp_iv}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/40 p-2 rounded-xl border border-zinc-800/50 text-center">
                        <p className="text-[7px] font-bold text-zinc-600 uppercase mb-0.5">IV Rank</p>
                        <p className="text-xs font-black text-blue-500">#{poke.rank_iv_grande || '-'}</p>
                      </div>
                      <div className="bg-black/40 p-2 rounded-xl border border-zinc-800/50 text-center">
                        <p className="text-[7px] font-bold text-zinc-600 uppercase mb-0.5">League Rank</p>
                        <p className="text-xs font-black text-amber-500">#{poke.rank_liga_grande || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {Object.entries(tierList).map(([leagueName, types]: [string, any]) => (
            activeLeague === leagueName && (
              <section key={leagueName} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3">
                  <Trophy className="text-blue-500" size={24} />
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-200">{leagueName} League</h2>
                </div>

                <div className="space-y-10">
                  {Object.entries(types).map(([typeName, pokemons]: [string, any]) => {
                    const typeStyle = typeColors[typeName.toLowerCase()] || 'text-zinc-500 border-zinc-800 bg-zinc-900/50';
                    return Array.isArray(pokemons) && pokemons.length > 0 && (
                      <div key={typeName} className="space-y-4">
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 border rounded-full inline-block ${typeStyle}`}>
                          Tipo: {typeName}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {pokemons.map((poke: any) => (
                            <div key={poke.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-[1.5rem] hover:border-amber-500/30 transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                  {/* IMAGEM COM DETECÇÃO SHADOW */}
                                  {poke.dex && (
                                    <img 
                                      src={`https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable Assets/pm${poke.dex}${poke.nome.toLowerCase().includes('shadow') ? '.fSHADOW' : ''}.icon.png`}
                                      alt={poke.nome}
                                      className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                      onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                  )}
                                  <div>
                                    <h3 className="text-base font-bold uppercase group-hover:text-amber-400 transition-colors truncate max-w-[120px]">{poke.nome}</h3>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {Array.isArray(poke.tipo) && poke.tipo.map((t: string) => (
                                        <span key={t} className="text-[8px] font-black uppercase bg-zinc-800 px-1.5 py-0.5 rounded-md text-zinc-400 border border-zinc-700">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-800 text-center min-w-[60px]">
                                  <p className="text-[7px] font-black text-zinc-500 uppercase leading-none mb-1">IV</p>
                                  <p className="text-xs font-black text-white">{poke.ataque_iv}/{poke.defesa_iv}/{poke.hp_iv}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/40 p-2 rounded-xl border border-zinc-800/50 text-center">
                                  <p className="text-[7px] font-bold text-zinc-600 uppercase mb-0.5">IV Rank</p>
                                  <p className="text-xs font-black text-blue-500">#{poke.rank_iv_grande || '-'}</p>
                                </div>
                                <div className="bg-black/40 p-2 rounded-xl border border-zinc-800/50 text-center">
                                  <p className="text-[7px] font-bold text-zinc-600 uppercase mb-0.5">League Rank</p>
                                  <p className="text-xs font-black text-amber-500">#{poke.rank_liga_grande || '-'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-zinc-900/20 border-2 border-dashed border-zinc-900 rounded-[3rem]">
          <p className="text-zinc-500 font-bold uppercase text-sm tracking-widest">Nenhum dado encontrado</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-500 font-black text-xs uppercase hover:tracking-widest transition-all">
            + Adicionar Primeiro Pokémon
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <AddPokemonForm onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchMyPokemons(); }} />
          </div>
        </div>
      )}
    </main>
  );
}