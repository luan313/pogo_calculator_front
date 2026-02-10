'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Loader2, RefreshCw, LogOut, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddPokemonForm from '@/components/AddPokemonForm'; // Ajuste o caminho conforme seu projeto

export default function Dashboard() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // 1. FUNÇÃO PARA BUSCAR POKÉMON NO BACKEND
  const fetchMyPokemons = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const api_url = process.env.NEXT_PUBLIC_API_URL;
      // IMPORTANTE: Use exatamente o nome do endpoint do seu Python (get_tier_list)
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
      console.error("Erro ao carregar lista:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Busca inicial ao carregar a página
  useEffect(() => {
    fetchMyPokemons();
  }, [fetchMyPokemons]);

  // 2. LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Meu Arsenal</h1>
          <p className="text-zinc-500 text-sm">Gerencie seus Pokémon e ranks de IV</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} /> NOVO POKÉMON
          </button>
          
          <button 
            onClick={handleLogout}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 p-3 rounded-2xl transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* LISTA DE POKÉMON */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold uppercase tracking-widest text-xs">Sincronizando com o Banco...</p>
          </div>
        ) : pokemons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pokemons.map((poke: any) => (
              <div key={poke.id} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl hover:border-zinc-700 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold uppercase">{poke.nome}</h3>
                    <div className="flex gap-1 mt-1">
                      {poke.tipo.map((t: string) => (
                        <span key={t} className="text-[9px] font-black uppercase bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-zinc-500 font-bold uppercase">IV Total</span>
                    <span className="text-lg font-black text-blue-500">{poke.ataque_iv}/{poke.defesa_iv}/{poke.hp_iv}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-t border-zinc-800/50">
                   <div className="text-center">
                     <p className="text-[8px] font-bold text-zinc-600 uppercase">Great</p>
                     <p className="text-sm font-black">#{poke.rank_iv_grande || '-'}</p>
                   </div>
                   <div className="text-center border-x border-zinc-800/50">
                     <p className="text-[8px] font-bold text-zinc-600 uppercase">Ultra</p>
                     <p className="text-sm font-black">#{poke.rank_iv_ultra || '-'}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-[8px] font-bold text-zinc-600 uppercase">Master</p>
                     <p className="text-sm font-black">#{poke.rank_iv_mestra || '-'}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/20 border-2 border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-600 font-medium">Sua tier list está vazia.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-blue-500 font-bold text-sm mt-2 hover:underline">
              Comece adicionando seu primeiro Pokémon
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE ADIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <AddPokemonForm 
              onClose={() => setIsModalOpen(false)} 
              onSuccess={() => {
                setIsModalOpen(false);
                fetchMyPokemons(); // Atualiza a lista automaticamente após salvar
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}