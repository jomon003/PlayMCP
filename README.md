# PlayMCP Browser Automation Server

A comprehensive MCP (Model Context Protocol) server for browser automation using Playwright. This server provides **38 powerful tools** for web scraping, testing, and automation.

<a href="https://glama.ai/mcp/servers/@jomon003/PlayMCP">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@jomon003/PlayMCP/badge" alt="PlayBrowser Automation Server MCP server" />
</a>

## Features

### 🚀 **Core Browser Automation** (21 tools)
- **Navigation**: `navigate`, `goForward`, `goBack` (via scroll)
- **Interaction**: `click`, `type`, `hover`, `dragAndDrop`, `selectOption`
- **Mouse Control**: `moveMouse`, `mouseMove`, `mouseClick`, `mouseDrag`
- **Keyboard**: `pressKey`
- **Waiting**: `waitForText`, `waitForSelector`
- **Screenshots**: `screenshot`, `takeScreenshot` (enhanced)
- **Page Info**: `getPageSource`, `getPageText`, `getPageTitle`, `getPageUrl`
- **Element Analysis**: `getElementContent`, `getElementHierarchy`
- **Scripts & Styles**: `getScripts`, `getStylesheets`, `getMetaTags`

### 🔍 **Advanced Data Extraction** (7 tools)
- **Links & Images**: `getLinks`, `getImages`
- **Forms**: `getForms`
- **Console Monitoring**: `getConsoleMessages`
- **Network Monitoring**: `getNetworkRequests`
- **JavaScript Execution**: `executeJavaScript`, `evaluateWithReturn`

### 📁 **File Operations** (2 tools)
- **File Upload**: `uploadFiles`
- **Dialog Handling**: `handleDialog`

### ⚙️ **Browser Management** (8 tools)
- **Browser Control**: `openBrowser`, `closeBrowser`
- **Viewport Management**: `resize`
- **Page Manipulation**: `scroll` (enhanced with feedback)
- **Element Hierarchy**: Deep DOM analysis with configurable depth
- **Enhanced Screenshots**: Full page, element-specific, custom paths
- **Mouse Coordinates**: Pixel-perfect mouse control
- **Wait Conditions**: Smart waiting for elements and text

## Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/jomon003/PlayMCP.git
cd PlayMCP

# Install dependencies
npm install

# Build the project
npm run build

# Test the server
npm test
```

### Basic Usage
```javascript
// Start the server
node ./dist/server.js

// Send MCP commands via JSON-RPC
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

## Tool Categories

### 🎯 Navigation & Interaction
- **navigate**: Go to any URL
- **goForward**: Navigate forward in browser history 
- **click**: Click elements with smart selector resolution
- **type**: Type text with realistic keyboard simulation
- **hover**: Hover over elements for tooltips and interactions
- **dragAndDrop**: Drag elements between locations
- **selectOption**: Choose options from dropdowns and multi-selects
- **pressKey**: Send specific keyboard keys (Enter, Escape, etc.)

### ⏱️ Smart Waiting
- **waitForText**: Wait for specific text to appear
- **waitForSelector**: Wait for elements to load
- Built-in timeouts and error handling

### 🖱️ Precise Mouse Control  
- **mouseMove**: Move to exact coordinates
- **mouseClick**: Click at specific pixels
- **mouseDrag**: Drag between coordinate points
- **moveMouse**: Enhanced mouse positioning

### 📊 Data Extraction
- **getElementHierarchy**: Deep DOM structure analysis
- **getConsoleMessages**: Monitor browser console output
- **getNetworkRequests**: Track HTTP requests and responses  
- **getLinks**: Extract all page links with metadata
- **getImages**: Get all images with attributes
- **getForms**: Analyze form structures and fields

### 🎬 Visual & Media
- **screenshot**: Basic screenshot capture
- **takeScreenshot**: Advanced screenshots (full page, elements, custom paths)
- **resize**: Control viewport dimensions

### 📁 File & Dialog Operations
- **uploadFiles**: Handle file input uploads
- **handleDialog**: Manage alerts, confirms, and prompts

### ⚙️ JavaScript Execution
- **executeJavaScript**: Run JavaScript code
- **evaluateWithReturn**: Execute JS with return values

### Core Browser Controls
- **openBrowser** - Launch a new browser instance with optional headless mode
- **navigate** - Navigate to any URL
- **click** - Click elements using CSS selectors
- **type** - Type text into input fields
- **moveMouse** - Move mouse to specific coordinates
- **scroll** - Scroll the page by specified amounts with enhanced feedback and smooth scrolling support
- **screenshot** - Take screenshots of the page, viewport, or specific elements
- **closeBrowser** - Close the browser instance

