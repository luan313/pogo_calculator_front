'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Search, Loader2 } from 'lucide-react';

// Interfaces para bater com o novo formato do Backend
interface IV {
  ataque_iv: number;
  defesa_iv: number;
  hp_iv: number;
}

interface PokemonSuggestion {
  name: string;
  types: string[];
}

export default function AddPokemonForm({ onSuccess }: { onSuccess: () => void }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // ESTADOS
  const [nome, setNome] = useState('');
  const [tipos, setTipos] = useState<string[]>([]); // Estado crucial para o tipo
  const [ivs, setIvs] = useState<IV[]>([{ ataque_iv: 15, defesa_iv: 15, hp_iv: 15 }]);
  const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // AUTOCOMPLETE: Agora lida com objetos
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (nome.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/autocomplete?q=${nome}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data); // data é List[PokemonSuggestion]
        }
      } catch (err) {
        console.error("Erro no autocomplete:", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [nome, API_URL]);

  // SELEÇÃO: Captura nome e tipos de uma vez só
  const handleSelectPokemon = (p: PokemonSuggestion) => {
    setNome(p.name);
    setTipos(p.types); // Aqui resolvemos o erro de "tipo obrigatório"
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Payload idêntico ao PokemonInput do backend
    const payload = {
      nome: nome.toLowerCase(),
      tipo: tipos,
      ivs: ivs
    };

    try {
      const res = await fetch(`${API_URL}/store_data`, {
        method: 'POST', // Correção do erro 405
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const errorData = await res.json();
        alert(`Erro 422: Verifique se o nome e tipo foram preenchidos corretamente.`);
      }
    } catch (err) {
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl text-zinc-100">
      <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-2">
        <Plus className="text-blue-500" /> Adicionar Pokémon
      </h2>

      {/* CAMPO NOME COM SUGESTÕES */}
      <div className="mb-6 relative">
        <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Espécie</label>
        <div className="relative">
          <input
            type="text"
            value={nome}
            onChange={(e) => { setNome(e.target.value); setShowSuggestions(true); }}
            className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl focus:border-blue-500 outline-none transition-all pl-12 font-bold capitalize"
            placeholder="Ex: Swampert..."
            required
          />
          <Search className="absolute left-4 top-4 text-zinc-500" size={18} />
        </div>

        {/* LISTA DE SUGESTÕES */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden z-10 shadow-xl">
            {suggestions.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPokemon(p)}
                className="w-full text-left p-4 hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-0 flex justify-between items-center"
              >
                <span className="font-bold capitalize">{p.name}</span>
                <div className="flex gap-1">
                  {p.types.map(t => (
                    <span key={t} className="text-[9px] bg-zinc-900 px-2 py-0.5 rounded uppercase text-zinc-400 font-black">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CAMPOS DE IV */}
      <div className="space-y-4 mb-8">
        <label className="text-xs font-bold text-zinc-500 uppercase block">Combinações de IV (ATK / DEF / HP)</label>
        {ivs.map((iv, index) => (
          <div key={index} className="flex gap-2">
            {(['ataque', 'defesa', 'hp'] as const).map((attr) => (
              <input
                key={attr}
                type="number"
                min="0" max="15"
                value={iv[`${attr}_iv` as keyof IV]}
                onChange={(e) => {
                  const newIvs = [...ivs];
                  newIvs[index] = { ...iv, [`${attr}_iv`]: parseInt(e.target.value) || 0 };
                  setIvs(newIvs);
                }}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-center font-bold"
              />
            ))}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || !nome}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        SALVAR NO INVENTÁRIO
      </button>
    </form>
  );
}