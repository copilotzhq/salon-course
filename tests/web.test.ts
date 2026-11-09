/**
 * The web page: served as the dev server serves it, and the desk's Bookings
 * tab as staff see it. The tab is an observed View: what it shows follows
 * the data, whichever way a booking came in, and its buttons are the
 * Actions every other way in calls.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { type Actor, definePlugin, type Runtime } from "copilotz";
import { webPage } from "copilotz/web/server";
import { bundle } from "copilotz/web/node";
import { DESK } from "../app.ts";
import { front } from "../front.ts";
import { customer, salon, sam } from "./kit.ts";

/** What the tab's root is given: its buttons are these. */
type Tab = ReactElement<
  { book(slot: string): Promise<unknown>; cancel(id: string): Promise<unknown> }
>;

/** The desk's Bookings tab, observed as `actor`: its HTML now, and its buttons. */
function tab(runtime: Runtime, actor: Actor) {
  const page = runtime.observe<ReactNode>("bookings.tab", { _id: DESK }, {
    actor,
    viewer: { name: actor.id },
    hints: { in: DESK },
  });
  const now = () => {
    const shown = page.get();
    assert.equal(shown.status, "ready");
    return shown.status === "ready" ? shown.value as Tab : undefined!;
  };
  return {
    ready: page.ready,
    // The section alone: the toolkit's buttons bring their styles along.
    html: () => renderToStaticMarkup(now()).replace(/<style[^>]*>[^<]*<\/style>/g, ""),
    buttons: () => now().props,
    close: () => page.close(),
  };
}

test("the page is served, with the salon's code", async () => {
  const page = definePlugin({
    name: "page",
    resources: {
      page: { title: "The salon", code: () => bundle(new URL("../browser.tsx", import.meta.url)) },
    },
  });
  const { runtime } = await salon({ plugins: [webPage, page] });
  try {
    const html = await (await runtime.fetch(new Request("http://127.0.0.1:8080/"))).text();
    assert.match(html, /<title>The salon<\/title>/);
    const src = /<script type="module" src="([^"]+)"/.exec(html)![1];
    const code = await runtime.fetch(new Request(`http://127.0.0.1:8080${src}`));
    assert.equal(code.status, 200);
  } finally {
    await runtime.close();
  }
});

test("staff's Bookings tab: every booking, live, and its buttons are the Actions", async () => {
  const { runtime } = await salon({ plugins: front });
  try {
    const desk = tab(runtime, sam);
    await desk.ready;
    assert.match(desk.html(), /No bookings yet\./);

    // Sam presses Book on Tue 10:00: a walk-in, at the desk.
    await desk.buttons().book("tue-10");
    // A customer books from their chat, elsewhere: the tab follows, without asking again.
    const bia = await customer(runtime, "Bia");
    await runtime.call("booking.make", { slot: "wed-15", thread: bia.thread }, {
      actor: bia.actor,
    });
    await runtime.idle();
    assert.match(desk.html(), /<li>Tue 10:00, for a walk-in <button[^>]*>Cancel<\/button><\/li>/);
    assert.match(desk.html(), /<li>Wed 15:00, for Bia <button[^>]*>Cancel<\/button><\/li>/);

    // Cancel, on the walk-in: Tue 10:00 is free again.
    const walkIn = await runtime.query<{ _id: string; slot: string }[]>("booking.reached", {}, {
      actor: sam,
    });
    await desk.buttons().cancel(walkIn.find((b) => b.slot === "tue-10")!._id);
    await runtime.idle();
    assert.doesNotMatch(desk.html(), /Tue 10:00, for a walk-in/);
    assert.match(desk.html(), /<li>Tue 10:00 <button[^>]*>Book<\/button><\/li>/);
    desk.close();

    // Someone who isn't staff sees none of it.
    const eve = tab(runtime, { kind: "person", id: "eve" });
    await eve.ready;
    assert.match(eve.html(), /No bookings yet\./);
    eve.close();
  } finally {
    await runtime.close();
  }
});
