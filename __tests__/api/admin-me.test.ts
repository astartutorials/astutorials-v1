jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET, PATCH } from '@/app/api/admin/me/route';

const mockServer = jest.mocked(createSupabaseServerClient);

const ADMIN_USER = {
  id: 'admin-uuid',
  email: 'admin@astar.ng',
  user_metadata: { full_name: 'Admin Name', phone: '08099999999' },
};

describe('GET /api/admin/me', () => {
  beforeEach(() => mockServer.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockServer.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Unauthorized' },
        }),
      },
    } as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns admin profile with name and phone from user_metadata', async () => {
    mockServer.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: ADMIN_USER }, error: null }),
      },
    } as any);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('admin-uuid');
    expect(data.email).toBe('admin@astar.ng');
    expect(data.name).toBe('Admin Name');
    expect(data.phone).toBe('08099999999');
  });

  it('falls back to email prefix when full_name is not set', async () => {
    mockServer.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { ...ADMIN_USER, user_metadata: {} } },
          error: null,
        }),
      },
    } as any);

    const res = await GET();
    const data = await res.json();
    expect(data.name).toBe('admin');
  });

  it('returns empty string for phone when not set in metadata', async () => {
    mockServer.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { ...ADMIN_USER, user_metadata: { full_name: 'Admin' } } },
          error: null,
        }),
      },
    } as any);

    const res = await GET();
    const data = await res.json();
    expect(data.phone).toBe('');
  });
});

describe('PATCH /api/admin/me', () => {
  beforeEach(() => mockServer.mockReset());

  function makeRequest(body: object) {
    return new Request('http://localhost:3000/api/admin/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('returns 401 when not authenticated', async () => {
    mockServer.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Unauthorized' },
        }),
      },
    } as any);

    const res = await PATCH(makeRequest({ name: 'Test', phone: '080' }));
    expect(res.status).toBe(401);
  });

  it('returns 200 and calls updateUser with full_name and phone', async () => {
    const mockUpdateUser = jest.fn().mockResolvedValue({ error: null });
    mockServer.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: ADMIN_USER }, error: null }),
        updateUser: mockUpdateUser,
      },
    } as any);

    const res = await PATCH(makeRequest({ name: 'New Name', phone: '09011111111' }));
    expect(res.status).toBe(200);
    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { full_name: 'New Name', phone: '09011111111' },
    });
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('returns 500 when updateUser fails', async () => {
    mockServer.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: ADMIN_USER }, error: null }),
        updateUser: jest.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      },
    } as any);

    const res = await PATCH(makeRequest({ name: 'Test', phone: '' }));
    expect(res.status).toBe(500);
  });
});
