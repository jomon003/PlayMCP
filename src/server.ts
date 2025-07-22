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

const GO_FORWARD_TOOL: Tool = {
  name: "goForward",
  description: "Navigate forward to the next page in history",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const HOVER_TOOL: Tool = {
  name: "hover",
  description: "Hover over an element on the page",
  inputSchema: {
    type: "object",
    properties: {
      selector: { type: "string" }
    },
    required: ["selector"]
  }
};

const DRAG_AND_DROP_TOOL: Tool = {
  name: "dragAndDrop",
  description: "Drag and drop from one element to another",
  inputSchema: {
    type: "object",
    properties: {
      sourceSelector: { type: "string" },
      targetSelector: { type: "string" }
    },
    required: ["sourceSelector", "targetSelector"]
  }
};

const SELECT_OPTION_TOOL: Tool = {
  name: "selectOption",
  description: "Select option(s) in a dropdown or select element",
  inputSchema: {
    type: "object",
    properties: {
      selector: { type: "string" },
      values: { 
        type: "array",
        items: { type: "string" },
        description: "Array of values to select"
      }
    },
    required: ["selector", "values"]
  }
};

const PRESS_KEY_TOOL: Tool = {
  name: "pressKey",
  description: "Press a key on the keyboard",
  inputSchema: {
    type: "object",
    properties: {
      key: { 
        type: "string",
        description: "Key to press (e.g., 'Enter', 'Escape', 'ArrowDown', etc.)"
      }
    },
    required: ["key"]
  }
};

const WAIT_FOR_TEXT_TOOL: Tool = {
  name: "waitForText",
  description: "Wait for specific text to appear on the page",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string" },
      timeout: { 
        type: "number",
        description: "Timeout in milliseconds (default: 30000)"
      }
    },
    required: ["text"]
  }
};

const WAIT_FOR_SELECTOR_TOOL: Tool = {
  name: "waitForSelector",
  description: "Wait for a specific selector to appear on the page",
  inputSchema: {
    type: "object",
    properties: {
      selector: { type: "string" },
      timeout: { 
        type: "number",
        description: "Timeout in milliseconds (default: 30000)"
      }
    },
    required: ["selector"]
  }
};

const RESIZE_TOOL: Tool = {
  name: "resize",
  description: "Resize the browser viewport",
  inputSchema: {
    type: "object",
    properties: {
      width: { type: "number" },
      height: { type: "number" }
    },
    required: ["width", "height"]
  }
};

const HANDLE_DIALOG_TOOL: Tool = {
  name: "handleDialog",
  description: "Handle browser dialogs (alerts, confirms, prompts)",
  inputSchema: {
    type: "object",
    properties: {
      accept: { 
        type: "boolean",
        description: "Whether to accept (true) or dismiss (false) the dialog"
      },
      promptText: { 
        type: "string",
        description: "Text to enter in prompt dialogs (optional)"
      }
    },
    required: ["accept"]
  }
};

const GET_CONSOLE_MESSAGES_TOOL: Tool = {
  name: "getConsoleMessages",
  description: "Get console messages from the browser",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const GET_NETWORK_REQUESTS_TOOL: Tool = {
  name: "getNetworkRequests",
  description: "Get network requests made by the page",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  }
};

const UPLOAD_FILES_TOOL: Tool = {
  name: "uploadFiles",
  description: "Upload files through a file input element",
  inputSchema: {
    type: "object",
    properties: {
      selector: { type: "string" },
      filePaths: {
        type: "array",
        items: { type: "string" },
        description: "Array of absolute file paths to upload"
      }
    },
    required: ["selector", "filePaths"]
  }
};

const EVALUATE_WITH_RETURN_TOOL: Tool = {
  name: "evaluateWithReturn",
  description: "Execute JavaScript code and return the result",
  inputSchema: {
    type: "object",
    properties: {
      script: { 
        type: "string",
        description: "JavaScript code to execute"
      }
    },
    required: ["script"]
  }
};

