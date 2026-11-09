/**
 * The salon, kept: in a SQLite file, what was booked outlives the process,
 * the desk is made once, and with the same secret an assistant's
 * conversation is still itself.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { join } from "node:path";
import { createRuntime } from "copilotz";
import { tempDir } from "copilotz/testing";
import { openDesk, plugins } from "../app.ts";
import { openStorage } from "../store.ts";
import { LINKS, sam, seen } from "./kit.ts";
import { assistant } from "./ways.ts";

/** The salon as server.ts opens it, on the store the environment says, with a secret. */
async function start(env: Record<string, string>, secret = LINKS.secret) {
  const { store } = await openStorage(env);
  const runtime = await createRuntime({ store, plugins: plugins({ links: { ...LINKS, secret } }) });
  await openDesk(runtime);
  return runtime;
}

test("kept: the bookings outlive the process, and a conversation stays itself", async () => {
  const env = { SALON_DATA: join(tempDir(), "salon.sqlite") };
  const first = await start(env);
  await first.call("booking.make", { slot: "tue-10", name: "Rui" }, { actor: sam });
  await assistant(first, "conversation-1").call("book", { slot: "wed-15" });
  await first.close();

  // Started again: the same bookings, and the desk wasn't made twice.
  const second = await start(env);
  try {
    assert.equal(
      await seen(second, "bookings", sam),
      "Tue 10:00 (tue-10), for Rui\nWed 15:00 (wed-15), for Assistant",
    );
    const asked = await assistant(second, "conversation-1").call("my_bookings");
    assert.equal(asked.text, "Wed 15:00 (wed-15), for Assistant");
  } finally {
    await second.close();
  }
  // With another secret, the same conversation is someone new.
  const third = await start(env, "another-secret-for-the-salon-0123456789");
  try {
    assert.equal(
      (await assistant(third, "conversation-1").call("my_bookings")).text,
      "No bookings.",
    );
  } finally {
    await third.close();
  }
});
