/**
 * WhatsApp, offline: Meta's webhook posts a customer's message, signed with
 * the app's secret, and what the concierge answers goes back through Meta's
 * Graph API, played by a fake `fetch`. The customer is a contact, in a chat
 * of their own, like every other way in.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { bookedBy, LINKS, salon, sam, seen } from "./kit.ts";
import { graph, NUMBER, whatsapp } from "./ways.ts";

const dora = { phone: "5511988887777", name: "Dora" };

test("a customer books from WhatsApp, and the desk sees it with everyone else's", async () => {
  const meta = graph();
  const { runtime, store } = await salon({
    fetch: meta.fetch,
    settings: { whatsapp: NUMBER },
    moves: [{ tool: "book", input: { slot: "thu-09" } }, "Booked: Thursday at 9:00."],
  });
  try {
    assert.equal(await whatsapp(runtime, dora, "Thursday 9 please"), 200);
    assert.deepEqual(meta.texts(dora.phone), ["Booked: Thursday at 9:00."]);
    assert.equal(await seen(runtime, "bookings", sam), "Thu 09:00 (thu-09), for Dora");
    assert.equal((await bookedBy(store))["Thu 09:00"], "agent concierge for contact Dora");
    // A delivery not signed with the app's secret is refused before anything runs.
    const forged = await runtime.fetch(
      new Request(`${LINKS.origin}/hooks/whatsapp/salon`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hub-signature-256": `sha256=${"0".repeat(64)}`,
        },
        body: "{}",
      }),
    );
    assert.notEqual(forged.status, 200);
  } finally {
    await runtime.close();
  }
});
