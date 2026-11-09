/**
 * Assistants outside the app (ChatGPT, Claude, Gemini, any MCP client) over
 * MCP, as they post it. Each conversation is a contact with a chat of its
 * own, so the rules keep it to its own bookings, and its tools answer with
 * their Views. A widget, drawn by the same View as the web's, comes with
 * what it reads already answered, as that contact.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { definePlugin } from "copilotz";
import { tool } from "copilotz/plugins/agents";
import { salon, sam, seen, who, widgets } from "./kit.ts";
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

/** What a widget is given: its View, the call, its reads (answered), and its grant. */
type Widget = {
  view: string;
  hints: { thread: string };
  viewer: { kind: string };
  reads: [string, { value: unknown }][];
  grant: string;
  tools: Record<string, string>;
};

test("the widget: its template, and what it reads, answered as the conversation's contact", async () => {
  const { runtime } = await salon({ settings: { widgets } });
  try {
    const one = assistant(runtime, "conversation-1");
    await assistant(runtime, "conversation-2").call("book", { slot: "tue-10" });
    const { answer } = await one.call("book", { slot: "wed-15" });
    const widget = answer.result!._meta!["copilotz/widget"] as Widget;
    assert.equal(widget.view, "bookings.widget");
    assert.equal(widget.viewer.kind, "contact");
    // What the View reads, answered already: only this conversation's booking.
    const value = (query: string) => widget.reads.find(([key]) => key.includes(query))![1].value;
    assert.deepEqual((value("reached") as { label: string }[]).map((b) => b.label), ["Wed 15:00"]);
    assert.deepEqual(
      (value("open") as { slot: string }[]).map((s) => s.slot),
      ["tue-11", "thu-09", "fri-14", "sat-10"],
    );
    // The model reads only the content: no grant in it.
    assert.ok(!JSON.stringify(answer.result!.content).includes(widget.grant));

    // The template the assistant draws it in: one page, the widget's code bundled in.
    const tools = (await one.rpc("tools/list")).result!.tools!;
    const ui = tools.find((t) => t.name === "book")!._meta!.ui as { resourceUri: string };
    const [page] = (await one.rpc("resources/read", { uri: ui.resourceUri })).result!.contents!;
    assert.equal(page.mimeType, "text/html;profile=mcp-app");
    assert.match(page.text, /<div id="app"><\/div>/);

    // Its Book button: the same Action, as the contact, with the widget's grant.
    const pressed = await one.call(widget.tools["booking.make"], {
      slot: "thu-09",
      thread: widget.hints.thread,
      _grant: widget.grant,
    });
    assert.equal(pressed.text, "Done in the widget.");
    assert.equal(
      (await one.call("my_bookings")).text,
      "Wed 15:00 (wed-15), for Assistant\nThu 09:00 (thu-09), for Assistant",
    );
    // Without the grant, the model can't press it.
    const forged = await one.call(widget.tools["booking.make"], {
      slot: "tue-11",
      thread: widget.hints.thread,
    });
    assert.ok(forged.failed);
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
