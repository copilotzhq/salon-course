/**
 * Node runs TypeScript itself, but not TSX. This hook turns the front ends'
 * TSX into JavaScript as they load, for what runs them here: the server
 * (an assistant's widget is drawn ahead on the server) and tests. Loaded
 * before anything else: `node --import ./tsx.ts server.ts`.
 */
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { transformSync } from "esbuild";

registerHooks({
  load(url, context, nextLoad) {
    if (!url.endsWith(".tsx")) return nextLoad(url, context);
    return {
      format: "module",
      shortCircuit: true,
      source: transformSync(readFileSync(new URL(url), "utf8"), {
        loader: "tsx",
        jsx: "automatic",
        format: "esm",
      }).code,
    };
  },
});
