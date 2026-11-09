/**
 * The ways in, as their clients reach the app, through the runtime's own
 * `fetch` (no port is opened):
 *
 * - `assistant`: an MCP client (ChatGPT, Claude, Gemini), posting JSON-RPC
 *   to `/mcp/salon`, naming its conversation as ChatGPT does.
 */
import type { Runtime } from "copilotz";
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
