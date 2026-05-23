import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getUserRole } from '@/lib/rbac';

const VALID_ROLES = ['super_admin', 'org_admin', 'tutor_manager', 'tutor', 'viewer'];
const SUPER_ADMIN_ONLY = ['/admin/settings'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login';
  const isInvitePage = pathname === '/admin/invite';
  const isPasswordResetPage = pathname === '/admin/forgot-password' || pathname === '/admin/reset-password';

  if (!user && !isLoginPage && !isInvitePage && !isPasswordResetPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  if (user && (isLoginPage || isInvitePage) && !isPasswordResetPage) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/admin/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  if (user && !isLoginPage) {
    const ctx = await getUserRole(
      supabase,
      user.id,
      user.user_metadata as Record<string, unknown>
    );

    if (!ctx || !VALID_ROLES.includes(ctx.role)) {
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }

    const isSuperAdminRoute = SUPER_ADMIN_ONLY.some(p => pathname.startsWith(p));
    if (isSuperAdminRoute && ctx.role !== 'super_admin') {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/admin/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }

    supabaseResponse.headers.set('x-user-role', ctx.role);
    if (ctx.orgId) supabaseResponse.headers.set('x-user-org', ctx.orgId);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
