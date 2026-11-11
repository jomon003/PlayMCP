# Tool reference

PlayMCP controls a single Chromium browser with one page. Every tool returns text unless noted otherwise. Structured results are pretty-printed JSON.

If a tool fails (for example, an element isn't found, a timeout passes or the arguments are invalid), the result has `isError: true` and the text explains why, so the model can adjust and retry.

## Selectors

Any parameter called `selector` accepts a [Playwright selector](https://playwright.dev/docs/other-locators):

| Kind | Example |
| --- | --- |
| CSS | `#login`, `form button[type=submit]` |
| Text | `text=Sign in` |
| Role | `role=button[name='Submit']` |
| XPath | `xpath=//h1` |

Actions wait for the element to be visible and enabled, up to `PLAYMCP_TIMEOUT` (default 10 seconds). Tools that read one element use the first match.

## Browser

### `openBrowser`

Launches Chromium. This is optional, since any other tool launches a browser with default settings. If a browser is already open, nothing happens. Call `closeBrowser` first to relaunch with different settings.

| Parameter | Type | Default |
| --- | --- | --- |
| `headless` | boolean | `false` (or `PLAYMCP_HEADLESS`) |
| `width` | integer | `1280` |
| `height` | integer | `720` |

### `closeBrowser`

Closes the browser. The next tool call starts a fresh session with no cookies, history or buffered console and network logs.

### `resize`

Sets the viewport size.

| Parameter | Type |
| --- | --- |
| `width` | integer, required |
| `height` | integer, required |

## Navigation

### `navigate`

Loads a URL and waits for `DOMContentLoaded`. Returns `{ "url", "status" }`, where `url` is the final address after redirects.

| Parameter | Type |
| --- | --- |
| `url` | string, required. Include the scheme (`https://…`) |

### `goBack`, `goForward`, `reload`

Move through history or reload the page. Each returns the resulting URL.

## Interaction

### `click`

| Parameter | Type | Default |
| --- | --- | --- |
| `selector` | string, required | |
| `button` | `left` \| `right` \| `middle` | `left` |
| `doubleClick` | boolean | `false` |

### `type`

Enters text into an input, textarea or contenteditable element.

| Parameter | Type | Default |
| --- | --- | --- |
| `selector` | string, required | |
| `text` | string, required. May be empty | |
| `clear` | boolean | `true`. Replaces the content. With `false`, types key by key after the existing content, firing key events. |
| `submit` | boolean | `false`. Presses Enter afterwards. |

### `hover`

Moves the mouse over an element. Takes `selector`.

### `dragAndDrop`

Drags `sourceSelector` onto `targetSelector`.

### `selectOption`

Selects options in a `<select>`, matching by value or by label. Returns `{ "selected": [...] }` with the values that ended up selected.

| Parameter | Type |
| --- | --- |
| `selector` | string, required |
| `values` | string[], required |

### `pressKey`

Presses a key on the focused element. Accepts names like `Enter`, `Escape`, `ArrowDown` and `Tab`, single characters, and combinations like `Control+A` or `Shift+Tab`.

### `uploadFiles`

Sets the files of an `<input type="file">`.

| Parameter | Type |
| --- | --- |
| `selector` | string, required |
| `filePaths` | string[], required. Absolute local paths |

### `handleDialog`

Sets how the **next** `alert`, `confirm`, `prompt` or `beforeunload` dialog is answered. Call it before the action that opens the dialog. Dialogs that arrive without a policy are dismissed, so the page never hangs.

| Parameter | Type |
| --- | --- |
| `accept` | boolean, required |
| `promptText` | string. The answer for a `prompt` dialog |

## Mouse and scrolling

Coordinates are CSS pixels relative to the top-left of the viewport.

| Tool | Parameters | Notes |
| --- | --- | --- |
| `mouseMove` | `x`, `y` | |
| `mouseClick` | `x?`, `y?` | Without coordinates, clicks at the last mouse position. |
| `mouseDrag` | `startX`, `startY`, `endX`, `endY` | Presses, moves in 10 steps and releases. |
| `scroll` | `x`, `y`, `smooth?` | Scrolls by an offset; positive values go right and down. Returns `{ before, after, scrolled }` positions. |

## Waiting

| Tool | Parameters | Waits until |
| --- | --- | --- |
| `waitForText` | `text`, `timeout?` | Text containing `text` is visible. |
| `waitForSelector` | `selector`, `state?`, `timeout?` | The element is `visible` (default), `hidden`, `attached` or `detached`. |

`timeout` is in milliseconds. The default is `PLAYMCP_TIMEOUT`, which is 10000 unless you set it.

## Capture

### `screenshot`

Returns the screenshot as an image the model can see. If you give `path`, it also saves the file there.

| Parameter | Type | Default |
| --- | --- | --- |
| `path` | string | not saved |
| `fullPage` | boolean | `false`. Captures the whole scrollable page instead of the viewport. |
| `selector` | string | Captures only this element. |
| `format` | `png` \| `jpeg` | `png` |

## Page content

| Tool | Parameters | Returns |
| --- | --- | --- |
| `getPageInfo` | | `{ url, title }` |
| `getPageText` | | Visible text of `<body>` |
| `getPageSource` | | Full HTML. It can be very large, so prefer the tools below when you can. |
| `getElementContent` | `selector` | `{ html, text }` of the first match |
| `inspectElement` | `selector` | `{ tagName, attributes, text, boundingBox, visible }` |
| `getElementHierarchy` | `selector?` (`body`), `maxDepth?` (`3`, `-1` = unlimited), `includeText?`, `includeAttributes?` | Nested `{ tag, id, class, text, attributes, children }`. Elements at the depth limit report `childCount` instead of `children`. |
| `getLinks` | | `[{ href, text, title }]`, with `href` resolved to an absolute URL |
| `getImages` | | `[{ src, alt, title, width, height }]`, natural size |
| `getForms` | | `[{ id, name, action, method, fields: [{ tag, name, id, type, value, required }] }]` |
| `getMetaTags` | | `[{ name, property, content, httpEquiv, charset }]` |
| `getScripts` | | Inline script source, and `// External script: <url>` for external ones |
| `getStylesheets` | | Inline CSS, and `/* External stylesheet: <url> */` for linked ones |

## JavaScript and debugging

### `executeJavaScript`

Runs code in the page and returns the result as JSON. Strings come back quoted, and a missing value comes back as `undefined`.

- An expression returns its value: `document.title`
- Statements can use `return`: `const rows = document.querySelectorAll('tr'); return rows.length;`
- `await` works in both forms: `await fetch('/api').then(r => r.status)`

Exceptions thrown by the script come back as tool errors. The return value must be serializable, so return data such as `el.textContent` rather than DOM nodes.

### `getConsoleMessages`

Returns `[{ type, text, location }]` for every console call and uncaught error (`type: "pageerror"`) since the page was opened. It keeps the last 1000 entries. Pass `clear: true` to empty the buffer after reading, so the next call shows only new messages.

### `getNetworkRequests`

Returns `[{ method, url, resourceType, status, failure }]` for every request since the page was opened. It keeps the last 1000 entries. `status` is missing until a response arrives, and `failure` is set when a request fails. Supports `clear: true` like `getConsoleMessages`.
