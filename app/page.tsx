'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import AddPokemonForm from '@/components/AddPokemonForm';

// Interfaces para tipagem
interface Pokemon {
  id: string;
  nome: string;
  rank_liga_grande: number;
  rank_iv_grande: number;
  tipo_individual: string;
}

interface TierListData {
  [key: string]: Pokemon[];
}

export default function Home() {
  const [teams, setTeams] = useState<TierListData>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NOVA LÓGICA: Uma única chamada para o endpoint otimizado
  const fetchAllTeams = async () => {
    setLoading(true);
    const api_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      // Chamando seu endpoint centralizado
      const res = await fetch(`${api_url}/api/get_tier_list`);
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (err) {
      console.error("Erro ao buscar a tier list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTeams();
  }, []);

  // Pegamos as chaves (tipos) que vieram do backend para renderizar
  const tiposDisponiveis = Object.keys(teams).sort();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8">
      {/* MODAL DE ADIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-zinc-300 flex items-center gap-1"
            >
              <X size={24} /> Fechar
            </button>
            {/* Passamos a função de sucesso para o formulário */}
            <AddPokemonForm onSuccess={() => {
              setIsModalOpen(false);
              fetchAllTeams(); 
            }} />
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight italic uppercase">PoGo Ranker</h1>
          <p className="text-zinc-500 mt-2 font-medium">Melhores formações por tipo (Great League)</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 hover:scale-105 flex items-center gap-2"
        >
          <Plus size={24} strokeWidth={3} />
          Adicionar Pokémon
        </button>
      </header>

      {/* DASHBOARD GRID */}
      <div className="max-w-7xl mx-auto space-y-12">
        {loading ? (
          <div className="flex flex-col items-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500">Sincronizando com o Supabase...</p>
          </div>
        ) : (
          tiposDisponiveis.map((tipo) => (
            <section key={tipo}>
              <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6">
                <span className="capitalize text-2xl font-black">{tipo}</span>
                <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 font-bold uppercase">Top 6</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                {teams[tipo].map((p) => (
                  <div key={p.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-2xl">
                      #{p.rank_liga_grande}
                    </div>
                    <h3 className="text-lg font-bold capitalize mb-4 truncate pr-8">{p.nome}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                        <span>IV RANK</span>
                        <span className="text-blue-500">#{p.rank_iv_grande}</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${Math.max(5, 100 - (p.rank_iv_grande / 40.96))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}