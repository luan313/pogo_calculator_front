import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // 1. Criamos a resposta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Inicializamos o cliente do Supabase específico para Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Verificamos o usuário de forma segura (Server-side)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isDashboard = pathname.startsWith('/dashboard')
  const isLoginPage = pathname.startsWith('/auth/login')
  const isRoot = pathname === '/'

  // --- REGRAS DE REDIRECIONAMENTO (O "RESTO" DO CÓDIGO) ---

  // CASO 1: Usuário NÃO logado tentando acessar áreas restritas (Dashboard ou Home)
  if (!user && (isDashboard || isRoot)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // CASO 2: Usuário JÁ logado tentando acessar Login ou a Raiz
  // Isso evita que ele veja o formulário de login se já estiver autenticado
  if (user && (isLoginPage || isRoot)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Se não cair em nenhum redirecionamento, apenas segue o fluxo normal
  return response
}

// 4. Configuração do Matcher: Define em quais URLs este código deve rodar
export const config = {
  matcher: [
    /*
     * Aplica o filtro em:
     * - Rota raiz (/)
     * - Todas as rotas de dashboard (/dashboard/...)
     * - Rota de login (/auth/login)
     * * Ignora arquivos estáticos (imagens, favicon, etc) para não travar o site
     */
    '/',
    '/dashboard/:path*',
    '/auth/login',
  ],
}