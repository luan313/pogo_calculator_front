'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Save } from 'lucide-react';

export default function AddPokemonForm() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState('');
  const [ivs, setIvs] = useState({ atk: 0, def: 0, sta: 0 });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // 1. Lógica de Autocomplete (Busca no Backend)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2 && !selectedPokemon) {
        setSearching(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${query}`);
          const data = await res.json();
          setSuggestions(data); // Assume que o backend retorna uma lista de strings
        } catch (error) {
          console.error("Erro no autocomplete:", error);
        } finally {
          setSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300); // 300ms de debounce

    return () => clearTimeout(timer);
  }, [query, selectedPokemon]);

  // 2. Lógica de Armazenamento
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPokemon) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: selectedPokemon,
          atk: ivs.atk,
          def: ivs.def,
          sta: ivs.sta
        }),
      });

      if (res.ok) {
        alert(`${selectedPokemon} adicionado com sucesso!`);
        // Limpar campos
        setQuery('');
        setSelectedPokemon('');
        setIvs({ atk: 0, def: 0, sta: 0 });
      }
    } catch (error) {
      alert("Erro ao salvar no banco.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Save className="text-blue-500" size={20} /> Adicionar Novo Pokémon
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de Busca */}
        <div className="relative">
          <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Espécie</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Ex: Swampert..."
              className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={selectedPokemon || query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedPokemon('');
              }}
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500" size={18} />}
          </div>

          {/* Sugestões de Autocomplete */}
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
              {suggestions.map((s) => (
                <li
                  key={s}
                  onClick={() => {
                    setSelectedPokemon(s);
                    setSuggestions([]);
                    setQuery(s);
                  }}
                  className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors border-b last:border-none border-zinc-100 dark:border-zinc-700"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Inputs de IV */}
        <div className="grid grid-cols-3 gap-3">
          {(['atk', 'def', 'sta'] as const).map((stat) => (
            <div key={stat}>
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">{stat}</label>
              <input
                type="number"
                min="0"
                max="15"
                value={ivs[stat]}
                onChange={(e) => setIvs({ ...ivs, [stat]: parseInt(e.target.value) || 0 })}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !selectedPokemon}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Salvar Pokémon'}
        </button>
      </form>
    </div>
  );
}