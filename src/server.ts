#!/usr/bin/env node
import { Server } from './mcp/server.js';
import { Tool } from './mcp/types.js';
import { playwrightController } from './controllers/playwright.js';

const OPEN_BROWSER_TOOL: Tool = {
  name: "openBrowser",
  description: "Launch a new browser instance",
  inputSchema: {
    type: "object",
    properties: {
      headless: { type: "boolean" },
      debug: { type: "boolean" }
    },
    required: []
  }
};

const NAVIGATE_TOOL: Tool = {
  name: "navigate",
  description: "Navigate to a URL",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string" }
    },
    required: ["url"]
  }
};

const TYPE_TOOL: Tool = {
  name: "type",
  description: "Type text into an element",
  inputSchema: {
    type: "object",
    properties: {
      selector: { type: "string" },
      text: { type: "string" }
    },
    required: ["selector", "text"]
  }
};

const CLICK_TOOL: Tool = {
  name: "click",
  description: "Click an element",
  inputSchema: {
    type: "object",
    properties: {
      selector: { type: "string" }
    },
    required: ["selector"]
  }
};

const MOVE_MOUSE_TOOL: Tool = {
  name: "moveMouse",
  description: "Move mouse to coordinates",
  inputSchema: {
    type: "object",
    properties: {
      x: { type: "number" },
      y: { type: "number" }
    },
    required: ["x", "y"]
  }
};

const SCREENSHOT_TOOL: Tool = {
  name: "screenshot",
  description: "Take a screenshot",
  inputSchema: {
    type: "object",
    properties: {
      path: { type: "string" },
      type: { type: "string", enum: ["viewport", "element", "page"] },
      selector: { type: "string" }
    },
    required: ["path"]
  }
};

const GET_PAGE_SOURCE_TOOL: Tool = {
  name: "getPageSource",
  description: "Get the HTML source code of the current page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_PAGE_TEXT_TOOL: Tool = {
  name: "getPageText",
  description: "Get the text content of the current page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_PAGE_TITLE_TOOL: Tool = {
  name: "getPageTitle",
  description: "Get the title of the current page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_PAGE_URL_TOOL: Tool = {
  name: "getPageUrl",
  description: "Get the URL of the current page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_SCRIPTS_TOOL: Tool = {
  name: "getScripts",
  description: "Get all JavaScript code from the current page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_STYLESHEETS_TOOL: Tool = {
  name: "getStylesheets",
  description: "Get all CSS stylesheets from the current page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_META_TAGS_TOOL: Tool = {
  name: "getMetaTags",
  description: "Get all meta tags from the current page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_LINKS_TOOL: Tool = {
  name: "getLinks",
  description: "Get all links from the current page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_IMAGES_TOOL: Tool = {
  name: "getImages",
  description: "Get all images from the current page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_FORMS_TOOL: Tool = {
  name: "getForms",
  description: "Get all forms from the current page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_ELEMENT_CONTENT_TOOL: Tool = {
  name: "getElementContent",
  description: "Get the HTML and text content of a specific element",
  inputSchema: {
    type: "object",
    properties: {
      selector: { type: "string" }
    },
    required: ["selector"]
  }
};

const EXECUTE_JAVASCRIPT_TOOL: Tool = {
  name: "executeJavaScript",
  description: "Execute arbitrary JavaScript code on the current page and return the result",
  inputSchema: {
    type: "object",
    properties: {
      script: { 
        type: "string",
        description: "The JavaScript code to execute on the page. Can be expressions or statements."
      }
    },
    required: ["script"]
  }
};

const SCROLL_TOOL: Tool = {
  name: "scroll",
  description: "Scroll the page by specified amounts with enhanced feedback",
  inputSchema: {
    type: "object",
    properties: {
      x: { 
        type: "number",
        description: "Horizontal scroll amount in pixels (positive = right, negative = left)"
      },
      y: { 
        type: "number", 
        description: "Vertical scroll amount in pixels (positive = down, negative = up)"
      },
      smooth: {
        type: "boolean",
        description: "Whether to use smooth scrolling animation (default: false)"
      }
    },
    required: ["x", "y"]
  }
};

