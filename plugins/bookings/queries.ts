/**
 * What anyone sees, read once for every medium: the terminal's text, the
 * web page. Named queries run on the server, as whoever is reading, so the
 * rules have filtered the bookings before anything is drawn, and a browser,
 * which can't read `slot_taken` itself, reads the same thing.
 */
import { peopleOrContacts, type QueryDef } from "copilotz";
import type { Booking, Free, Reached } from "./contract.ts";
import { slotsOf } from "./actions.ts";

/** The bookings the reader reaches, in the salon's order, each with whom it's for. */
export const reached: QueryDef<Booking> = {
  allow: peopleOrContacts,
  run: async (bookings, _params, ctx): Promise<Reached[]> => {
    const order = Object.keys(slotsOf(ctx));
    const found = (await bookings.find({}) as Booking[])
      .toSorted((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
    const chats = ctx.db.collection<{ title?: string }>("thread");
    return await Promise.all(found.map(async (b) => ({
      ...b,
      for: b.name ?? (b.thread && (await chats.findOne({ _id: b.thread }))?.title) ?? "a walk-in",
    })));
  },
};

/** The free slots: which are gone is all a customer learns, never whose they are. */
export const open: QueryDef<{ _id: string }> = {
  allow: peopleOrContacts,
  run: async (taken, _params, ctx): Promise<Free[]> => {
    const gone = new Set((await taken.find({})).map((t) => t._id));
    return Object.entries(slotsOf(ctx))
      .filter(([slot]) => !gone.has(slot))
      .map(([slot, label]) => ({ slot, label }));
  },
};
