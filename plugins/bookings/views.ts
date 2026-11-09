/**
 * What anyone sees of bookings, as text: the terminal, and the model. Each
 * View reads the named queries as whoever is looking, so the rules have
 * filtered the bookings before a line is written: staff get every one in
 * their space, a customer only their own.
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

/** A tool call, as a View of it gets it: what was asked, and what it returned. */
type Call = { name: string; input: Record<string, unknown>; output: string };

/**
 * What a call returned, or undefined when it failed: a failed call's output
 * is its error's words (`Error: …`), which a model reads as they are.
 */
const result = <T>(call: Call): T | undefined =>
  call.output.startsWith("Error: ") ? undefined : JSON.parse(call.output) as T;

/** What a model reads after each tool: a line, then the bookings it now reaches. */
export const toolViews = {
  "tool:list_slots": (_: Call, ctx: ViewContext<unknown>) => ctx.show("slots", {}),
  "tool:book": (call: Call, ctx: ViewContext<unknown>) => {
    const booked = result<{ label: string }>(call);
    if (!booked) return call.output;
    return `Booked ${booked.label}.\n\nBookings:\n${ctx.show("bookings", {})}`;
  },
  "tool:my_bookings": (_: Call, ctx: ViewContext<unknown>) => ctx.show("bookings", {}),
  "tool:cancel_booking": (call: Call, ctx: ViewContext<unknown>) => {
    const cancelled = result<{ label: string }>(call);
    if (!cancelled) return call.output;
    return `Cancelled ${cancelled.label}.\n\nBookings:\n${ctx.show("bookings", {})}`;
  },
};
