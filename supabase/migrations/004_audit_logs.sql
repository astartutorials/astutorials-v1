-- Audit log for super_admin visibility into important platform changes
create table if not exists audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid not null,
  actor_email   text not null,
  action        text not null,
  target_type   text,
  target_id     text,
  target_label  text,
  org_id        uuid references organisations(id) on delete set null,
  details       jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists audit_logs_actor_id_idx  on audit_logs(actor_id);
create index if not exists audit_logs_created_at_idx on audit_logs(created_at desc);
create index if not exists audit_logs_org_id_idx    on audit_logs(org_id);

-- Block all direct client access; the service role key bypasses RLS entirely.
alter table audit_logs enable row level security;
