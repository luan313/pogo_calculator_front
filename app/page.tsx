'use client';

import { useState, useEffect } from 'react';
import { Plus, Shield, Zap, Flame, Droplets, Leaf, Ghost, Star } from 'lucide-react'; // Ícones úteis

// Lista oficial de tipos para iterar na tela
const POKEMON_TYPES = [
  "bug", "dark", "dragon", "electric", "fairy", "fighting", 
  "fire", "flying", "ghost", "grass", "ground", "ice", 
  "normal", "poison", "psychic", "rock", "steel", "water"
];

interface Pokemon {
  id: string;
  nome: string;
  rank_liga_grande: number;
  rank_iv_grande: number;
  tipo_individual: string;
}

export default function Home() {
  const [teams, setTeams] = useState<{ [key: string]: Pokemon[] }>({});
  const [loading, setLoading] = useState(true);

  // Busca os dados de todos os tipos ao carregar a página
  useEffect(() => {
    const fetchAllTeams = async () => {
      const api_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const fetchedTeams: { [key: string]: Pokemon[] } = {};

      try {
        // Fazemos a busca para cada tipo (Você pode otimizar isso criando um endpoint "all" no backend depois)
        await Promise.all(
          POKEMON_TYPES.map(async (tipo) => {
            const res = await fetch(`${api_url}/api/pokemon/${tipo}`);
            if (res.ok) {
              const data = await res.json();
              fetchedTeams[tipo] = data;
            }
          })
        );
        setTeams(fetchedTeams);
      } catch (err) {
        console.error("Erro ao buscar dados do backend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTeams();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">PoGo Team Ranker</h1>
          <p className="text-zinc-500 mt-2">Seus melhores times de cada tipo (Great League)</p>
        </div>
        
        <button 
          onClick={() => alert("Abrir modal de cadastro...")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg hover:scale-105"
        >
          <Plus size={20} />
          Adicionar Pokémon
        </button>
      </header>

      {/* DASHBOARD GRID */}
      <div className="max-w-7xl mx-auto space-y-12">
        {loading ? (
          <div className="text-center py-20 text-xl animate-pulse">Carregando seus times...</div>
        ) : (
          POKEMON_TYPES.map((tipo) => (
            <section key={tipo} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="capitalize text-2xl font-bold">{tipo}</span>
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm text-zinc-500 italic">Top 6</span>
              </div>

              {/* Grid de Cards de Pokémon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {teams[tipo]?.length > 0 ? (
                  teams[tipo].map((p) => (
                    <div key={p.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      {/* Badge de Rank da Liga */}
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                        RANK #{p.rank_liga_grande}
                      </div>
                      
                      <h3 className="text-lg font-bold capitalize mt-2 mb-4">{p.nome}</h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Melhor IV Rank:</span>
                          <span className="font-mono text-blue-500 font-bold">#{p.rank_iv_grande}</span>
                        </div>
                        {/* Barra de progresso visual para o IV */}
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full">
                          <div 
                            className="bg-blue-500 h-full rounded-full" 
                            style={{ width: `${Math.max(5, 100 - (p.rank_iv_grande / 40.96))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-4 text-zinc-400 text-sm italic">
                    Nenhum Pokémon deste tipo encontrado na sua coleção.
                  </div>
                )}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}