const GET_ELEMENT_HIERARCHY_TOOL: Tool = {
  name: "getElementHierarchy",
  description: "Get the hierarchical structure of page elements with parent-child relationships",
  inputSchema: {
    type: "object",
    properties: {
      selector: {
        type: "string",
        description: "CSS selector for root element (default: 'body')"
      },
      maxDepth: {
        type: "number",
        description: "Maximum depth to traverse (-1 for unlimited, default: 3)"
      },
      includeText: {
        type: "boolean",
        description: "Include text content of elements (default: false)"
      },
      includeAttributes: {
        type: "boolean",
        description: "Include element attributes (default: false)"
      }
    },
    required: []
  }
};

const CLOSE_BROWSER_TOOL: Tool = {
  name: "closeBrowser",
  description: "Close the browser",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const tools = {
  openBrowser: OPEN_BROWSER_TOOL,
  navigate: NAVIGATE_TOOL,
  type: TYPE_TOOL,
  click: CLICK_TOOL,
  moveMouse: MOVE_MOUSE_TOOL,
  scroll: SCROLL_TOOL,
  screenshot: SCREENSHOT_TOOL,
  getPageSource: GET_PAGE_SOURCE_TOOL,
  getPageText: GET_PAGE_TEXT_TOOL,
  getPageTitle: GET_PAGE_TITLE_TOOL,
  getPageUrl: GET_PAGE_URL_TOOL,
  getScripts: GET_SCRIPTS_TOOL,
  getStylesheets: GET_STYLESHEETS_TOOL,
  getMetaTags: GET_META_TAGS_TOOL,
  getLinks: GET_LINKS_TOOL,
  getImages: GET_IMAGES_TOOL,
  getForms: GET_FORMS_TOOL,
  getElementContent: GET_ELEMENT_CONTENT_TOOL,
  getElementHierarchy: GET_ELEMENT_HIERARCHY_TOOL,
  executeJavaScript: EXECUTE_JAVASCRIPT_TOOL,
  closeBrowser: CLOSE_BROWSER_TOOL
};

const server = new Server(
  {
    name: "playmcp-browser",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools,
    },
  }
);

server.setRequestHandler('listTools', async () => ({
  tools: Object.values(tools)
}));

