/** What anyone sees of bookings, as text: one line each, in the salon's order. */
import type { ViewContext } from "copilotz";
import { slotsOf } from "./actions.ts";

type Booking = { _id: string; slot: string; label: string };

export const bookingsView = (_: unknown, ctx: ViewContext<unknown>): string => {
  const order = Object.keys(slotsOf(ctx));
  const found = (ctx.db.collection<Booking>("booking").find({}).value ?? [])
    .toSorted((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
  return found.length ? found.map((b) => `${b.label} (${b.slot})`).join("\n") : "No bookings.";
};
