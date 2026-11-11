# Changelog

## 3.0.0

A rewrite on the official MCP TypeScript SDK. It fixes several tools that didn't work and removes duplicate tools.

### Breaking changes

| 2.x | 3.0 |
| --- | --- |
| `takeScreenshot` | `screenshot` (now takes `fullPage`, `selector` and `format`) |
| `screenshot` `type` / `selector` parameters | `fullPage` / `selector` |
| `moveMouse` | `mouseMove` |
| `evaluateWithReturn` | `executeJavaScript` |
| `getPageTitle`, `getPageUrl` | `getPageInfo` |
| Entry point `dist/server.js` | `dist/index.js` |
| Node.js 16+ | Node.js 20+ |

`executeJavaScript` now always returns JSON, so string results are quoted (`"Example"` instead of `Example`). The old non-JSON-RPC `{"command": …}` input format is gone.

### Fixed

- **Protocol:** debug logs went to stdout and corrupted the MCP stream. `initialize` returned malformed capabilities and an old protocol version, and `ping` and unknown methods got no reply. Protocol handling now comes from `@modelcontextprotocol/sdk`.
- **`getConsoleMessages` and `getNetworkRequests` always returned `[]`:** they started listening at call time. The page is now monitored from the moment it opens.
- **`executeJavaScript` returned `undefined` for expressions** such as `document.title`. Expressions, statements with `return` and `await` all work now.
- **`getElementHierarchy` ignored `maxDepth: 0`**, and `type` rejected an empty string.
- Errors now include Playwright's actual reason instead of a generic message.
- An action on a missing element now fails after 10 seconds (configurable) instead of 30.
- The server reports its real version instead of `1.0.0`.
- The browser is closed when the client disconnects.

### Added

- `goBack` and `reload` tools (`goBack` was implemented but never exposed), plus `inspectElement`.
- `screenshot` returns the image to the model, and saving to a file is optional.
- The browser launches automatically on first use.
- `click` options `button` and `doubleClick`; `type` options `clear` and `submit`; `waitForSelector` option `state`; a `clear` option for the console and network buffers.
- Input validation with zod schemas, plus tool titles and read-only/destructive annotations.
- Server instructions sent to the client at connection, with workflow tips for the model.
- `AGENTS.md` for coding agents working on the repository.
- `playmcp` bin entry, a test suite (`npm test`) and GitHub Actions CI.
- Environment variables: `PLAYMCP_HEADLESS`, `PLAYMCP_TIMEOUT`, `PLAYMCP_DEBUG`.

## 2.0.0

Added 17 tools based on Microsoft's Playwright MCP.

## 1.x

Initial release with core navigation, interaction and content extraction tools.
