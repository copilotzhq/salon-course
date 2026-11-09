/**
 * What can be done with bookings, by a person at the desk or a customer in
 * their chat. Each runs as its caller, so the rules decide what it reaches:
 * a customer books only into their own chat, and cancels only their own.
 */
import { type Context, defineAction, failure, peopleOrContacts } from "copilotz";
import type { Booking, Slots } from "./contract.ts";

/** The salon's times, as the app sets them. */
export const slotsOf = (ctx: Pick<Context, "resources">): Slots =>
  (ctx.resources.slots ?? {}) as Slots;

/** A refusal whose words any caller may read, also from outside the app. */
const said = (code: string, message: string) => failure(code, message, { public: true });

export const makeAction = defineAction({
  description: "Books a free slot, in a customer's chat, or at the desk for a walk-in",
  input: {
    type: "object",
    properties: {
      slot: { type: "string", minLength: 1 },
      thread: { type: "string", minLength: 1 },
      name: { type: "string", minLength: 1, maxLength: 80 },
    },
    required: ["slot"],
    additionalProperties: false,
  },
  allow: peopleOrContacts,
  // One transaction: the look and the writes commit together, or nothing does.
  run: (ctx, input) =>
    ctx.transaction(async (tx) => {
      const label = slotsOf(ctx)[input.slot];
      if (!label) throw said("not_found", `There's no slot "${input.slot}".`);
      // A chat the caller can't reach reads as no chat: the rules filtered it out.
      const chat = input.thread
        ? await tx.db.collection<{ in: string }>("thread").findOne({ _id: input.thread })
        : null;
      if (input.thread && !chat) throw said("not_found", "That chat isn't one of yours.");
      // In a chat, where the chat is. Without one, where the call is (`ctx.in`): a walk-in.
      const where = chat?.in ?? ctx.in;
      if (!where) throw said("invalid", "Book in a chat, or from a space.");
      // Whether a slot is free is the salon's to know, not in anyone's bookings.
      if (await tx.db.collection("slot_taken").findOne({ _id: input.slot })) {
        throw said("taken", `${label} is taken.`);
      }
      const booking = crypto.randomUUID();
      await tx.db.collection("slot_taken").insertOne({ _id: input.slot, booking });
      await tx.db.collection<Omit<Booking, "_id">>("booking").insertOne({
        _id: booking,
        slot: input.slot,
        label,
        in: where,
        ...(chat ? { thread: chat._id } : {}),
        ...(input.name ? { name: input.name } : {}),
      });
      return { booking, slot: input.slot, label };
    }),
});

export const cancelAction = defineAction({
  description: "Cancels a booking, which frees its slot",
  input: {
    type: "object",
    properties: { booking: { type: "string", minLength: 1 } },
    required: ["booking"],
    additionalProperties: false,
  },
  allow: peopleOrContacts,
  run: (ctx, input) =>
    ctx.transaction(async (tx) => {
      // Someone else's booking isn't found: the rules keep it out of the read.
      const found = await tx.db.collection<Booking>("booking").findOne({ _id: input.booking });
      if (!found) throw said("not_found", "No booking of yours by that id.");
      await tx.db.collection("booking").deleteOne({ _id: found._id });
      await tx.db.collection("slot_taken").deleteOne({ _id: found.slot });
      return { cancelled: found._id, slot: found.slot, label: found.label };
    }),
});
