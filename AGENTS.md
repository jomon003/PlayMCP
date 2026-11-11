# AGENTS.md

Guidance for coding agents working on this repository. Usage docs for people live in [README.md](README.md), and the tool reference is in [docs/tools.md](docs/tools.md).

## What this is

An MCP server (stdio) that exposes Playwright browser automation as tools. It's TypeScript and ESM, runs on Node 20+, and is built on `@modelcontextprotocol/sdk` with `zod` schemas.

## Commands

```bash
npm install
npx playwright install chromium   # once; the tests need it
npm run build                     # tsc -> dist/
npm run typecheck
npm test                          # builds, then runs node:test on test/tools.test.js and test/stdio.test.js (~5s, headless)
npm run inspect                   # MCP Inspector against dist/index.js
```

Run `npm test` before finishing any change. CI runs the same command on Node 20, 22 and 24 inside the `mcr.microsoft.com/playwright` image. When you upgrade `playwright`, update that image tag in `.github/workflows/ci.yml` to match.

## Layout

| Path | Role |
| --- | --- |
| `src/index.ts` | Entry point and `bin`. Connects the stdio transport and closes the browser on exit. |
| `src/server.ts` | `createServer()`. Registers every tool (schema, annotations, handler) and the server instructions. |
| `src/browser.ts` | `BrowserController`. Owns the browser, context and page, plus the console, network and dialog state. Contains no MCP code. |
| `test/tools.test.js` | Tests each tool through an in-memory MCP client against `test/fixtures/index.html`. |
| `test/stdio.test.js` | End-to-end test that spawns `dist/index.js` over stdio. |

## Rules

- **Never write to stdout** from server code. stdout carries the MCP protocol. Use `console.error`, or the `log()` helper in `browser.ts`, which is gated by `PLAYMCP_DEBUG`.
- Keep Playwright logic in `BrowserController` and MCP concerns (schemas, result formatting) in `server.ts`.
- Handlers throw on failure. The `tool()` wrapper turns exceptions into `isError` results, so don't catch-and-hide errors in handlers.
- Use locators (`page.locator(...)`), not the deprecated `page.click`/`page.type` style APIs.
- Code passed to `page.evaluate` runs in the browser and can't reference Node variables. Pass them as arguments.

## Adding a tool

1. Add a method to `BrowserController` in `src/browser.ts`.
2. Register the tool in `createServer()` in `src/server.ts` with a `title`, a short `description`, a zod `inputSchema` with `.describe()` on non-obvious fields, and `READ_ONLY` or `ACTION` annotations.
3. Add a test in `test/tools.test.js`. Put any markup it needs in the fixture page.
4. Document it in `docs/tools.md`, add it to the table in `README.md` and note it in `CHANGELOG.md`.

## Releases

Bump `version` in `package.json`, which the server reports at runtime. Add a `CHANGELOG.md` entry, then tag `vX.Y.Z`.
