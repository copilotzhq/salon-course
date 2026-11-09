/**
 * The salon's site, for its visitors: the page at `/`, the salon's own in
 * place of the web shell's (`web.shell`, the View the web host draws).
 * Before a visitor's first message, a field to write it; from it on, their
 * chat with the concierge (`site.chat`) beside the panel they book from. A
 * visitor is a contact: everything here reads as them, so they reach their
 * chat and their bookings, and nothing else.
 */
import { type ReactNode, useState } from "react";
import { definePlugin, type Plugin, type ViewContext } from "copilotz";
import type { Message } from "copilotz/plugins/agents";
import { Button, Input } from "copilotz/web";

type Ctx = ViewContext<ReactNode>;
/** A membership: a chat shared with a contact alone is theirs `on: "thread"`. */
type Member = { member: string; space: string; on?: string };

const STYLE = `
.visit { max-width: 1080px; margin: 0 auto; padding: 24px 16px; display: grid; gap: 16px; }
.visit-chat { display: grid; gap: 32px; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
.visit-talk { display: grid; gap: 8px; align-content: start; }
.visit-talk p { margin: 0; padding: 8px 12px; border-radius: 12px; white-space: pre-wrap;
  background: var(--muted); max-width: 85%; }
.visit-talk p.mine { justify-self: end; background: var(--primary);
  color: var(--primary-foreground); }
.visit form { display: flex; gap: 8px; margin-top: 8px; }
.visit form > :first-child { flex: 1; }
@media (max-width: 720px) { .visit-chat { grid-template-columns: 1fr; } }
`;

const visitView = (_where: unknown, ctx: Ctx): ReactNode => {
  // Staff come in at the desk: a full load, so the page draws their front ends.
  if (ctx.viewer?.kind === "person") {
    return (
      <p className="visit">
        You work here: <a href="/space/desk" target="_self">the desk</a>.
      </p>
    );
  }
  // A visitor's chat, from their first message on: the one shared with them.
  const mine = ctx.db.collection<Member>("member").find({ member: ctx.viewer?.name ?? "" }).value;
  const chat = mine?.find((m) => m.on === "thread")?.space.replace(/^thread:/, "");
  return (
    <main className="visit">
      <style href="salon-site" precedence="copilotz">{STYLE}</style>
      <h1>The salon</h1>
      {chat
        ? (
          <div className="visit-chat">
            {ctx.show("site.chat", { _id: chat })}
            {ctx.show("bookings.panel", { _id: chat })}
          </div>
        )
        : (
          <section className="visit-talk">
            <p>Ask for a time. The concierge answers, and you can book beside the chat.</p>
            <Say send={(text) => ctx.call("chat.send", { text })} />
          </section>
        )}
    </main>
  );
};

/** The visitor's chat: what's been said, the concierge at work, and where they write. */
const chatView = (chat: { _id: string }, ctx: Ctx): ReactNode => {
  const me = ctx.viewer?.name;
  const said = ctx.db.collection<Message>("message")
    .find({ thread: chat._id }, { sort: { at: -1 }, limit: 100 }).value ?? [];
  const working = (ctx.db.collection("live").find({ thread: chat._id }).value ?? []).length > 0;
  return (
    <section className="visit-talk" aria-label="Your chat">
      {said.toReversed().filter((m) => m.text && !m.private).map((m) => (
        <p key={m._id} className={m.from === me ? "mine" : ""}>{m.text}</p>
      ))}
      {working ? <p aria-live="polite">…</p> : null}
      <Say send={(text) => ctx.call("chat.send", { thread: chat._id, text })} />
    </section>
  );
};

/** Where a visitor writes: what they send goes to their chat (the first makes it). */
function Say({ send }: { send: (text: string) => Promise<unknown> }): ReactNode {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        void send(text.trim());
        setText("");
      }}
    >
      <Input
        aria-label="Your message"
        placeholder="Is Friday afternoon free?"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button type="submit">Send</Button>
    </form>
  );
}

export const siteWeb: Plugin = definePlugin({
  name: "salon-site",
  views: { "web.shell": visitView, "site.chat": chatView },
});
