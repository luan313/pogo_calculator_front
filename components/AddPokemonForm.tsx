'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Search, Loader2, X } from 'lucide-react';

// Definição das interfaces para garantir tipagem forte
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
  // Variável de ambiente para a URL da API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [tipos, setTipos] = useState<string[]>([]);
  const [ivs, setIvs] = useState<IV[]>([{ ataque_iv: 15, defesa_iv: 15, hp_iv: 15 }]);
  
  // Estados de UI
  const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Lógica de Autocomplete (Debounce de 300ms)
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
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Erro ao buscar sugestões:", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [nome, API_URL]);

  // Handler para selecionar Pokémon da lista
  const handleSelectPokemon = (p: PokemonSuggestion) => {
    setNome(p.name);
    setTipos(p.types); // Salva os tipos para enviar no POST
    setShowSuggestions(false);
  };

  const handleAddIv = () => setIvs([...ivs, { ataque_iv: 15, defesa_iv: 15, hp_iv: 15 }]);

  const handleRemoveIv = (index: number) => {
    if (ivs.length > 1) setIvs(ivs.filter((_, i) => i !== index));
  };

  // Envio dos dados para a API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      nome: nome.toLowerCase(),
      tipo: tipos, // Lista de strings exigida pelo backend
      ivs: ivs     // Lista de objetos IV
    };

    try {
      const res = await fetch(`${API_URL}/store_data`, {
        method: 'POST', // Método obrigatório para evitar Erro 405
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess(); // Fecha o modal e atualiza a lista principal
      } else {
        const errorData = await res.json();
        alert(`Erro de validação: ${JSON.stringify(errorData.detail)}`);
      }
    } catch (err) {
      alert("Erro crítico: Verifique se o backend está online.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl text-zinc-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black italic uppercase flex items-center gap-2">
          <Plus className="text-blue-500" size={28} /> Adicionar Exemplares
        </h2>
      </div>

      {/* CAMPO: ESPÉCIE COM AUTOCOMPLETE */}
      <div className="mb-8 relative">
        <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block tracking-[0.2em]">Pokémon</label>
        <div className="relative">
          <input
            type="text"
            value={nome}
            onChange={(e) => { setNome(e.target.value); setShowSuggestions(true); }}
            className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all pl-12 font-bold capitalize"
            placeholder="Digite o nome..."
            required
          />
          <Search className="absolute left-4 top-4 text-zinc-500" size={20} />
          
          {nome && (
            <button 
              type="button" 
              onClick={() => { setNome(''); setTipos([]); }}
              className="absolute right-4 top-4 text-zinc-600 hover:text-zinc-400"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* LISTA DE SUGESTÕES DROP-DOWN */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto">
            {suggestions.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPokemon(p)}
                className="w-full text-left p-4 hover:bg-zinc-700 transition-colors border-b border-zinc-700/50 last:border-0 flex justify-between items-center"
              >
                <span className="font-bold capitalize">{p.name}</span>
                <div className="flex gap-1">
                  {p.types.map(t => (
                    <span key={t} className="text-[9px] bg-zinc-950 px-2 py-0.5 rounded-md uppercase font-black text-zinc-500">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SEÇÃO: LISTA DE IVS */}
      <div className="space-y-4 mb-10">
        <label className="text-[10px] font-black text-zinc-500 uppercase block tracking-[0.2em]">Atributos (ATK / DEF / HP)</label>
        
        {ivs.map((iv, index) => (
          <div key={index} className="flex gap-3 items-center group animate-in fade-in slide-in-from-left-2">
            <div className="grid grid-cols-3 gap-2 flex-1">
              {(['ataque', 'defesa', 'hp'] as const).map((attr) => (
                <div key={attr} className="relative">
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={iv[`${attr}_iv` as keyof IV]}
                    onChange={(e) => {
                      const newIvs = [...ivs];
                      newIvs[index] = { ...iv, [`${attr}_iv`]: Math.min(15, Math.max(0, parseInt(e.target.value) || 0)) };
                      setIvs(newIvs);
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-center font-black text-lg focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
            
            {ivs.length > 1 && (
              <button 
                type="button" 
                onClick={() => handleRemoveIv(index)} 
                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                title="Remover este exemplar"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddIv}
          className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 font-bold hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
        >
          <Plus size={16} /> Adicionar outro exemplar
        </button>
      </div>

      {/* BOTÃO DE SUBMISSÃO */}
      <button
        type="submit"
        disabled={loading || !nome}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <>
            <Save size={20} />
            <span className="uppercase tracking-tighter text-lg">Salvar no Inventário</span>
          </>
        )}
      </button>
    </form>
  );
}