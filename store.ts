/**
 * Where the salon keeps everything. On this machine, one SQLite file,
 * `.data/salon.sqlite` (or where `SALON_DATA` says). With `DATABASE_URL`,
 * PostgreSQL instead: the same documents and events, and nothing else in
 * the app changes. On PostgreSQL, the process that writes holds the
 * store's lease: a new deploy waits for the old one to hand over.
 */
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Store } from "copilotz";
import { sqliteStore } from "copilotz/stores/sqlite";
import type { ServeOptions } from "copilotz/web/node";

type Env = Record<string, string | undefined>;

/** The store, the lease to hold while writing it (PostgreSQL's), and what to close at the end. */
export async function openStorage(env: Env): Promise<{
  store: Store;
  hold?: ServeOptions["hold"];
  close(): Promise<void>;
}> {
  if (env.DATABASE_URL) {
    // Loaded only when asked for: PostgreSQL's client is more to load than SQLite's.
    const { lease, postgresPool, postgresStore } = await import("copilotz/stores/postgres");
    const pool = await postgresPool({ url: env.DATABASE_URL });
    return {
      store: await postgresStore({ pool }),
      // Each deploy's number (`SALON_REVISION`): a newer one asks the one before to hand over.
      hold: (on) => lease(pool, { revision: Number(env.SALON_REVISION ?? 0), ...on }),
      close: () => pool.close(),
    };
  }
  const path = env.SALON_DATA || ".data/salon.sqlite";
  await mkdir(dirname(path), { recursive: true });
  return { store: await sqliteStore({ path }), close: async () => {} };
}
