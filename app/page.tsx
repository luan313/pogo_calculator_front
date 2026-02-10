// app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard'); // Vai para a área logada
      } else {
        router.replace('/auth/login'); // Vai para o login
      }
    };
    checkAuth();
  }, [router]);

  return null; // O usuário não vê nada aqui, é só um "guarda de trânsito"
}