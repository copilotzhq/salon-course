/** What can be done with bookings: make one. */
import { type Context, defineAction, failure, people } from "copilotz";

/** The salon's times, by id: the `slots` resource, as the app sets it. */
export type Slots = Record<string, string>;
export const slotsOf = (ctx: Pick<Context, "resources">): Slots =>
  (ctx.resources.slots ?? {}) as Slots;

export const makeAction = defineAction({
  description: "Books a free slot",
  input: {
    type: "object",
    properties: { slot: { type: "string", minLength: 1 } },
    required: ["slot"],
    additionalProperties: false,
  },
  // Who may call it: people.
  allow: people,
  run: async (ctx, input) => {
    const label = slotsOf(ctx)[input.slot];
    if (!label) throw failure("not_found", `There's no slot "${input.slot}".`);
    const bookings = ctx.db.collection("booking");
    if (await bookings.findOne({ slot: input.slot })) throw failure("taken", `${label} is taken.`);
    const { insertedId } = await bookings.insertOne({ slot: input.slot, label });
    return { booking: insertedId, label };
  },
});
