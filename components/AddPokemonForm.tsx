'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, X, Save, Plus, Trash2, Info } from 'lucide-react';

interface IVEntry {
  ataque_iv: number;
  defesa_iv: number;
  hp_iv: number;
}

interface PokemonSuggestion {
  name: string;
  types: string[];
}

interface AddPokemonFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function AddPokemonForm({ onSuccess, onClose }: AddPokemonFormProps) {
  const [name, setName] = useState('');
  const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [ivs, setIvs] = useState<IVEntry[]>([{ ataque_iv: 0, defesa_iv: 0, hp_iv: 0 }]);
  const [loading, setLoading] = useState(false);

  // 1. CONSUMO DA API DE AUTOCOMPLETE
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (name.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const api_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        const res = await fetch(`${api_url}/autocomplete?name=${name}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setSuggestions(data); // Recebe a lista de objetos {name, types}
        }
      } catch (err) {
        console.error("Erro no autocomplete:", err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [name]);

  // 2. SINCRONIZAÇÃO AUTOMÁTICA DOS TIPOS
  // Quando o nome digitado for igual a um nome na lista de sugestões, 
  // nós extraímos os tipos e salvamos no estado 'selectedTypes'.
  useEffect(() => {
    const matchedPokemon = suggestions.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    if (matchedPokemon) {
      setSelectedTypes(matchedPokemon.types);
    } else {
      setSelectedTypes([]); // Limpa se o nome não for exato/válido
    }
  }, [name, suggestions]);

  // 3. ENVIO PARA O STORE DATA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTypes.length === 0) {
      alert("Por favor, selecione um Pokémon válido da lista.");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const api_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${api_url}/store_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          nome: name,
          tipo: selectedTypes, // Array vindo do autocomplete
          ivs: ivs           // Array de objetos de IVs
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (err) {
      alert("Falha ao salvar dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Novo Registro</h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INPUT DE NOME COM AUTOCOMPLETE */}
        <div>
          <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 ml-1">Espécie</label>
          <input
            type="text"
            list="pokemon-suggestions"
            required
            autoComplete="off"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
            placeholder="Ex: Medicham"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <datalist id="pokemon-suggestions">
            {suggestions.map((p) => (
              <option key={p.name} value={p.name} />
            ))}
          </datalist>
          
          {/* FEEDBACK VISUAL DOS TIPOS */}
          {selectedTypes.length > 0 && (
            <div className="flex gap-2 mt-3 ml-1">
              {selectedTypes.map(t => (
                <span key={t} className="text-[10px] font-black uppercase bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md border border-blue-500/30">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO DE IVS (MÚLTIPLOS) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase text-zinc-500 ml-1">IVs Disponíveis</label>
            <button 
              type="button" 
              onClick={() => setIvs([...ivs, { ataque_iv: 0, defesa_iv: 0, hp_iv: 0 }])}
              className="text-blue-500 hover:text-blue-400 text-xs font-bold flex items-center gap-1"
            >
              <Plus size={14} /> MAIS IV
            </button>
          </div>

          {ivs.map((iv, index) => (
            <div key={index} className="flex items-center gap-2 bg-zinc-800/50 p-3 rounded-2xl border border-zinc-800">
              <input
                type="number"
                placeholder="ATK"
                className="w-full bg-zinc-800 text-center rounded-lg py-2 text-sm font-bold border border-zinc-700"
                value={iv.ataque_iv}
                onChange={(e) => {
                  const newIvs = [...ivs];
                  newIvs[index].ataque_iv = parseInt(e.target.value) || 0;
                  setIvs(newIvs);
                }}
              />
              <input
                type="number"
                placeholder="DEF"
                className="w-full bg-zinc-800 text-center rounded-lg py-2 text-sm font-bold border border-zinc-700"
                value={iv.defesa_iv}
                onChange={(e) => {
                  const newIvs = [...ivs];
                  newIvs[index].defesa_iv = parseInt(e.target.value) || 0;
                  setIvs(newIvs);
                }}
              />
              <input
                type="number"
                placeholder="HP"
                className="w-full bg-zinc-800 text-center rounded-lg py-2 text-sm font-bold border border-zinc-700"
                value={iv.hp_iv}
                onChange={(e) => {
                  const newIvs = [...ivs];
                  newIvs[index].hp_iv = parseInt(e.target.value) || 0;
                  setIvs(newIvs);
                }}
              />
              {ivs.length > 1 && (
                <button type="button" onClick={() => setIvs(ivs.filter((_, i) => i !== index))} className="text-red-500 p-2">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-2xl">
            CANCELAR
          </button>
          <button
            type="submit"
            disabled={loading || !name || selectedTypes.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            SALVAR NO BANCO
          </button>
        </div>
      </form>
    </div>
  );
}