// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// O createBrowserClient lida melhor com a persistência da sessão no Next.js
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)