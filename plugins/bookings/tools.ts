/**
 * The tools a model is offered. Each is a thin caller of the same Actions a
 * person uses, run as whoever the model works for, in the chat it works in.
 */
import { failure } from "copilotz";
import { tool } from "copilotz/plugins/agents";
import type { Booking } from "./contract.ts";
import { slotsOf } from "./actions.ts";

const slot = { type: "string", description: "A slot's id, as list_slots says it: wed-15" } as const;

export const tools = {
  list_slots: tool({
    description: "Lists the salon's free slots",
    annotations: { readOnly: true },
    run: async (_input, ctx) => {
      const taken = new Set((await ctx.db.collection("slot_taken").find({})).map((t) => t._id));
      return Object.keys(slotsOf(ctx)).filter((id) => !taken.has(id));
    },
  }),
  book: tool({
    description: "Books a free slot, in this chat",
    input: {
      type: "object",
      properties: {
        slot,
        name: { type: "string", description: "Who it's for, when staff book for someone else" },
      },
      required: ["slot"],
      additionalProperties: false,
    },
    // The tool passes its chat; the Action finds the space from it.
    run: ({ slot, name }, ctx) =>
      ctx.call("booking.make", { slot, thread: ctx.thread, ...(name ? { name } : {}) }),
  }),
  my_bookings: tool({
    description: "Lists the bookings you can see from this chat",
    annotations: { readOnly: true },
    run: async (_input, ctx) =>
      (await ctx.db.collection<Booking>("booking").find({})).map((b) => b.label),
  }),
  cancel_booking: tool({
    description: "Cancels a booking, by its slot's id",
    input: {
      type: "object",
      properties: { slot },
      required: ["slot"],
      additionalProperties: false,
    },
    run: async ({ slot }, ctx) => {
      const found = await ctx.db.collection<Booking>("booking").findOne({ slot });
      if (!found) throw failure("not_found", `No booking of yours at ${slot}.`, { public: true });
      return ctx.call("booking.cancel", { booking: found._id });
    },
  }),
};
