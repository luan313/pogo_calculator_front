'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface AddPokemonProps {
  onSuccess: () => void;
}

export default function AddPokemonForm({ onSuccess }: AddPokemonProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState('');
  const [ivs, setIvs] = useState({ atk: 0, def: 0, sta: 0 });
  const [loading, setLoading] = useState(false);

  // Lógica de Autocomplete (Busca)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1 && !selectedPokemon) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${query}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data);
          }
        } catch (e) { console.error(e); }
      } else { setSuggestions([]); }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, selectedPokemon]);

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
        onSuccess(); // CHAMA A FUNÇÃO PARA FECHAR MODAL E RECARREGAR LISTA
      }
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl space-y-6">
      <h2 className="text-2xl font-black italic uppercase">Novo Pokémon</h2>
      
      {/* Campo Autocomplete */}
      <div className="relative">
        <input
          type="text"
          placeholder="Nome do Pokémon..."
          className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          value={selectedPokemon || query}
          onChange={(e) => { setQuery(e.target.value); setSelectedPokemon(''); }}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-2 bg-white dark:bg-zinc-800 border rounded-2xl shadow-xl max-h-48 overflow-y-auto">
            {suggestions.map(s => (
              <li key={s} onClick={() => { setSelectedPokemon(s); setSuggestions([]); setQuery(s); }}
                  className="p-4 hover:bg-blue-500 hover:text-white cursor-pointer font-bold capitalize transition-colors">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Inputs de IV */}
      <div className="grid grid-cols-3 gap-4">
        {['atk', 'def', 'sta'].map((stat) => (
          <div key={stat} className="text-center">
            <span className="text-[10px] font-black text-zinc-400 uppercase">{stat}</span>
            <input
              type="number"
              min="0" max="15"
              value={ivs[stat as keyof typeof ivs]}
              onChange={(e) => setIvs({...ivs, [stat]: parseInt(e.target.value) || 0})}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-center font-black text-xl"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || !selectedPokemon}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin mx-auto" /> : 'CONFIRMAR'}
      </button>
    </form>
  );
}