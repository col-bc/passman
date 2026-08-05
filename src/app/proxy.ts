import { getCurrentUser } from '@/lib/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.includes('/locker')) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*', '/locker', '/locker/:path*'],
};
