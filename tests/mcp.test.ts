/**
 * Assistants outside the app (ChatGPT, Claude, Gemini, any MCP client) over
 * MCP, as they post it. Each conversation is a contact with a chat of its
 * own, so the rules keep it to its own bookings, and its tools answer with
 * their Views.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { definePlugin } from "copilotz";
import { tool } from "copilotz/plugins/agents";
import { salon, sam, seen, who } from "./kit.ts";
import { assistant } from "./ways.ts";

test("an assistant books as a contact, in a chat of its own, and sees only its bookings", async () => {
  const { runtime, store } = await salon();
  try {
    const one = assistant(runtime, "conversation-1");
    const two = assistant(runtime, "conversation-2");
    const listed = (await one.rpc("tools/list")).result!.tools!.map((t) => t.name);
    assert.deepEqual(listed.toSorted(), ["book", "cancel_booking", "list_slots", "my_bookings"]);

    const booked = await one.call("book", { slot: "wed-15" });
    assert.equal(booked.text, "Booked Wed 15:00.\n\nBookings:\nWed 15:00 (wed-15), for Assistant");
    // Another conversation is another contact: it reaches none of the first one's bookings.
    assert.equal((await two.call("my_bookings")).text, "No bookings.");
    const taken = await two.call("book", { slot: "wed-15" });
    assert.ok(taken.failed);
    assert.equal(taken.text, "Wed 15:00 is taken.");
    const cancel = await two.call("cancel_booking", { slot: "wed-15" });
    assert.ok(cancel.failed);
    assert.equal(cancel.text, "No booking of yours at wed-15.");

    // The desk sees it, and the record says a contact made it, not a person.
    assert.equal(await seen(runtime, "bookings", sam), "Wed 15:00 (wed-15), for Assistant");
    const made = (await store.events(0)).find((e) => e.type === "booking.created")!;
    assert.match(who(made.actor!), /^contact c-/);
  } finally {
    await runtime.close();
  }
});

test("every tool the server lists needs its View, or the salon doesn't start", async () => {
  const extra = definePlugin({
    name: "extra",
    resources: {
      tools: { refund: tool({ description: "Refunds a booking", run: () => "Refunded." }) },
      mcp: { salon: { tools: { refund: {} } } },
    },
  });
  // No tool:refund View: what a model outside would read of it. So it doesn't start.
  await assert.rejects(salon({ plugins: [extra] }), /offers "refund" without its tool:refund View/);
});
