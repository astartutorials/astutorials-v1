import { NextRequest } from 'next/server';

const mockGetSession = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: { getSession: mockGetSession },
  })),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test_anon_key';

import { middleware } from '@/middleware';

const MOCK_USER = { id: 'admin-id', email: 'admin@astar.com', user_metadata: { role: 'super_admin' } };

function makeRequest(pathname: string) {
  return new NextRequest(`http://localhost:3000${pathname}`);
}

describe('Admin middleware', () => {
  beforeEach(() => mockGetSession.mockReset());

  describe('unauthenticated user', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
    });

    it('redirects to /admin/login when visiting a protected admin page', async () => {
      const res = await middleware(makeRequest('/admin/tutorials'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/admin/login');
    });

    it('redirects to /admin/login when visiting the dashboard', async () => {
      const res = await middleware(makeRequest('/admin/dashboard'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/admin/login');
    });

    it('allows access to /admin/login without redirecting', async () => {
      const res = await middleware(makeRequest('/admin/login'));
      expect(res.status).not.toBe(307);
    });
  });

  describe('authenticated user', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: MOCK_USER } },
      });
    });

    it('allows access to protected admin pages', async () => {
      const res = await middleware(makeRequest('/admin/tutorials'));
      expect(res.status).not.toBe(307);
    });

    it('allows access to the dashboard', async () => {
      const res = await middleware(makeRequest('/admin/dashboard'));
      expect(res.status).not.toBe(307);
    });

    it('redirects away from /admin/login to /admin/dashboard', async () => {
      const res = await middleware(makeRequest('/admin/login'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/admin/dashboard');
    });
  });

  describe('session reading', () => {
    it('uses getSession (not getUser) to avoid rate limiting', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      const { createServerClient } = require('@supabase/ssr');
      const mockClient = (createServerClient as jest.Mock).mock.results[0]?.value;

      await middleware(makeRequest('/admin/tutorials'));

      expect(mockGetSession).toHaveBeenCalled();
      // getUser should not exist on the client — it's not called
      expect(mockClient?.auth?.getUser).toBeUndefined();
    });
  });
});
