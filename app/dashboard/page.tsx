'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Loader2, LogOut, Sword, Trophy, BookmarkCheck, Globe, Sparkles, List, Copy } from 'lucide-react';
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
  const [metaList, setMetaList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLeague, setActiveLeague] = useState<string | null>(null);
  const [activeMetaLeague, setActiveMetaLeague] = useState<string>('great');
  const [includeSpecials, setIncludeSpecials] = useState(false);
  const router = useRouter();

  // Lista de guardar corrigida (Chave Composta)
  const saveList = useMemo(() => {
    if (!tierList) return [];
    const uniqueMap = new Map();
    
    Object.values(tierList).forEach((leagueData: any) => {
      Object.values(leagueData).forEach((pokemonArray: any) => {
        if (Array.isArray(pokemonArray)) {
          pokemonArray.forEach((poke) => {
            const uniqueKey = `${poke.nome}-${poke.ataque_iv}-${poke.defesa_iv}-${poke.hp_iv}`;
            uniqueMap.set(uniqueKey, poke);
          });
        }
      });
    });

    return Array.from(uniqueMap.values()).sort((a: any, b: any) => 
      a.dex - b.dex
    );
  }, [tierList]);

  // Lista organizada para Todos do Meta
  const sortedMetaList = useMemo(() => {
    if (!metaList) return {};
    const result: Record<string, any[]> = {};
    
    ['great', 'ultra', 'master'].forEach(league => {
      const uniqueMap = new Map();
      if (metaList[league]) {
        Object.values(metaList[league]).forEach((pokemons: any) => {
          if (Array.isArray(pokemons)) {
            pokemons.forEach((p: any) => uniqueMap.set(p.nome, p));
          }
        });
      }
      result[league] = Array.from(uniqueMap.values()).sort((a: any, b: any) => a.rank_liga - b.rank_liga);
    });
    return result;
  }, [metaList]);

  const ownedPokemonNames = useMemo(() => {
    return new Set(saveList.map((p: any) => p.nome.toLowerCase()));
  }, [saveList]);

  const getRankKeys = (leagueName: string) => {
    const name = leagueName.toLowerCase();
    if (name.includes('ultra')) return { iv: 'rank_iv_ultra', rank: 'rank_liga_ultra' };
    if (name.includes('master')) return { iv: 'rank_iv_mestra', rank: 'rank_liga_mestra' };
    return { iv: 'rank_iv_grande', rank: 'rank_liga_grande' };
  };

  const fetchMeta = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const api_url = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${api_url}/get_meta?include_specials=${includeSpecials}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetaList(data);
      }
    } catch (err) {
      console.error("Erro ao carregar meta:", err);
    }
  }, [includeSpecials]);

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

  useEffect(() => { fetchMyPokemons(); fetchMeta(); }, [fetchMyPokemons, fetchMeta]);
  const handleLogout = async () => { await supabase.auth.signOut(); router.refresh(); };

  const copySearchString = (pokemons: any[]) => {
    if (!pokemons || pokemons.length === 0) return;
    const uniqueNames = Array.from(new Set(pokemons.map(p => p.nome))).join(',');
    navigator.clipboard.writeText(uniqueNames).then(() => {
      alert(`String copiada para a área de transferência! (${pokemons.length} Pokémons)`);
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
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
          <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"><Plus size={20} /> ADICIONAR</button>
          <button onClick={handleLogout} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-500 p-3 rounded-2xl transition-colors border border-zinc-800"><LogOut size={20} /></button>
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
              <button key={league} onClick={() => setActiveLeague(activeLeague === league ? null : league)} className={`px-8 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all border ${activeLeague === league ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>{league} League</button>
            ))}
            <button onClick={() => setActiveLeague(activeLeague === 'save_list' ? null : 'save_list')} className={`px-8 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all border flex items-center gap-2 ${activeLeague === 'save_list' ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}><BookmarkCheck size={20} /> Quais pokémon guardar</button>
            <button onClick={() => setActiveLeague(activeLeague === 'meta' ? null : 'meta')} className={`px-8 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all border flex items-center gap-2 ${activeLeague === 'meta' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}><Globe size={20} /> Meta Global</button>
            <button onClick={() => setActiveLeague(activeLeague === 'meta_all' ? null : 'meta_all')} className={`px-8 py-4 rounded-2xl font-black uppercase tracking-tighter transition-all border flex items-center gap-2 ${activeLeague === 'meta_all' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}><List size={20} /> Todos do Meta</button>
          </div>

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
                          {poke.dex && (
                          <img 
                            src={`https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets/pm${poke.dex}${
                              (() => {
                                const n = poke.nome.toLowerCase();
                                let s = "";
                                if (n.includes("alola")) s += ".fALOLA";
                                if (n.includes("galar")) s += ".fGALARIAN";
                                if (n.includes("hisui")) s += ".fHISUIAN";
                                if (n.includes("paldea")) s += ".fPALDEA";
                                if (n.includes("pom-pom") || n.includes("pom_pom")) s += ".fPOMPOM";
                                if (n.includes("baile")) s += ".fBAILE";
                                if (n.includes("sensu")) s += ".fSENSU";
                                if (n.includes("p'au") || n.includes("pa'u") || n.includes("pau")) s += ".fPAU";
                                if (poke.dex === 671 && !s) s += ".fWHITE"; 
                                if (n.includes("shadow")) s += ".fSHADOW";
                                return s;
                              })()
                            }.icon.png`}
                            alt={poke.nome}
                            className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                            onError={(e) => { e.currentTarget.src = "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/pokeball_sprite.png"; }}
                          />
                        )}
                        <div>
                            <h3 className="text-base font-bold uppercase group-hover:text-amber-400 transition-colors truncate max-w-[120px]">{poke.nome}</h3>
                            <div className="flex flex-wrap gap-1 mt-1.5">{Array.isArray(poke.tipo) && poke.tipo.map((t: string) => (<span key={t} className="text-[8px] font-black uppercase bg-zinc-800 px-1.5 py-0.5 rounded-md text-zinc-400 border border-zinc-700">{t}</span>))}</div>
                          </div>
                        </div>
                        <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-800 text-center min-w-[60px]">
                          <p className="text-[7px] font-black text-zinc-500 uppercase leading-none mb-1">IV</p>
                          <p className="text-xs font-black text-white">{poke.ataque_iv}/{poke.defesa_iv}/{poke.hp_iv}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/40 p-2 rounded-xl border border-zinc-800/50 text-center"><p className="text-[7px] font-bold text-zinc-600 uppercase mb-0.5">IV Rank</p><p className="text-xs font-black text-blue-500">#{poke.rank_iv_grande || '-'}</p></div>
                        <div className="bg-black/40 p-2 rounded-xl border border-zinc-800/50 text-center"><p className="text-[7px] font-bold text-zinc-600 uppercase mb-0.5">League Rank</p><p className="text-xs font-black text-amber-500">#{poke.rank_liga_grande || '-'}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
             </section>
          )}

          {activeLeague === 'meta_all' && sortedMetaList && (
            <section className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {['great', 'ultra', 'master'].map((league) => (
                <div key={league} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="text-indigo-500" size={24} />
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-200">{league} League - Meta Completo</h2>
                    </div>
                    {/* Botão Criar String (MANTIDO) */}
                    <button onClick={() => copySearchString(sortedMetaList[league])} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-indigo-600/20 hover:text-indigo-400 hover:border-indigo-500/50 border border-zinc-700 rounded-xl text-xs font-bold uppercase transition-all">
                      <Copy size={14} /> Criar String
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {sortedMetaList[league]?.map((poke: any) => {
                      const isOwned = ownedPokemonNames.has(poke.nome.toLowerCase());
                      return (
                        <div key={`${league}-${poke.nome}`} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-[1.5rem] hover:border-indigo-500/30 transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-3 items-center">
                             {poke.dex && (
                                <img 
                                  src={`https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets/pm${poke.dex}${
                                    (() => {
                                      const n = poke.nome.toLowerCase();
                                      let s = "";
                                      if (n.includes("alola")) s += ".fALOLA";
                                      if (n.includes("galar")) s += ".fGALARIAN";
                                      if (n.includes("hisui")) s += ".fHISUIAN";
                                      if (n.includes("paldea")) s += ".fPALDEA";
                                      if (n.includes("pom-pom") || n.includes("pom_pom")) s += ".fPOMPOM";
                                      if (n.includes("baile")) s += ".fBAILE";
                                      if (n.includes("sensu")) s += ".fSENSU";
                                      if (n.includes("p'au") || n.includes("pa'u") || n.includes("pau")) s += ".fPAU";
                                      if (poke.dex === 671 && !s) s += ".fWHITE"; 
                                      if (n.includes("shadow")) s += ".fSHADOW";
                                      return s;
                                    })()
                                  }.icon.png`}
                                  alt={poke.nome}
                                  className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                  onError={(e) => { e.currentTarget.src = "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/pokeball_sprite.png"; }}
                                />
                              )}
                              <div>
                                <h3 className={`text-base font-bold uppercase transition-colors truncate max-w-[140px] ${isOwned ? 'border border-green-500 text-green-400 bg-green-500/10 rounded-full px-2 py-0.5 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'group-hover:text-indigo-400'}`}>{poke.nome}</h3>
                                <div className="flex flex-wrap gap-1 mt-1.5">{Array.isArray(poke.tipo) && poke.tipo.map((t: string) => (<span key={t} className="text-[8px] font-black uppercase bg-zinc-800 px-1.5 py-0.5 rounded-md text-zinc-400 border border-zinc-700">{t}</span>))}</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-zinc-800/50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Rank Global</span>
                            <span className="text-sm font-black text-indigo-400">#{poke.rank_liga}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          )}

          {activeLeague === 'meta' && metaList && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3"><Globe className="text-purple-500" size={24} /><h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-200">Meta do Jogo</h2></div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex gap-2">{['great', 'ultra', 'master'].map((league) => (<button key={league} onClick={() => setActiveMetaLeague(league)} className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider border transition-all ${activeMetaLeague === league ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}>{league} League</button>))}</div>
                  <div className="w-px h-8 bg-zinc-800 mx-2 hidden sm:block"></div>
                  <button onClick={() => setIncludeSpecials(!includeSpecials)} className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider border transition-all flex items-center gap-2 ${includeSpecials ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}><Sparkles size={16} />{includeSpecials ? 'Incluindo Especiais' : 'Incluir Especiais'}</button>
                </div>
              </div>
              
              {/* Botão Criar String (MANTIDO) */}
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    const allInCurrentMeta = Object.values(metaList[activeMetaLeague] || {}).flat();
                    copySearchString(allInCurrentMeta as any[]);
                  }} 
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-purple-600/20 hover:text-purple-400 hover:border-purple-500/50 border border-zinc-700 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  <Copy size={14} /> Criar String ({activeMetaLeague})
                </button>
              </div>

              <div className="space-y-10">
                {metaList[activeMetaLeague] && Object.entries(metaList[activeMetaLeague]).map(([typeName, pokemons]: [string, any]) => {
                  const typeStyle = typeColors[typeName.toLowerCase()] || 'text-zinc-500 border-zinc-800 bg-zinc-900/50';
                  return Array.isArray(pokemons) && pokemons.length > 0 && (
                    <div key={typeName} className="space-y-4">
                      <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 border rounded-full inline-block ${typeStyle}`}>Tipo: {typeName}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {pokemons.map((poke: any) => {
                          const isOwned = ownedPokemonNames.has(poke.nome.toLowerCase());
                          return (
                            <div key={`${typeName}-${poke.nome}`} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-[1.5rem] hover:border-purple-500/30 transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3 items-center">
                                  {poke.dex && (
                                <img 
                                  src={`https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets/pm${poke.dex}${
                                    (() => {
                                      const n = poke.nome.toLowerCase();
                                      let s = "";
                                      if (n.includes("alola")) s += ".fALOLA";
                                      if (n.includes("galar")) s += ".fGALARIAN";
                                      if (n.includes("hisui")) s += ".fHISUIAN";
                                      if (n.includes("paldea")) s += ".fPALDEA";
                                      if (n.includes("pom-pom") || n.includes("pom_pom")) s += ".fPOMPOM";
                                      if (n.includes("baile")) s += ".fBAILE";
                                      if (n.includes("sensu")) s += ".fSENSU";
                                      if (n.includes("p'au") || n.includes("pa'u") || n.includes("pau")) s += ".fPAU";
                                      if (poke.dex === 671 && !s) s += ".fWHITE"; 
                                      if (n.includes("shadow")) s += ".fSHADOW";
                                      return s;
                                    })()
                                  }.icon.png`}
                                  alt={poke.nome}
                                  className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                  onError={(e) => { e.currentTarget.src = "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/pokeball_sprite.png"; }}
                                />
                              )}
                              <div>
                                    <h3 className={`text-base font-bold uppercase transition-colors truncate max-w-[140px] ${isOwned ? 'border border-green-500 text-green-400 bg-green-500/10 rounded-full px-2 py-0.5 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'group-hover:text-purple-400'}`}>{poke.nome}</h3>
                                    <div className="flex flex-wrap gap-1 mt-1.5">{Array.isArray(poke.tipo) && poke.tipo.map((t: string) => (<span key={t} className="text-[8px] font-black uppercase bg-zinc-800 px-1.5 py-0.5 rounded-md text-zinc-400 border border-zinc-700">{t}</span>))}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-black/40 p-3 rounded-xl border border-zinc-800/50 flex justify-between items-center"><span className="text-[10px] font-bold text-zinc-500 uppercase">Rank Global</span><span className="text-sm font-black text-purple-400">#{poke.rank_liga}</span></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {Object.entries(tierList).map(([leagueName, types]: [string, any]) => {
            const { iv, rank } = getRankKeys(leagueName);
            return activeLeague === leagueName && (
              <section key={leagueName} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3">
                  <Trophy className="text-blue-500" size={24} />
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-200">{leagueName} League</h2>
                </div>
                {/* Botão removido daqui conforme solicitado */}
                
                <div className="space-y-10">
                  {Object.entries(types).map(([typeName, pokemons]: [string, any]) => {
                    const typeStyle = typeColors[typeName.toLowerCase()] || 'text-zinc-500 border-zinc-800 bg-zinc-900/50';
                    return Array.isArray(pokemons) && pokemons.length > 0 && (
                      <div key={typeName} className="space-y-4">
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 border rounded-full inline-block ${typeStyle}`}>Tipo: {typeName}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {pokemons.map((poke: any) => (
                            <div key={poke.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-[1.5rem] hover:border-amber-500/30 transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                  {poke.dex && (
                                <img 
                                  src={`https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets/pm${poke.dex}${
                                    (() => {
                                      const n = poke.nome.toLowerCase();
                                      let s = "";
                                      if (n.includes("alola")) s += ".fALOLA";
                                      if (n.includes("galar")) s += ".fGALARIAN";
                                      if (n.includes("hisui")) s += ".fHISUIAN";
                                      if (n.includes("paldea")) s += ".fPALDEA";
                                      if (n.includes("pom-pom") || n.includes("pom_pom")) s += ".fPOMPOM";
                                      if (n.includes("baile")) s += ".fBAILE";
                                      if (n.includes("sensu")) s += ".fSENSU";
                                      if (n.includes("p'au") || n.includes("pa'u") || n.includes("pau")) s += ".fPAU";
                                      if (poke.dex === 671 && !s) s += ".fWHITE"; 
                                      if (n.includes("shadow")) s += ".fSHADOW";
                                      return s;
                                    })()
                                  }.icon.png`}
                                  alt={poke.nome}
                                  className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                  onError={(e) => { e.currentTarget.src = "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Items/pokeball_sprite.png"; }}
                                />
                              )}
                                <div>
                                    <h3 className="text-base font-bold uppercase group-hover:text-amber-400 transition-colors truncate max-w-[120px]">{poke.nome}</h3>
                                    <div className="flex flex-wrap gap-1 mt-1.5">{Array.isArray(poke.tipo) && poke.tipo.map((t: string) => (<span key={t} className="text-[8px] font-black uppercase bg-zinc-800 px-1.5 py-0.5 rounded-md text-zinc-400 border border-zinc-700">{t}</span>))}</div>
                                  </div>
                                </div>
                                <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-800 text-center min-w-[60px]"><p className="text-[7px] font-black text-zinc-500 uppercase leading-none mb-1">IV</p><p className="text-xs font-black text-white">{poke.ataque_iv}/{poke.defesa_iv}/{poke.hp_iv}</p></div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/40 p-2 rounded-xl border border-zinc-800/50 text-center"><p className="text-[7px] font-bold text-zinc-600 uppercase mb-0.5">IV Rank</p><p className="text-xs font-black text-blue-500">#{poke[iv] || '-'}</p></div>
                                <div className="bg-black/40 p-2 rounded-xl border border-zinc-800/50 text-center"><p className="text-[7px] font-bold text-zinc-600 uppercase mb-0.5">League Rank</p><p className="text-xs font-black text-amber-500">#{poke[rank] || '-'}</p></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
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