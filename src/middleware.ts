// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // API 라우트와 정적 파일들은 제외
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // raw: true 없이 바로 토큰 가져오기
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    console.log('Middleware - Path:', pathname, 'Token exists:', !!token);

    // 로그인 페이지 접근 시
    if (pathname === '/login') {
      if (token) {
        // 이미 로그인된 사용자는 홈으로 리다이렉트
        console.log('Redirecting authenticated user to home');
        return NextResponse.redirect(new URL('/', req.url));
      }
      // 토큰이 없으면 로그인 페이지 접근 허용
      return NextResponse.next();
    }

    // 다른 모든 페이지 접근 시
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      console.log('Redirecting unauthenticated user to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/workspace', req.url));
    }

    // 토큰이 있으면 접근 허용
    return NextResponse.next();

  } catch (error) {
    console.error("Middleware error:", error);
    // 에러 발생 시 로그인 페이지로 리다이렉트
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};