/**
 * The site's chat (`webLines`), as a visitor's browser reaches it. Its first
 * message makes it a customer, a contact with a chat of its own, answered by
 * the concierge; the page shows that chat beside the panel, which books into
 * it and reads only what's theirs.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DESK } from "../app.ts";
import { bookedBy, customer, salon, sam, seen } from "./kit.ts";
import { visitor } from "./ways.ts";

test("a visitor chats, books from the panel beside the chat, and sees only theirs", async () => {
  const { runtime, store } = await salon({
    moves: [{ tool: "list_slots" }, "Tuesday 11:00 and Thursday 9:00 are free."],
  });
  try {
    const bia = await customer(runtime, "Bia");
    await runtime.call("booking.make", { slot: "tue-10", thread: bia.thread }, {
      actor: bia.actor,
    });

    const site = await visitor(runtime, "198.51.100.7");
    // Its first message: a customer now, in a chat of its own, answered by the concierge.
    const { thread } = await site.call<{ thread: string }>("chat.send", {
      text: "Hi, what's free?",
    });
    await runtime.idle();
    // The panel's Book button: the same Action, into the visitor's own chat.
    await site.call("booking.make", { slot: "tue-11", thread });

    // The page, as the visitor's browser draws it: their chat, beside their bookings.
    const page = site.observe<ReactNode>("web.shell", { path: "/" }, { viewer: site.viewer });
    const shown = await page.ready;
    page.close();
    assert.equal(shown.status, "ready");
    const html = renderToStaticMarkup(shown.status === "ready" ? shown.value : null);
    assert.match(html, /<p class="mine">Hi, what&#x27;s free\?<\/p>/);
    assert.match(html, /Tuesday 11:00 and Thursday 9:00 are free\./);
    assert.match(html, /Tue 11:00, for Site visitor/);
    assert.doesNotMatch(html, /for Bia/, "Bia's booking isn't the visitor's to see");

    // Nor can it write a booking around the Action.
    await assert.rejects(
      site.db.collection("booking").insertOne({ slot: "thu-09", label: "Thu 09:00", in: DESK }),
    );
    await site.close();

    assert.equal(
      await seen(runtime, "bookings", sam),
      "Tue 10:00 (tue-10), for Bia\nTue 11:00 (tue-11), for Site visitor",
    );
    assert.equal((await bookedBy(store))["Tue 11:00"], "contact by web");
  } finally {
    await runtime.close();
  }
});