const TAKE_SCREENSHOT_TOOL: Tool = {
  name: "takeScreenshot",
  description: "Take a screenshot of the page or specific element",
  inputSchema: {
    type: "object",
    properties: {
      path: { type: "string" },
      fullPage: { 
        type: "boolean",
        description: "Whether to capture the full scrollable page"
      },
      element: { 
        type: "string",
        description: "CSS selector for element screenshot"
      }
    },
    required: ["path"]
  }
};

const MOUSE_MOVE_TOOL: Tool = {
  name: "mouseMove",
  description: "Move mouse to specific coordinates",
  inputSchema: {
    type: "object",
    properties: {
      x: { type: "number" },
      y: { type: "number" }
    },
    required: ["x", "y"]
  }
};

const MOUSE_CLICK_TOOL: Tool = {
  name: "mouseClick",
  description: "Click at specific coordinates",
  inputSchema: {
    type: "object",
    properties: {
      x: { type: "number" },
      y: { type: "number" }
    },
    required: ["x", "y"]
  }
};

const MOUSE_DRAG_TOOL: Tool = {
  name: "mouseDrag",
  description: "Drag from one coordinate to another",
  inputSchema: {
    type: "object",
    properties: {
      startX: { type: "number" },
      startY: { type: "number" },
      endX: { type: "number" },
      endY: { type: "number" }
    },
    required: ["startX", "startY", "endX", "endY"]
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
  goForward: GO_FORWARD_TOOL,
  hover: HOVER_TOOL,
  dragAndDrop: DRAG_AND_DROP_TOOL,
  selectOption: SELECT_OPTION_TOOL,
  pressKey: PRESS_KEY_TOOL,
  waitForText: WAIT_FOR_TEXT_TOOL,
  waitForSelector: WAIT_FOR_SELECTOR_TOOL,
  resize: RESIZE_TOOL,
  handleDialog: HANDLE_DIALOG_TOOL,
  getConsoleMessages: GET_CONSOLE_MESSAGES_TOOL,
  getNetworkRequests: GET_NETWORK_REQUESTS_TOOL,
  uploadFiles: UPLOAD_FILES_TOOL,
  evaluateWithReturn: EVALUATE_WITH_RETURN_TOOL,
  takeScreenshot: TAKE_SCREENSHOT_TOOL,
  mouseMove: MOUSE_MOVE_TOOL,
  mouseClick: MOUSE_CLICK_TOOL,
  mouseDrag: MOUSE_DRAG_TOOL,
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

      case 'goForward': {
        await playwrightController.goForward();
        return {
          content: [{ type: "text", text: "Navigated forward successfully" }]
        };
      }

      case 'hover': {
        if (!args.selector) {
          return {
            content: [{ type: "text", text: "Selector is required" }],
            isError: true
          };
        }
        await playwrightController.hover(args.selector as string);
        return {
          content: [{ type: "text", text: "Hover completed successfully" }]
        };
      }

      case 'dragAndDrop': {
        if (!args.sourceSelector || !args.targetSelector) {
          return {
            content: [{ type: "text", text: "Source and target selectors are required" }],
            isError: true
          };
        }
        await playwrightController.dragAndDrop(args.sourceSelector as string, args.targetSelector as string);
        return {
          content: [{ type: "text", text: "Drag and drop completed successfully" }]
        };
      }

      case 'selectOption': {
        if (!args.selector || !args.values) {
          return {
            content: [{ type: "text", text: "Selector and values are required" }],
            isError: true
          };
        }
        await playwrightController.selectOption(args.selector as string, args.values as string[]);
        return {
          content: [{ type: "text", text: "Option selected successfully" }]
        };
      }

      case 'pressKey': {
        if (!args.key) {
          return {
            content: [{ type: "text", text: "Key is required" }],
            isError: true
          };
        }
        await playwrightController.pressKey(args.key as string);
        return {
          content: [{ type: "text", text: "Key pressed successfully" }]
        };
      }

      case 'waitForText': {
        if (!args.text) {
          return {
            content: [{ type: "text", text: "Text is required" }],
            isError: true
          };
        }
        await playwrightController.waitForText(args.text as string, args.timeout as number);
        return {
          content: [{ type: "text", text: "Text found successfully" }]
        };
      }

      case 'waitForSelector': {
        if (!args.selector) {
          return {
            content: [{ type: "text", text: "Selector is required" }],
            isError: true
          };
        }
        await playwrightController.waitForSelector(args.selector as string, args.timeout as number);
        return {
          content: [{ type: "text", text: "Selector found successfully" }]
        };
      }

      case 'resize': {
        if (typeof args.width !== 'number' || typeof args.height !== 'number') {
          return {
            content: [{ type: "text", text: "Width and height are required" }],
            isError: true
          };
        }
        await playwrightController.resize(args.width, args.height);
        return {
          content: [{ type: "text", text: "Browser resized successfully" }]
        };
      }

      case 'handleDialog': {
        if (typeof args.accept !== 'boolean') {
          return {
            content: [{ type: "text", text: "Accept parameter is required" }],
            isError: true
          };
        }
        await playwrightController.handleDialog(args.accept, args.promptText as string);
        return {
          content: [{ type: "text", text: "Dialog handler set successfully" }]
        };
      }

      case 'getConsoleMessages': {
        const messages = await playwrightController.getConsoleMessages();
        return {
          content: [{ type: "text", text: JSON.stringify(messages, null, 2) }]
        };
      }

      case 'getNetworkRequests': {
        const requests = await playwrightController.getNetworkRequests();
        return {
          content: [{ type: "text", text: JSON.stringify(requests, null, 2) }]
        };
      }

      case 'uploadFiles': {
        if (!args.selector || !args.filePaths) {
          return {
            content: [{ type: "text", text: "Selector and file paths are required" }],
            isError: true
          };
        }
        await playwrightController.uploadFiles(args.selector as string, args.filePaths as string[]);
        return {
          content: [{ type: "text", text: "Files uploaded successfully" }]
        };
      }

      case 'evaluateWithReturn': {
        if (!args.script || typeof args.script !== 'string') {
          return {
            content: [{ type: "text", text: "JavaScript script is required" }],
            isError: true
          };
        }
        const result = await playwrightController.evaluateWithReturn(args.script);
        return {
          content: [{ 
            type: "text", 
            text: result !== undefined ? JSON.stringify(result, null, 2) : "null"
          }]
        };
      }

      case 'takeScreenshot': {
        if (!args.path) {
          return {
            content: [{ type: "text", text: "Path is required" }],
            isError: true
          };
        }
        await playwrightController.takeScreenshot(args.path as string, {
          fullPage: args.fullPage as boolean,
          element: args.element as string
        });
        return {
          content: [{ type: "text", text: "Screenshot taken successfully" }]
        };
      }

      case 'mouseMove': {
        if (typeof args.x !== 'number' || typeof args.y !== 'number') {
          return {
            content: [{ type: "text", text: "X and Y coordinates are required" }],
            isError: true
          };
        }
        await playwrightController.mouseMove(args.x, args.y);
        return {
          content: [{ type: "text", text: "Mouse moved successfully" }]
        };
      }

      case 'mouseClick': {
        if (typeof args.x !== 'number' || typeof args.y !== 'number') {
          return {
            content: [{ type: "text", text: "X and Y coordinates are required" }],
            isError: true
          };
        }
        await playwrightController.mouseClick(args.x, args.y);
        return {
          content: [{ type: "text", text: "Mouse clicked successfully" }]
        };
      }

      case 'mouseDrag': {
        if (typeof args.startX !== 'number' || typeof args.startY !== 'number' || 
            typeof args.endX !== 'number' || typeof args.endY !== 'number') {
          return {
            content: [{ type: "text", text: "Start and end coordinates are required" }],
            isError: true
          };
        }
        await playwrightController.mouseDrag(args.startX, args.startY, args.endX, args.endY);
        return {
          content: [{ type: "text", text: "Mouse drag completed successfully" }]
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