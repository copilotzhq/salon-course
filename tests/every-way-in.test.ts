/**
 * The payoff: one salon, every way in at once. Staff at the desk's page,
 * the salon's own concierge in a customer's chat, an assistant over MCP
 * and its widget, a visitor on the site.
 * The same bookings, live on the desk's tab; the record says who made each,
 * and for whom; and the rules hold at every one of them.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Actor } from "copilotz";
import { DESK } from "../app.ts";
import { front } from "../front.ts";
import { bookedBy, customer, type Move, salon, sam, seen, widgets } from "./kit.ts";
import { assistant, visitor } from "./ways.ts";

/** The salon with every way in open, and the concierge on a script. */
const open = (moves: Move[]) => salon({ moves, plugins: front, settings: { widgets } });

/** What an assistant's widget is given to press its buttons with. */
type Widget = { grant: string; hints: { thread: string }; tools: Record<string, string> };

type Tab = ReactElement<{ book(slot: string): Promise<unknown> }>;

test("the same bookings, live, from every way in, and the record says who acted for whom", async () => {
  const { runtime, store } = await open([
    // Bia, in her chat with the concierge.
    { tool: "book", input: { slot: "tue-11" } },
    "Booked: Tuesday at 11:00.",
    // A visitor on the site says hello, then books from the panel.
    "Hello. Pick a time beside the chat.",
  ]);
  try {
    // The desk's Bookings tab, open on Sam's screen the whole time.
    const desk = runtime.observe<ReactNode>("bookings.tab", { _id: DESK }, {
      actor: sam,
      viewer: { name: "sam" },
      hints: { in: DESK },
    });
    await desk.ready;
    const tab = () => (desk.get() as { value: Tab }).value;

    // 1. The web page: Sam presses Book for a walk-in.
    await tab().props.book("tue-10");
    // 2. The salon's own agent, in a customer's chat.
    const bia = await customer(runtime, "Bia");
    await runtime.call("chat.send", { thread: bia.thread, text: "Tuesday 11?" }, {
      actor: bia.actor,
    });
    await runtime.idle();
    // 3. An assistant over MCP, then the Book button in its widget.
    const chatgpt = assistant(runtime, "conversation-1");
    const { answer } = await chatgpt.call("book", { slot: "wed-15" });
    const widget = answer.result!._meta!["copilotz/widget"] as Widget;
    await chatgpt.call(widget.tools["booking.make"], {
      slot: "thu-09",
      thread: widget.hints.thread,
      _grant: widget.grant,
    });
    // 4. A visitor on the site: a hello, then the panel's Book button.
    const site = await visitor(runtime, "198.51.100.7");
    const { thread } = await site.call<{ thread: string }>("chat.send", { text: "Hi" });
    await runtime.idle();
    await site.call("booking.make", { slot: "fri-14", thread });
    await site.close();

    // The desk's tab followed every one, as it happened.
    await runtime.idle();
    const html = renderToStaticMarkup(tab()).replace(/<style[^>]*>[^<]*<\/style>/g, "");
    const lines = [...html.matchAll(/<li>([^<]+?) <button[^>]*>Cancel/g)].map((m) => m[1]);
    assert.deepEqual(lines, [
      "Tue 10:00, for a walk-in",
      "Tue 11:00, for Bia",
      "Wed 15:00, for Assistant",
      "Thu 09:00, for Assistant",
      "Fri 14:00, for Site visitor",
    ]);
    desk.close();

    // The record: who made each, and for whom.
    assert.deepEqual(await bookedBy(store), {
      "Tue 10:00": "person sam",
      "Tue 11:00": "agent concierge for contact Bia",
      "Wed 15:00": "contact by mcp",
      "Thu 09:00": "contact by mcp",
      "Fri 14:00": "contact by web",
    });
  } finally {
    await runtime.close();
  }
});

test("the rules hold at every way in: nobody else can see or cancel Bia's booking", async () => {
  const { runtime, store, concierge } = await open([
    // Caio's concierge is told to cancel it.
    { tool: "cancel_booking", input: { slot: "tue-10" } },
    "I couldn't.",
  ]);
  try {
    const bia = await customer(runtime, "Bia");
    const { booking } = await runtime.call<{ booking: string }>("booking.make", {
      slot: "tue-10",
      thread: bia.thread,
    }, { actor: bia.actor });
    const refused = /No booking of yours/;

    // The web page: a signed-in person who isn't staff.
    const eve: Actor = { kind: "person", id: "eve" };
    await assert.rejects(runtime.call("booking.cancel", { booking }, { actor: eve }), refused);
    assert.equal(await seen(runtime, "bookings", eve), "No bookings.");
    // The salon's own agent, for another customer.
    const caio = await customer(runtime, "Caio");
    await runtime.call("chat.send", { thread: caio.thread, text: "Cancel tue-10." }, {
      actor: caio.actor,
    });
    await runtime.idle();
    assert.equal(concierge.sent[1].messages.at(-1)?.text, "Error: No booking of yours at tue-10.");
    // An assistant over MCP, and its widget's Cancel button with a real grant.
    const chatgpt = assistant(runtime, "conversation-1");
    assert.match((await chatgpt.call("cancel_booking", { slot: "tue-10" })).text!, refused);
    assert.match((await chatgpt.call("book", { slot: "tue-10" })).text!, /Tue 10:00 is taken/);
    const { answer } = await chatgpt.call("my_bookings");
    assert.equal(answer.result!.content![0].text, "No bookings.");
    const widget = answer.result!._meta!["copilotz/widget"] as Widget;
    const pressed = await chatgpt.call(widget.tools["booking.cancel"], {
      booking,
      _grant: widget.grant,
    });
    assert.ok(pressed.failed);
    // A visitor on the site, calling the Action straight from its browser.
    const site = await visitor(runtime, "198.51.100.7");
    await assert.rejects(site.call("booking.cancel", { booking }));
    await site.close();

    // Bia's booking stands, and the record has nothing else.
    assert.equal(await seen(runtime, "bookings", sam), "Tue 10:00 (tue-10), for Bia");
    assert.deepEqual(
      (await store.events(0)).filter((e) => e.type.startsWith("booking.")).map((e) => e.type),
      ["booking.created"],
    );
  } finally {
    await runtime.close();
  }
});
