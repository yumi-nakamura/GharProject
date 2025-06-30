import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// 認証が必要なページのパス
const protectedRoutes = [
  '/otayori',
  '/dog',
  '/profile',
  '/settings',
  '/community',
  '/notifications',
  '/health-report'
]

// 認証不要のページのパス
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/auth/callback'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 認証不要のページはスキップ
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return await updateSession(request)
  }

  // 認証が必要なページかチェック
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Supabaseクライアントを作成
    let supabaseResponse = NextResponse.next({
      request,
    })

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
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // ユーザー情報を取得
    const { data: { user }, error } = await supabase.auth.getUser()

    // ユーザーが存在しない場合はログインページにリダイレクト
    if (!user || error) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // セッションを更新してレスポンスを返す
    return supabaseResponse
  }

  // その他のページは通常通り処理
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}