### Page Content Extraction
- **getPageSource** - Get the complete HTML source code
- **getPageText** - Get the text content (stripped of HTML)
- **getPageTitle** - Get the page title
- **getPageUrl** - Get the current URL
- **getScripts** - Extract all JavaScript code from the page
- **getStylesheets** - Extract all CSS stylesheets
- **getMetaTags** - Get all meta tags with their attributes
- **getLinks** - Get all links with href, text, and title
- **getImages** - Get all images with src, alt, and dimensions
- **getForms** - Get all forms with their fields and attributes
- **getElementContent** - Get HTML and text content of specific elements
- **getElementHierarchy** - Get the hierarchical DOM structure with parent-child relationships

### Advanced Capabilities
- **executeJavaScript** - Execute arbitrary JavaScript code on the page and return results

## Available Tools Reference

| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `openBrowser` | Launch browser instance | `headless?: boolean, debug?: boolean` |
| `navigate` | Navigate to URL | `url: string` |
| `click` | Click element | `selector: string` |
| `type` | Type text into element | `selector: string, text: string` |
| `moveMouse` | Move mouse to coordinates | `x: number, y: number` |
| `scroll` | Scroll page with feedback | `x: number, y: number, smooth?: boolean` |
| `screenshot` | Take screenshot | `path: string, type?: string, selector?: string` |
| `getPageSource` | Get HTML source | None |
| `getPageText` | Get text content | None |
| `getPageTitle` | Get page title | None |
| `getPageUrl` | Get current URL | None |
| `getScripts` | Get JavaScript code | None |
| `getStylesheets` | Get CSS stylesheets | None |
| `getMetaTags` | Get meta tags | None |
| `getLinks` | Get all links | None |
| `getImages` | Get all images | None |
| `getForms` | Get all forms | None |
| `getElementContent` | Get element content | `selector: string` |
| `getElementHierarchy` | Get DOM hierarchy | `selector?: string, maxDepth?: number, includeText?: boolean, includeAttributes?: boolean` |
| `executeJavaScript` | Run JavaScript | `script: string` |
| `closeBrowser` | Close browser | None |

## Installation

### Complete Installation Steps

