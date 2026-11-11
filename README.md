# PlayMCP

[![CI](https://github.com/jomon003/PlayMCP/actions/workflows/ci.yml/badge.svg)](https://github.com/jomon003/PlayMCP/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/jomon003/PlayMCP)](https://github.com/jomon003/PlayMCP/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An [MCP](https://modelcontextprotocol.io) server that lets AI assistants drive a real Chromium browser through [Playwright](https://playwright.dev): navigate, click and type, read page content, run JavaScript, inspect console and network activity, and take screenshots.

## Install

Requires Node.js 20 or later.

```bash
git clone https://github.com/jomon003/PlayMCP.git
cd PlayMCP
npm install
npm run build
npx playwright install chromium
```

## Connect a client

Point your MCP client at the built server, using an absolute path.

**Claude Code**

```bash
claude mcp add playmcp -- node /absolute/path/to/PlayMCP/dist/index.js
```

**Claude Desktop, Cursor and most other clients** (`claude_desktop_config.json`, `.cursor/mcp.json`, …)

```json
{
  "mcpServers": {
    "playmcp": {
      "command": "node",
      "args": ["/absolute/path/to/PlayMCP/dist/index.js"]
    }
  }
}
```

**VS Code** (`.vscode/mcp.json`)

```json
{
  "servers": {
    "playmcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/PlayMCP/dist/index.js"]
    }
  }
}
```

Then ask your assistant something like *"Open example.com and list the links on the page."*

## Tools

The browser starts automatically on first use. Call `openBrowser` first only if you want to change the defaults (for example, headless mode or viewport size).

| Area | Tools |
| --- | --- |
| Browser | `openBrowser`, `closeBrowser`, `resize` |
| Navigation | `navigate`, `goBack`, `goForward`, `reload` |
| Interaction | `click`, `type`, `hover`, `dragAndDrop`, `selectOption`, `pressKey`, `uploadFiles`, `handleDialog` |
| Mouse and scrolling | `mouseMove`, `mouseClick`, `mouseDrag`, `scroll` |
| Waiting | `waitForText`, `waitForSelector` |
| Capture | `screenshot` |
| Page content | `getPageInfo`, `getPageText`, `getPageSource`, `getElementContent`, `inspectElement`, `getElementHierarchy`, `getLinks`, `getImages`, `getForms`, `getMetaTags`, `getScripts`, `getStylesheets` |
| JavaScript and debugging | `executeJavaScript`, `getConsoleMessages`, `getNetworkRequests` |

Parameters and behaviour for each tool are in **[docs/tools.md](docs/tools.md)**.

## Using it from an agent

The server sends these tips to the client when it connects, so most assistants pick them up automatically:

1. **Navigate**, then **read** the page with `getPageText`, `getElementHierarchy` or `getForms`.
2. **Act** with `click`, `type`, `selectOption` or `pressKey`, using CSS (`#id`), text (`text=Sign in`) or role (`role=button[name='Save']`) selectors.
3. **Verify** with `waitForText`, `getPageInfo` or `screenshot`.

Other tips:

- Prefer `getPageText` or `getElementContent` to `getPageSource`, which can be very large.
- Call `handleDialog` before the click that opens an alert or prompt.
- Every tool has a typed input schema and read-only/destructive annotations, so clients can auto-approve the read-only tools.
- Failures come back as readable tool errors (for example, a missing element or a timeout) that the model can recover from, instead of crashing the session.

If you're a coding agent working on this repository, read [AGENTS.md](AGENTS.md).

## Configuration

Set these as environment variables in your client's server config (`"env": { … }`).

| Variable | Default | Effect |
| --- | --- | --- |
| `PLAYMCP_HEADLESS` | `false` | `true` runs the browser without a window. |
| `PLAYMCP_TIMEOUT` | `10000` | Milliseconds to wait for elements before an action fails. |
| `PLAYMCP_DEBUG` | unset | Any value logs browser events to stderr. |

## Security

The server controls a real browser on your machine. `executeJavaScript` runs arbitrary code in the page, `uploadFiles` and `screenshot` read and write local files, and pages may contain text crafted to mislead the model. Only connect it to assistants and sites you trust, and keep tool-approval prompts turned on in your client.

## Development

```bash
npm run build      # compile TypeScript to dist/
npm test           # build, then run the test suite (needs Chromium installed)
npm run inspect    # open the server in the MCP Inspector
```

## Contributing

Issues and pull requests are welcome. Run `npm test` before opening a PR, and see [AGENTS.md](AGENTS.md) for the project layout and how to add a tool. Release notes and the 3.0 migration guide are in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE) © 2025–2026 jomon003
