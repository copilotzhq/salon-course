/**
 * The salon's own agent, offline: the concierge thinks with a scripted
 * model, and its tools call the same Actions. It acts for whoever it talks
 * with, so it reaches what they reach, calls only what they may, and the
 * record says for whom.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { defineAction, definePlugin, people } from "copilotz";
import type { LlmRequest } from "copilotz/plugins/models";
import { type Message, tool } from "copilotz/plugins/agents";
import { DESK } from "../app.ts";
import { customer, salon, sam, seen, who } from "./kit.ts";

/** What the model read last: the View of the tool it called before. */
const lastRead = (sent: LlmRequest[]) => sent.at(-1)?.messages.at(-1)?.text;

test("the concierge books for a customer, in their chat, and the record says for whom", async () => {
  const { runtime, store, concierge } = await salon({
    moves: [
      { tool: "list_slots" },
      { tool: "book", input: { slot: "wed-15" } },
      "You're booked for Wednesday at 15:00.",
    ],
  });
  try {
    const bia = await customer(runtime, "Bia");
    await runtime.call("chat.send", {
      thread: bia.thread,
      text: "Anything Wednesday afternoon?",
    }, { actor: bia.actor });
    await runtime.idle();

    // What the model read: each tool's View, as Bia's concierge sees it.
    assert.equal(
      concierge.sent[1].messages.at(-1)?.text,
      "Free: Tue 10:00 (tue-10), Tue 11:00 (tue-11), Wed 15:00 (wed-15), Thu 09:00 (thu-09), " +
        "Fri 14:00 (fri-14), Sat 10:00 (sat-10).",
    );
    assert.equal(
      lastRead(concierge.sent),
      "Booked Wed 15:00.\n\nBookings:\nWed 15:00 (wed-15), for Bia",
    );

    // The desk reads the chat: Sam is a member of its space.
    const said = await runtime.query<Message[]>("message.history", { thread: bia.thread }, {
      actor: sam,
    });
    assert.equal(said.at(-1)?.text, "You're booked for Wednesday at 15:00.");
    assert.equal(await seen(runtime, "bookings", sam), "Wed 15:00 (wed-15), for Bia");
    // The record: the concierge made it, for Bia.
    const made = (await store.events(0)).find((e) => e.type === "booking.created")!;
    assert.equal(who(made.actor!), `agent concierge for contact ${bia.actor.id}`);
  } finally {
    await runtime.close();
  }
});

test("whatever the model asks, it reaches only what its customer does", async () => {
  const { runtime, concierge } = await salon({
    moves: [
      { tool: "my_bookings" },
      { tool: "cancel_booking", input: { slot: "tue-10" } },
      "I can't find that booking.",
    ],
  });
  try {
    const bia = await customer(runtime, "Bia");
    const caio = await customer(runtime, "Caio");
    await runtime.call("booking.make", { slot: "tue-10", thread: bia.thread }, {
      actor: bia.actor,
    });
    // Caio's concierge is told to cancel Bia's slot.
    await runtime.call("chat.send", { thread: caio.thread, text: "Cancel tue-10." }, {
      actor: caio.actor,
    });
    await runtime.idle();
    assert.equal(concierge.sent[1].messages.at(-1)?.text, "No bookings.");
    assert.equal(lastRead(concierge.sent), "Error: No booking of yours at tue-10.");
    assert.equal(await seen(runtime, "bookings", bia.actor), "Tue 10:00 (tue-10), for Bia");
  } finally {
    await runtime.close();
  }
});

test("staff ask the same concierge at the desk, and it reaches every booking", async () => {
  const { runtime, store, concierge } = await salon({
    moves: [
      { tool: "book", input: { slot: "thu-09", name: "Rui" } },
      { tool: "my_bookings" },
      "Done.",
    ],
  });
  try {
    const bia = await customer(runtime, "Bia");
    await runtime.call("booking.make", { slot: "tue-10", thread: bia.thread }, {
      actor: bia.actor,
    });
    await runtime.call("chat.send", { in: DESK, text: "Book Thursday 9:00 for Rui." }, {
      actor: sam,
    });
    await runtime.idle();
    // Sam's concierge reaches what Sam does: Bia's booking too.
    assert.equal(
      lastRead(concierge.sent),
      "Tue 10:00 (tue-10), for Bia\nThu 09:00 (thu-09), for Rui",
    );
    const made = (await store.events(0)).filter((e) => e.type === "booking.created").at(-1)!;
    assert.equal(who(made.actor!), "agent concierge for person sam");
  } finally {
    await runtime.close();
  }
});

/** A staff-only Action (`allow: people`), and a tool offered to the concierge that calls it. */
const closing = definePlugin({
  name: "closing",
  actions: {
    "salon.close": defineAction({
      description: "Closes the salon for a day (staff only)",
      input: {
        type: "object",
        properties: { day: { type: "string" } },
        required: ["day"],
        additionalProperties: false,
      },
      allow: people,
      run: (_ctx, input) => ({ closed: input.day }),
    }),
  },
  views: { "tool:close_day": (call: { output: string }) => call.output },
  resources: {
    tools: {
      close_day: tool({
        description: "Closes the salon for a day",
        input: { type: "object", properties: { day: { type: "string" } }, required: ["day"] },
        offer: ["concierge"],
        run: ({ day }, ctx) => ctx.call("salon.close", { day }),
      }),
    },
  },
});

test("the concierge calls only what whoever it works for may", async () => {
  const { runtime, concierge } = await salon({
    plugins: [closing],
    moves: [
      { tool: "close_day", input: { day: "fri" } },
      "I can't close the salon.",
      { tool: "close_day", input: { day: "fri" } },
      "Closed on Friday.",
    ],
  });
  try {
    // In Bia's chat it works for a customer, whom `people` doesn't let in: so neither is it.
    const bia = await customer(runtime, "Bia");
    await runtime.call("chat.send", { thread: bia.thread, text: "Close Friday." }, {
      actor: bia.actor,
    });
    await runtime.idle();
    assert.equal(lastRead(concierge.sent), 'Error: agent concierge may not call "salon.close".');
    // At the desk it works for Sam, staff: the same tool runs.
    await runtime.call("chat.send", { in: DESK, text: "Close Friday." }, { actor: sam });
    await runtime.idle();
    assert.equal(lastRead(concierge.sent), '{"closed":"fri"}');
  } finally {
    await runtime.close();
  }
});
