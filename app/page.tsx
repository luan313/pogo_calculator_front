'use client';

import { useState, useEffect } from 'react';
import { Shield, Sword, Zap, Plus, Loader2 } from 'lucide-react';
import AddPokemonForm from '@/components/AddPokemonForm';

type League = 'great' | 'ultra' | 'master';

const typeConfigs: Record<string, { label: string; color: string }> = {
  fire: { label: 'Fogo', color: 'bg-orange-600' },
  water: { label: 'Água', color: 'bg-blue-600' },
  grass: { label: 'Planta', color: 'bg-green-600' },
  electric: { label: 'Elétrico', color: 'bg-yellow-500' },
  ice: { label: 'Gelo', color: 'bg-cyan-400' },
  fighting: { label: 'Lutador', color: 'bg-red-700' },
  poison: { label: 'Venenoso', color: 'bg-purple-500' },
  ground: { label: 'Terra', color: 'bg-amber-700' },
  flying: { label: 'Voador', color: 'bg-indigo-400' },
  psychic: { label: 'Psíquico', color: 'bg-pink-500' },
  bug: { label: 'Inseto', color: 'bg-lime-600' },
  rock: { label: 'Pedra', color: 'bg-stone-600' },
  ghost: { label: 'Fantasma', color: 'bg-violet-800' },
  dragon: { label: 'Dragão', color: 'bg-indigo-700' },
  dark: { label: 'Sombrio', color: 'bg-zinc-800' },
  steel: { label: 'Aço', color: 'bg-slate-500' },
  fairy: { label: 'Fada', color: 'bg-pink-400' },
  normal: { label: 'Normal', color: 'bg-zinc-400' },
};

export default function Home() {
  const [allData, setAllData] = useState<any>(null);
  const [selectedLeague, setSelectedLeague] = useState<League>('great');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAllTeams = async () => {
    setLoading(true);
    const api_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${api_url}/get_tier_list`);
      if (res.ok) {
        const data = await res.json();
        setAllData(data);
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTeams();
  }, []);

  // GARANTIA: Se allData for null ou a liga não existir, usamos um objeto vazio
  const currentTeams = allData?.[selectedLeague] ?? {};
  const tiposDisponiveis = Object.keys(currentTeams).sort();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <Zap className="text-yellow-400 fill-yellow-400" /> PoGo Ranker
          </h1>
          <p className="text-zinc-500 font-medium">Seu inventário otimizado para PvP</p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          <Plus size={20} /> ADICIONAR POKÉMON
        </button>
      </div>

      {/* SELETOR DE LIGAS */}
      <div className="max-w-fit mx-auto bg-zinc-900 p-1.5 rounded-2xl flex gap-1 mb-12 border border-zinc-800">
        {(['great', 'ultra', 'master'] as const).map((league) => (
          <button
            key={league}
            onClick={() => setSelectedLeague(league)}
            className={`px-6 py-3 rounded-xl font-bold uppercase text-sm transition-all flex items-center gap-2 ${
              selectedLeague === league ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {league === 'great' && <Shield size={16} />}
            {league === 'ultra' && <Sword size={16} />}
            {league === 'master' && <Zap size={16} />}
            {league}
          </button>
        ))}
      </div>

      {/* LISTAGEM PRINCIPAL */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="font-bold text-zinc-500 animate-pulse">Sincronizando dados...</p>
          </div>
        ) : tiposDisponiveis.length > 0 ? (
          tiposDisponiveis.map((tipo) => (
            <section key={tipo} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-400">
                  {typeConfigs[tipo]?.label || tipo}
                </h2>
                <div className="h-px bg-zinc-800 flex-1"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* O SEGREDO ESTÁ AQUI: O uso do ?. garante que se for undefined, o map não é chamado */}
                {currentTeams[tipo]?.map((pokemon: any) => (
                  <div 
                    key={pokemon.id} 
                    className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl hover:border-blue-500/50 transition-colors group relative overflow-hidden"
                  >
                    <div className={`absolute -right-2 -top-2 p-4 rounded-full opacity-10 ${typeConfigs[tipo]?.color || 'bg-blue-600'}`}>
                      <Shield size={24} />
                    </div>
                    
                    <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg mb-2 inline-block uppercase">
                      RANK #{pokemon.rank_liga_grande || pokemon.rank_liga_ultra || pokemon.rank_liga_mestra || '?' }
                    </span>
                    
                    <h3 className="text-lg font-bold capitalize mb-1">{pokemon.nome}</h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500 font-medium">IV Rank</span>
                      <span className="font-black text-zinc-300">
                        #{pokemon.rank_iv_grande || pokemon.rank_iv_ultra || pokemon.rank_iv_mestra || '?' }
                      </span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between text-[10px] font-bold text-zinc-500">
                      <span>{pokemon.ataque_iv} / {pokemon.defesa_iv} / {pokemon.hp_iv}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-800">
            <p className="text-zinc-500 font-bold">Nenhum Pokémon encontrado.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md relative">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute -top-12 right-0 text-white hover:text-zinc-400 font-bold"
            >
              FECHAR [X]
            </button>
            <AddPokemonForm onSuccess={() => {
              setShowAddForm(false);
              fetchAllTeams();
            }} />
          </div>
        </div>
      )}
    </main>
  );
}