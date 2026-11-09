/**
 * The ways in, as their clients reach the app, through the runtime's own
 * `fetch` (no port is opened):
 *
 * - `assistant`: an MCP client (ChatGPT, Claude, Gemini), posting JSON-RPC
 *   to `/mcp/salon`, naming its conversation as ChatGPT does;
 * - `visitor`: a browser on the site, arriving by its chat (`/web/site`),
 *   then calling and reading through Copilotz's client with its cookie.
 */
import assert from "node:assert/strict";
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
