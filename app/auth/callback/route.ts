// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // O 'next' é para onde o usuário deve ir após o login (padrão: /dashboard)
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
          },
        },
      }
    )

    // Faz a troca do código pela sessão real
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Se deu certo, manda para o dashboard (ou para a página que estava tentando acessar)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se algo deu errado (código expirado, etc), manda de volta para o login com erro
  return NextResponse.redirect(`${origin}/auth/login?error=auth-code-error`)
}