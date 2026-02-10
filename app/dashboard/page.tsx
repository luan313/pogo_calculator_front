'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Loader2, RefreshCw, LogOut, Sword } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddPokemonForm from '@/components/AddPokemonForm';

export default function DashboardPage() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // 1. Função para buscar os dados no seu FastAPI
  const fetchMyPokemons = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return; // O Middleware já trata isso, mas é uma boa prática

      const api_url = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${api_url}/get_tier_list`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPokemons(data);
      }
    } catch (err) {
      console.error("Erro ao carregar arsenal:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPokemons();
  }, [fetchMyPokemons]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // O Middleware vai detectar a saída e te mandar pro login
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* HEADER DO DASHBOARD */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Sword className="text-blue-500" /> Meu Arsenal
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Sua coleção estratégica para a GO Battle League</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} /> ADICIONAR
          </button>
          <button 
            onClick={handleLogout}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-500 p-3 rounded-2xl transition-colors border border-zinc-800"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-700">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-black uppercase text-xs tracking-[0.2em]">Sincronizando Dados...</p>
        </div>
      ) : pokemons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pokemons.map((poke: any) => (
            <div key={poke.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold uppercase group-hover:text-blue-400 transition-colors">{poke.nome}</h3>
                  <div className="flex gap-1.5 mt-2">
                    {poke.tipo.map((t: string) => (
                      <span key={t} className="text-[9px] font-black uppercase bg-zinc-800 px-2 py-1 rounded-md text-zinc-400 border border-zinc-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-800 text-center min-w-[70px]">
                  <p className="text-[8px] font-black text-zinc-500 uppercase leading-none mb-1">IV Total</p>
                  <p className="text-sm font-black text-white">{poke.ataque_iv}/{poke.defesa_iv}/{poke.hp_iv}</p>
                </div>
              </div>

              {/* RANKS DE LIGA */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/50">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Great</p>
                  <p className="font-black text-blue-500">#{poke.rank_iv_grande || '-'}</p>
                </div>
                <div className="text-center border-x border-zinc-800/50 px-2">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Ultra</p>
                  <p className="font-black text-purple-500">#{poke.rank_iv_ultra || '-'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Master</p>
                  <p className="font-black text-orange-500">#{poke.rank_iv_mestra || '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-zinc-900/20 border-2 border-dashed border-zinc-900 rounded-[3rem]">
          <p className="text-zinc-500 font-bold uppercase text-sm tracking-widest">Seu arsenal está vazio</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-blue-500 font-black text-xs uppercase hover:tracking-widest transition-all"
          >
            + Clique para começar
          </button>
        </div>
      )}

      {/* MODAL DE ADIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <AddPokemonForm 
              onClose={() => setIsModalOpen(false)} 
              onSuccess={() => {
                setIsModalOpen(false);
                fetchMyPokemons(); // Atualiza a lista após salvar!
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}