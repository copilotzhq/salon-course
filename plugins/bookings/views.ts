/**
 * What anyone sees of bookings, as text. Each View reads the named queries
 * as whoever is looking, so the rules have filtered the bookings before a
 * line is written: staff get every one in their space, a customer only
 * their own.
 */
import type { ViewContext } from "copilotz";
import type { Free, Reached } from "./contract.ts";

/** The bookings the viewer reaches, and the free slots: the named queries, as they read now. */
export const reached = (ctx: ViewContext<unknown>): Reached[] =>
  ctx.db.collection("booking").query<Reached[]>("reached", {}).value ?? [];
export const free = (ctx: ViewContext<unknown>): Free[] =>
  ctx.db.collection("slot_taken").query<Free[]>("open", {}).value ?? [];

export const bookingsView = (_: unknown, ctx: ViewContext<unknown>): string => {
  const bookings = reached(ctx);
  if (!bookings.length) return "No bookings.";
  return bookings.map((b) => `${b.label} (${b.slot}), for ${b.for}`).join("\n");
};

export const slotsView = (_: unknown, ctx: ViewContext<unknown>): string => {
  const open = free(ctx);
  return open.length
    ? `Free: ${open.map((s) => `${s.label} (${s.slot})`).join(", ")}.`
    : "Every slot is booked.";
};
