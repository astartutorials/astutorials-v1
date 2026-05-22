'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppRole } from '@/lib/rbac';

interface AdminUser {
  name: string;
  email: string;
  phone: string;
  role: AppRole | null;
  orgId: string | null;
}

interface AdminContextValue extends AdminUser {
  loading: boolean;
  refresh: () => void;
}

const AdminContext = createContext<AdminContextValue>({
  name: 'Admin',
  email: '',
  phone: '',
  role: null,
  orgId: null,
  loading: true,
  refresh: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser>({ name: 'Admin', email: '', phone: '', role: null, orgId: null });
  const [loading, setLoading] = useState(true);

  function fetchMe() {
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(d => {
        if (!d.error) {
          setUser({
            name: d.name ?? 'Admin',
            email: d.email ?? '',
            phone: d.phone ?? '',
            role: d.role ?? null,
            orgId: d.orgId ?? null,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchMe(); }, []);

  return (
    <AdminContext.Provider value={{ ...user, loading, refresh: fetchMe }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminUser() {
  return useContext(AdminContext);
}
