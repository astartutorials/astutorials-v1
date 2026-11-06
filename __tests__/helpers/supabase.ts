import type { SupabaseClient } from '@supabase/supabase-js';
import type { createSupabaseServerClient } from '@/lib/supabase-server';

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Tests stub only the few Supabase methods a route actually calls. These casts
 * say so in one place, instead of `as any` in every test file.
 */
export const asServerClient = (stub: object) => stub as unknown as ServerClient;
export const asSupabaseClient = (stub: object) => stub as unknown as SupabaseClient;

/**
 * A query-builder stub: every builder method returns the chain, and awaiting
 * it at any point yields `{ data, error }`.
 */
export function makeChain(data: unknown, error: unknown = null) {
  const result = { data, error };
  const chain: Record<string, unknown> = {
    then: (onFulfilled: (v: typeof result) => unknown) => Promise.resolve(result).then(onFulfilled),
    catch: (onRejected: (e: unknown) => unknown) => Promise.resolve(result).catch(onRejected),
    finally: (onFinally: () => void) => Promise.resolve(result).finally(onFinally),
  };
  ['select', 'order', 'eq', 'gte', 'neq', 'in', 'limit', 'single', 'maybeSingle',
   'insert', 'update', 'delete', 'upsert'].forEach(m => {
    chain[m] = jest.fn(() => chain);
  });
  return chain;
}
