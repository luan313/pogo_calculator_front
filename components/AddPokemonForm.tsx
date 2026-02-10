'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, X, Save, Plus, Trash2 } from 'lucide-react';

interface IVEntry {
  ataque_iv: number;
  defesa_iv: number;
  hp_iv: number;
}

interface AddPokemonFormProps {
  onSuccess: () => void;
  onClose: () => void; // Propriedade que estava faltando no TypeScript
}

// Lista de tipos para o seletor
const POGO_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 
  'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 
  'dragon', 'dark', 'steel', 'fairy'
];

export default function AddPokemonForm({ onSuccess, onClose }: AddPokemonFormProps) {
  const [name, setName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [ivs, setIvs] = useState<IVEntry[]>([{ ataque_iv: 0, defesa_iv: 0, hp_iv: 0 }]);
  const [loading, setLoading] = useState(false);

  // Adicionar nova linha de IV (para o mesmo Pokémon)
  const addIvRow = () => {
    setIvs([...ivs, { ataque_iv: 0, defesa_iv: 0, hp_iv: 0 }]);
  };

  const removeIvRow = (index: number) => {
    setIvs(ivs.filter((_, i) => i !== index));
  };

  const updateIv = (index: number, field: keyof IVEntry, value: number) => {
    const newIvs = [...ivs];
    newIvs[index][field] = Math.min(15, Math.max(0, value));
    setIvs(newIvs);
  };

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else if (selectedTypes.length < 2) {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Recupera o token da sessão atual
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Sua sessão expirou. Por favor, faça login novamente.");
        return;
      }

      const api_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // 2. Envia os dados para o FastAPI com o Header de Autorização
      const response = await fetch(`${api_url}/store_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // O segredo da autenticação
        },
        body: JSON.stringify({
          nome: name,
          tipo: selectedTypes,
          ivs: ivs
        })
      });

      if (response.ok) {
        onSuccess(); // Fecha o modal e atualiza a lista no Dashboard
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar: ${errorData.detail || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Falha ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Novo Pokémon</h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NOME */}
        <div>
          <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 ml-1">Espécie</label>
          <input
            type="text"
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
            placeholder="Ex: Azumarill"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* TIPOS */}
        <div>
          <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 ml-1">Tipos (Máx 2)</label>
          <div className="flex flex-wrap gap-2">
            {POGO_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedTypes.includes(type) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* IVS */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase text-zinc-500 ml-1">IVs</label>
            <button 
              type="button" 
              onClick={addIvRow}
              className="text-blue-500 hover:text-blue-400 text-xs font-bold flex items-center gap-1"
            >
              <Plus size={14} /> MAIS IVs
            </button>
          </div>

          {ivs.map((iv, index) => (
            <div key={index} className="flex items-center gap-2 bg-zinc-800/50 p-3 rounded-2xl border border-zinc-800">
              <input
                type="number"
                placeholder="ATK"
                className="w-full bg-zinc-800 text-center rounded-lg py-2 text-sm font-bold border border-zinc-700 focus:border-blue-500 outline-none"
                value={iv.ataque_iv}
                onChange={(e) => updateIv(index, 'ataque_iv', parseInt(e.target.value))}
              />
              <input
                type="number"
                placeholder="DEF"
                className="w-full bg-zinc-800 text-center rounded-lg py-2 text-sm font-bold border border-zinc-700 focus:border-blue-500 outline-none"
                value={iv.defesa_iv}
                onChange={(e) => updateIv(index, 'defesa_iv', parseInt(e.target.value))}
              />
              <input
                type="number"
                placeholder="HP"
                className="w-full bg-zinc-800 text-center rounded-lg py-2 text-sm font-bold border border-zinc-700 focus:border-blue-500 outline-none"
                value={iv.hp_iv}
                onChange={(e) => updateIv(index, 'hp_iv', parseInt(e.target.value))}
              />
              {ivs.length > 1 && (
                <button type="button" onClick={() => removeIvRow(index)} className="text-red-500 p-2">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-2xl transition-all"
          >
            CANCELAR
          </button>
          <button
            type="submit"
            disabled={loading || !name || selectedTypes.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> SALVAR</>}
          </button>
        </div>
      </form>
    </div>
  );
}