server.setRequestHandler('callTool', async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'openBrowser': {
        await playwrightController.openBrowser(
          args.headless as boolean,
          args.debug as boolean
        );
        return {
          content: [{ type: "text", text: "Browser opened successfully" }]
        };
      }

      case 'navigate': {
        if (!args.url || typeof args.url !== 'string') {
          return {
            content: [{ type: "text", text: "URL is required" }],
            isError: true
          };
        }
        await playwrightController.navigate(args.url);
        return {
          content: [{ type: "text", text: "Navigation successful" }]
        };
      }

      case 'type': {
        if (!args.selector || !args.text) {
          return {
            content: [{ type: "text", text: "Selector and text are required" }],
            isError: true
          };
        }
        await playwrightController.type(args.selector as string, args.text as string);
        return {
          content: [{ type: "text", text: "Text entered successfully" }]
        };
      }

      case 'click': {
        if (!args.selector) {
          return {
            content: [{ type: "text", text: "Selector is required" }],
            isError: true
          };
        }
        await playwrightController.click(args.selector as string);
        return {
          content: [{ type: "text", text: "Click successful" }]
        };
      }

      case 'moveMouse': {
        if (typeof args.x !== 'number' || typeof args.y !== 'number') {
          return {
            content: [{ type: "text", text: "X and Y coordinates are required" }],
            isError: true
          };
        }
        await playwrightController.moveMouse(args.x, args.y);
        return {
          content: [{ type: "text", text: "Mouse moved successfully" }]
        };
      }

      case 'scroll': {
        if (typeof args.x !== 'number' || typeof args.y !== 'number') {
          return {
            content: [{ type: "text", text: "X and Y scroll amounts are required" }],
            isError: true
          };
        }
        const scrollResult = await playwrightController.scroll(
          args.x, 
          args.y, 
          args.smooth as boolean || false
        );
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({
              message: "Page scrolled successfully",
              before: scrollResult.before,
              after: scrollResult.after,
              scrolled: {
                x: scrollResult.after.x - scrollResult.before.x,
                y: scrollResult.after.y - scrollResult.before.y
              }
            }, null, 2)
          }]
        };
      }

      case 'screenshot': {
        if (!args.path) {
          return {
            content: [{ type: "text", text: "Path is required" }],
            isError: true
          };
        }
        await playwrightController.screenshot(args as any);
        return {
          content: [{ type: "text", text: "Screenshot taken successfully" }]
        };
      }

      case 'getPageSource': {
        const source = await playwrightController.getPageSource();
        return {
          content: [{ type: "text", text: source }]
        };
      }

      case 'getPageText': {
        const text = await playwrightController.getPageText();
        return {
          content: [{ type: "text", text }]
        };
      }

      case 'getPageTitle': {
        const title = await playwrightController.getPageTitle();
        return {
          content: [{ type: "text", text: title }]
        };
      }

      case 'getPageUrl': {
        const url = await playwrightController.getPageUrl();
        return {
          content: [{ type: "text", text: url }]
        };
      }

      case 'getScripts': {
        const scripts = await playwrightController.getScripts();
        return {
          content: [{ type: "text", text: scripts.join('\n') }]
        };
      }

      case 'getStylesheets': {
        const stylesheets = await playwrightController.getStylesheets();
        return {
          content: [{ type: "text", text: stylesheets.join('\n') }]
        };
      }      case 'getMetaTags': {
        const metaTags = await playwrightController.getMetaTags();
        return {
          content: [{ type: "text", text: JSON.stringify(metaTags, null, 2) }]
        };
      }

      case 'getLinks': {
        const links = await playwrightController.getLinks();
        return {
          content: [{ type: "text", text: JSON.stringify(links, null, 2) }]
        };
      }

      case 'getImages': {
        const images = await playwrightController.getImages();
        return {
          content: [{ type: "text", text: JSON.stringify(images, null, 2) }]
        };
      }

      case 'getForms': {
        const forms = await playwrightController.getForms();
        return {
          content: [{ type: "text", text: JSON.stringify(forms, null, 2) }]
        };
      }

      case 'getElementContent': {
        if (!args.selector) {
          return {
            content: [{ type: "text", text: "Selector is required" }],
            isError: true
          };
        }
        const content = await playwrightController.getElementContent(args.selector as string);
        return {
          content: [{ type: "text", text: JSON.stringify(content, null, 2) }]
        };
      }

      case 'getElementHierarchy': {
        const hierarchy = await playwrightController.getElementHierarchy(
          args.selector as string || 'body',
          args.maxDepth as number || 3,
          args.includeText as boolean || false,
          args.includeAttributes as boolean || false
        );
        return {
          content: [{ type: "text", text: JSON.stringify(hierarchy, null, 2) }]
        };
      }

      case 'executeJavaScript': {
        if (!args.script || typeof args.script !== 'string') {
          return {
            content: [{ type: "text", text: "JavaScript script is required" }],
            isError: true
          };
        }
        const result = await playwrightController.executeJavaScript(args.script);
        return {
          content: [{ 
            type: "text", 
            text: result !== undefined ? JSON.stringify(result, null, 2) : "Script executed successfully (no return value)"
          }]
        };
      }

      case 'scroll': {
        if (typeof args.x !== 'number' || typeof args.y !== 'number') {
          return {
            content: [{ type: "text", text: "X and Y scroll amounts are required" }],
            isError: true
          };
        }
        await playwrightController.scroll(args.x, args.y);
        return {
          content: [{ type: "text", text: "Page scrolled successfully" }]
        };
      }

      case 'closeBrowser': {
        await playwrightController.closeBrowser();
        return {
          content: [{ type: "text", text: "Browser closed successfully" }]
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true
        };
    }
  } catch (error: any) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}${error.suggestion ? `\nSuggestion: ${error.suggestion}` : ''}`
      }],
      isError: true
    };
  }
});

async function runServer() {
  console.error("Browser Automation MCP Server starting...");
  await server.connect();
}

// Handle process exit
process.on('SIGINT', async () => {
  try {
    await playwrightController.closeBrowser();
  } catch (error) {
    // Ignore errors during cleanup
  }
  process.exit(0);
});

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});