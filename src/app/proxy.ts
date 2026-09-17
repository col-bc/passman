import { handleGetCurrentUser } from '@/lib/user/userActions';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/auth', '/auth/*', '/about'];

export async function proxy(request: NextRequest) {
  if (!PUBLIC_ROUTES.some((route) => request.nextUrl.pathname.match(route))) {
    const result = await handleGetCurrentUser();
    if (!result.success || !result.data) {
      const redirectPath = `/auth/sign-in?next=${encodeURIComponent(request.nextUrl.pathname)}`;
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*', '/vaults', '/vaults/:path*'],
};
