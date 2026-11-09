/**
 * The ways in, as their clients reach the app, through the runtime's own
 * `fetch` (no port is opened):
 *
 * - `assistant`: an MCP client (ChatGPT, Claude, Gemini), posting JSON-RPC
 *   to `/mcp/salon`, naming its conversation as ChatGPT does;
 * - `visitor`: a browser on the site, arriving by its chat (`/web/site`),
 *   then calling and reading through Copilotz's client with its cookie;
 * - `whatsapp`: Meta's webhook, posting a customer's message signed with
 *   the app's secret, and Meta's Graph API, a fake `fetch` keeping what the
 *   app sends back.
 */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { connect, type Runtime, setClientAddress } from "copilotz";
import { site } from "../front.ts";
import { LINKS } from "./kit.ts";

export type Answer = {
  result?: {
    content?: { text: string }[];
    isError?: boolean;
    tools?: { name: string; _meta?: Record<string, unknown> }[];
    contents?: { text: string; mimeType: string }[];
    _meta?: Record<string, unknown>;
  };
  error?: { code: number; message: string };
};

let ids = 0;

/** An assistant: JSON-RPC to the salon's MCP server, in its conversation (`session`), if any. */
export function assistant(runtime: Runtime, session?: string) {
  const rpc = async (method: string, params: Record<string, unknown> = {}): Promise<Answer> => {
    const response = await runtime.fetch(
      new Request(`${LINKS.origin}/mcp/salon`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          "mcp-protocol-version": "2025-11-25",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: ++ids,
          method,
          params: session ? { ...params, _meta: { "openai/session": session } } : params,
        }),
      }),
    );
    return await response.json() as Answer;
  };
  return {
    rpc,
    /** A tool call: what the model reads (`text`), and the whole answer. */
    call: async (name: string, args: Record<string, unknown> = {}) => {
      const answer = await rpc("tools/call", { name, arguments: args });
      return { text: answer.result?.content?.[0]?.text, failed: !!answer.result?.isError, answer };
    },
  };
}

/** A browser on the site: it arrives by the site's chat, and is a client with its cookie. */
export async function visitor(runtime: Runtime, address: string) {
  let cookie = "";
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    if (cookie) request.headers.set("cookie", cookie);
    const response = await runtime.fetch(setClientAddress(request, address));
    const set = response.headers.getSetCookie()[0];
    if (set) cookie = set.split(";")[0];
    return response;
  };
  // As the page does first (`web({ arrive })`): it's let in, and given its cookie.
  const arrived = await fetch(`${LINKS.origin}/web/site`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: LINKS.origin },
    body: "{}",
  });
  assert.equal(arrived.status, 200);
  // Who it is, as the page's host asks before it connects: a contact, named so in what it reads.
  const { actor } = await (await fetch(`${LINKS.origin}/connect`, { method: "POST" })).json();
  const client = await connect(LINKS.origin, { over: "http", fetch, plugins: site });
  return Object.assign(client, { viewer: { kind: "contact", name: `contact:${actor.id}` } });
}

/** The salon's WhatsApp number: Meta's ids, the token, the Meta app's secret; answered at once. */
export const NUMBER = {
  phoneId: "1000200030004",
  token: "a-graph-token",
  secret: "the-meta-app-secret",
  verify: "v",
  quiet: 0,
};

/** Meta's Graph API, offline: it keeps every message the app sends, and answers each with an id. */
export function graph() {
  const sent: { to?: string; type?: string; text?: { body: string } }[] = [];
  const fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const request = new Request(input, init);
    if (!request.url.startsWith("https://graph.facebook.com/")) {
      throw new Error(`Offline: ${request.url}`);
    }
    if (request.method === "POST") sent.push(await request.json());
    return Response.json({ messages: [{ id: `wamid.out-${sent.length}` }], success: true });
  }) as typeof globalThis.fetch;
  return {
    fetch,
    texts: (to: string) =>
      sent.filter((m) => m.to === to && m.type === "text").map((m) => m.text!.body),
  };
}

let delivered = 0;

/** A customer's message on WhatsApp, as Meta delivers it to the number's webhook, signed. */
export async function whatsapp(
  runtime: Runtime,
  from: { phone: string; name: string },
  text: string,
) {
  const body = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [{
      changes: [{
        value: {
          metadata: { phone_number_id: NUMBER.phoneId },
          contacts: [{ wa_id: from.phone, profile: { name: from.name } }],
          messages: [{
            id: `wamid.in-${++delivered}`,
            from: from.phone,
            type: "text",
            text: { body: text },
          }],
        },
      }],
    }],
  });
  const signature = createHmac("sha256", NUMBER.secret).update(body).digest("hex");
  const response = await runtime.fetch(
    new Request(`${LINKS.origin}/hooks/whatsapp/salon`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-hub-signature-256": `sha256=${signature}` },
      body,
    }),
  );
  await runtime.idle();
  return response.status;
}
