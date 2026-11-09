/**
 * Bookings on the web: one component, drawn two ways. Staff get a space's
 * Bookings tab; an assistant (ChatGPT, Claude) draws it as a widget under
 * the tool's answer. It reads through the collections' named queries, as
 * whoever is looking, and its buttons call the same Actions as every other
 * way in.
 */
import type { ReactNode } from "react";
import { definePlugin, type Plugin, type ViewContext } from "copilotz";
import { Button } from "copilotz/web";
import type { Free, Reached } from "./contract.ts";

type Ctx = ViewContext<ReactNode>;

/** The bookings and the free slots, drawn, with a button for each. */
function Salon({ title, bookings, free, book, cancel }: {
  title: string;
  bookings: Reached[];
  free: Free[];
  book: (slot: string) => Promise<unknown>;
  cancel: (booking: string) => Promise<unknown>;
}): ReactNode {
  return (
    <section className="salon" aria-label={title}>
      <h2>{title}</h2>
      {bookings.length
        ? (
          <ul>
            {bookings.map((b) => (
              <li key={b._id}>
                {b.label}, for {b.for}{" "}
                <Button size="sm" variant="ghost" onClick={() => cancel(b._id)}>Cancel</Button>
              </li>
            ))}
          </ul>
        )
        : <p>No bookings yet.</p>}
      <h2>Free</h2>
      {free.length
        ? (
          <ul>
            {free.map(({ slot, label }) => (
              <li key={slot}>
                {label} <Button size="sm" onClick={() => book(slot)}>Book</Button>
              </li>
            ))}
          </ul>
        )
        : <p>Every slot is booked.</p>}
    </section>
  );
}

/**
 * The salon as `ctx`'s viewer sees it, and where a booking made here goes. The View reads in its
 * own body, never in a component: what it reads there is what it's observed by, and what a
 * widget's snapshot answers ahead.
 */
const salon = (ctx: Ctx, title: string, where: { thread?: string } = {}) => (
  <Salon
    title={title}
    bookings={ctx.db.collection("booking").query<Reached[]>("reached", {}).value ?? []}
    free={ctx.db.collection("slot_taken").query<Free[]>("open", {}).value ?? []}
    book={(slot) => ctx.call("booking.make", { slot, ...where })}
    cancel={(booking) => ctx.call("booking.cancel", { booking })}
  />
);

export const bookingsWeb: Plugin = definePlugin({
  name: "bookings-web",
  requires: ["web-shell"],
  views: {
    // A space's Bookings tab: every booking there. Booked here, it's a walk-in, where the page
    // is: the call is in its space.
    "bookings.tab": (_space: unknown, ctx: Ctx) => salon(ctx, "Bookings"),
  },
  resources: {
    spaceTabs: { bookings: { title: "Bookings", view: "bookings.tab", order: 15 } },
  },
});

/** In an assistant: the tool's call is the item, and its chat is the conversation's. */
export const bookingsWidget: Plugin = definePlugin({
  name: "bookings-widget",
  views: {
    "bookings.widget": (_call: unknown, ctx: Ctx) =>
      salon(ctx, "Your bookings", { thread: ctx.hints.thread as string }),
  },
});
