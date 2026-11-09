/**
 * What anyone sees of bookings, as text. Each View reads as whoever is
 * looking, so the rules have filtered the bookings before a line is
 * written: staff get every one in their space, a customer only their own.
 */
import type { ViewContext } from "copilotz";
import type { Booking } from "./contract.ts";
import { slotsOf } from "./actions.ts";

export const bookingsView = (_: unknown, ctx: ViewContext<unknown>): string => {
  const order = Object.keys(slotsOf(ctx));
  const found = (ctx.db.collection<Booking>("booking").find({}).value ?? [])
    .toSorted((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
  if (!found.length) return "No bookings.";
  const chats = ctx.db.collection<{ title?: string }>("thread");
  // Whom it's for: the name staff gave, its chat's, or a walk-in.
  const whom = (b: Booking) =>
    b.name ?? (b.thread && chats.findOne({ _id: b.thread }).value?.title) ?? "a walk-in";
  return found.map((b) => `${b.label} (${b.slot}), for ${whom(b)}`).join("\n");
};

export const slotsView = (_: unknown, ctx: ViewContext<unknown>): string => {
  const taken = new Set((ctx.db.collection("slot_taken").find({}).value ?? []).map((t) => t._id));
  const free = Object.entries(slotsOf(ctx)).filter(([slot]) => !taken.has(slot));
  return free.length
    ? `Free: ${free.map(([slot, label]) => `${label} (${slot})`).join(", ")}.`
    : "Every slot is booked.";
};
