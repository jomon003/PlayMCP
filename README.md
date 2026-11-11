# PlayMCP

An [MCP](https://modelcontextprotocol.io) server that lets AI assistants drive a real Chromium browser through [Playwright](https://playwright.dev): navigate, click and type, read page content, run JavaScript, inspect console and network activity, and take screenshots.

<a href="https://glama.ai/mcp/servers/@jomon003/PlayMCP">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@jomon003/PlayMCP/badge" alt="PlayMCP MCP server" />
</a>

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

## Configuration

Set these as environment variables in your client's server config (`"env": { … }`).

| Variable | Default | Effect |
| --- | --- | --- |
| `PLAYMCP_HEADLESS` | `false` | `true` runs the browser without a window. |
| `PLAYMCP_TIMEOUT` | `10000` | Milliseconds to wait for elements before an action fails. |
| `PLAYMCP_NO_SANDBOX` | `false` | `true` launches Chromium with `--no-sandbox`. Only use this when running as root in a container. |
| `PLAYMCP_DEBUG` | unset | Any value logs browser events to stderr. |

## Security

The server controls a real browser on your machine. `executeJavaScript` runs arbitrary code in the page, `uploadFiles` and `screenshot` read and write local files, and pages may contain text crafted to mislead the model. Only connect it to assistants and sites you trust, and keep tool-approval prompts turned on in your client.

## Development

```bash
npm run build      # compile TypeScript to dist/
npm test           # build, then run the test suite (needs Chromium installed)
npm run inspect    # open the server in the MCP Inspector
```

See [CHANGELOG.md](CHANGELOG.md) for release notes and the 3.0 migration guide.

## License

[MIT](LICENSE)