1. **Prerequisites**
   - Node.js 16+ (download from [nodejs.org](https://nodejs.org/))
   - Git (for cloning the repository)

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd PlayMCP
   npm install
   npm run build
   ```

3. **Install Playwright Browsers**
   ```bash
   npx playwright install
   ```
   This downloads the necessary browser binaries (Chromium, Firefox, Safari).

4. **Verify Installation**
   ```bash
   npm run start
   ```
   You should see "Browser Automation MCP Server starting..." if everything is working.

### Quick Installation
```bash
git clone <repository-url>
cd PlayMCP
npm install && npm run build && npx playwright install
```

## Usage

### As MCP Server

Add to your MCP configuration file:

**Standard MCP Configuration:**
```json
{
  "servers": {
    "playmcp-browser": {
      "type": "stdio",
      "command": "node",
      "args": ["./dist/server.js"],
      "cwd": "/path/to/PlayMCP",
      "description": "Browser automation server using Playwright"
    }
  }
}
```

**Alternative Configuration (works with VS Code GitHub Copilot):**
```json
{
  "servers": {
    "playmcp-browser": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/PlayMCP/dist/server.js"]
    }
  }
}
```

**For Windows users:**
```json
{
  "servers": {
    "playmcp-browser": {
      "type": "stdio",
      "command": "node",
      "args": ["C:\\path\\to\\PlayMCP\\dist\\server.js"]
    }
  }
}
```

### VS Code GitHub Copilot Integration

This MCP server is fully compatible with VS Code GitHub Copilot. After adding the configuration above to your MCP settings, you can use all browser automation tools directly within VS Code.

### Configuration Examples

**Claude Desktop (config.json location):**
- Windows: `%APPDATA%\Claude\config.json`
- macOS: `~/Library/Application Support/Claude/config.json`
- Linux: `~/.config/Claude/config.json`

**VS Code MCP Extension:**
Add to your VS Code settings.json or MCP configuration file.

**Example Full Configuration:**
```json
{
  "mcpServers": {
    "playmcp-browser": {
      "type": "stdio",
      "command": "node",
      "args": ["/Users/username/PlayMCP/dist/server.js"],
      "description": "Browser automation with Playwright"
    }
  }
}
```

### Tool Examples

**Basic Web Scraping:**
```javascript
// Open browser and navigate
await openBrowser({ headless: false, debug: true })
await navigate({ url: "https://example.com" })

// Extract content
const title = await getPageTitle()
const links = await getLinks()
const forms = await getForms()
```

**Form Automation:**
```javascript
// Fill out a form
await click({ selector: "#login-button" })
await type({ selector: "#username", text: "user@example.com" })
await type({ selector: "#password", text: "password123" })
await click({ selector: "#submit" })
```

**Page Interaction:**
```javascript
// Enhanced scrolling with feedback
await scroll({ x: 0, y: 500, smooth: false })
// Returns: { before: {x: 0, y: 0}, after: {x: 0, y: 500}, scrolled: {x: 0, y: 500} }

// Smooth scrolling
await scroll({ x: 0, y: 300, smooth: true })

// Mouse interaction
await moveMouse({ x: 100, y: 200 })
await click({ selector: ".dropdown-menu" })
```

**DOM Structure Analysis:**
```javascript
// Get page hierarchy (3 levels deep)
await getElementHierarchy({ maxDepth: 3 })

// Get detailed hierarchy with text and attributes
await getElementHierarchy({ 
  selector: "#main-content", 
  maxDepth: -1, 
  includeText: true, 
  includeAttributes: true 
})

// Get basic structure of a specific section
await getElementHierarchy({ selector: ".sidebar", maxDepth: 2 })
```

**Advanced JavaScript Execution:**
```javascript
// Run custom JavaScript
await executeJavaScript({ 
  script: "document.querySelectorAll('h1').length" 
})

// Modify page content
await executeJavaScript({ 
  script: "document.body.style.backgroundColor = 'lightblue'" 
})

// Extract complex data
await executeJavaScript({ 
  script: `
    Array.from(document.querySelectorAll('article')).map(article => ({
      title: article.querySelector('h2')?.textContent,
      summary: article.querySelector('p')?.textContent
    }))
  `
})
```

**Screenshot and Documentation:**
```javascript
// Take screenshots
await screenshot({ path: "./full-page.png", type: "page" })
await screenshot({ path: "./element.png", type: "element", selector: "#main-content" })
```

## Quick Start

1. **Install and setup:**
   ```bash
   git clone <repo-url> && cd PlayMCP
   npm install && npm run build && npx playwright install
   ```

2. **Add to your MCP client configuration**

3. **Start automating:**
   ```javascript
   await openBrowser({ debug: true })
   await navigate({ url: "https://news.ycombinator.com" })
   const links = await getLinks()
   console.log(`Found ${links.length} links`)
   
   // Analyze page structure
   const hierarchy = await getElementHierarchy({ maxDepth: 2 })
   console.log('Page structure:', hierarchy)
   ```

## Development

- **src/server.ts** - Main MCP server implementation
- **src/controllers/playwright.ts** - Playwright browser controller
- **src/mcp/** - MCP protocol implementation
- **src/types/** - TypeScript type definitions

## Requirements

### System Requirements
- **Node.js 16+** (LTS version recommended)
- **Operating System:** Windows, macOS, or Linux
- **Memory:** At least 2GB RAM (4GB+ recommended for heavy usage)
- **Disk Space:** ~500MB for browser binaries and dependencies

### Dependencies
- **Playwright:** Handles browser automation (automatically installed)
- **TypeScript:** For compilation (dev dependency)
- **Browser Binaries:** Downloaded via `npx playwright install`

## Troubleshooting

### Common Issues

1. **"Browser not initialized" error**
   - Make sure to call `openBrowser` before other browser operations
   - Check if Node.js version is 16 or higher

2. **Playwright installation fails**
   ```bash
   # Try manual browser installation
   npx playwright install chromium
   # Or install all browsers
   npx playwright install
   ```

3. **Permission errors on Linux/macOS**
   ```bash
   # Make sure the script is executable
   chmod +x dist/server.js
   ```

4. **Path issues in MCP configuration**
   - Use absolute paths in the configuration
   - On Windows, use double backslashes: `C:\\path\\to\\PlayMCP\\dist\\server.js`
   - Verify the path exists: `node /path/to/PlayMCP/dist/server.js`

5. **Browser crashes or timeouts**
   - Try running with `headless: false` for debugging
   - Increase system memory if running multiple browser instances
   - Check if antivirus software is blocking browser processes

### Testing Your Installation

```bash
# Test the server directly
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node ./dist/server.js
```

You should see a JSON response listing all available tools.

## License

MIT License