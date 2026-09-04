import { handleGetCurrentUser } from '@/lib/user/userActions';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.includes('/locker')) {
    const result = await handleGetCurrentUser();
    if (!result.success || !result.data) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*', '/locker', '/locker/:path*'],
};
