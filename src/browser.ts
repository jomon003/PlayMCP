import { chromium, type Browser, type BrowserContext, type Page, type Request } from 'playwright';

export interface LaunchOptions {
  headless?: boolean;
  viewport?: { width: number; height: number };
}

export interface ConsoleEntry {
  type: string;
  text: string;
  location?: string;
}

export interface NetworkEntry {
  method: string;
  url: string;
  resourceType: string;
  status?: number;
  failure?: string;
}

export interface HierarchyOptions {
  selector: string;
  maxDepth: number;
  includeText: boolean;
  includeAttributes: boolean;
}

export type DialogPolicy = { accept: boolean; promptText?: string };

const MAX_BUFFERED_EVENTS = 1000;
const DEFAULT_TIMEOUT = 10_000;
const NAVIGATION_TIMEOUT = 30_000;

/** Thrown for failures the caller can fix; `hint` is surfaced to the model. */
export class BrowserError extends Error {
  constructor(message: string, readonly hint?: string) {
    super(message);
    this.name = 'BrowserError';
  }
}

function log(...args: unknown[]) {
  // stdout carries the MCP protocol, so diagnostics must go to stderr.
  if (process.env.PLAYMCP_DEBUG) console.error('[playmcp]', ...args);
}

function pushBounded<T>(buffer: T[], item: T) {
  buffer.push(item);
  if (buffer.length > MAX_BUFFERED_EVENTS) buffer.shift();
}

export class BrowserController {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private mouse = { x: 0, y: 0 };
  private consoleMessages: ConsoleEntry[] = [];
  private networkRequests: NetworkEntry[] = [];
  private pendingDialog: DialogPolicy | null = null;

  get isOpen(): boolean {
    return !!(this.browser?.isConnected() && this.page && !this.page.isClosed());
  }

  async open(options: LaunchOptions = {}): Promise<void> {
    if (this.isOpen) return;
    await this.close();

    const headless = options.headless ?? process.env.PLAYMCP_HEADLESS === 'true';
    log('launching chromium', { headless });
    try {
      this.browser = await chromium.launch({ headless });
    } catch (error) {
      const message = error instanceof Error ? error.message.split('\n')[0] : String(error);
      throw new BrowserError(`Failed to launch Chromium: ${message}`, 'Install the browser with: npx playwright install chromium');
    }
    this.browser.on('disconnected', () => this.reset());
    this.context = await this.browser.newContext({
      viewport: options.viewport ?? { width: 1280, height: 720 },
    });
    this.context.setDefaultTimeout(Number(process.env.PLAYMCP_TIMEOUT) || DEFAULT_TIMEOUT);
    this.context.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);
    this.attachPage(await this.context.newPage());
  }

  async close(): Promise<void> {
    const browser = this.browser;
    this.reset();
    if (browser?.isConnected()) await browser.close();
  }

  /** Returns the active page, launching a browser with defaults if none is open. */
  async getPage(): Promise<Page> {
    if (!this.isOpen) await this.open();
    return this.page!;
  }

  private reset() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.mouse = { x: 0, y: 0 };
    this.pendingDialog = null;
  }

  private attachPage(page: Page) {
    this.page = page;
    this.consoleMessages = [];
    this.networkRequests = [];
    const requestIndex = new WeakMap<Request, NetworkEntry>();

    page.on('console', (msg) => {
      const { url, lineNumber } = msg.location();
      pushBounded(this.consoleMessages, {
        type: msg.type(),
        text: msg.text(),
        location: url ? `${url}:${lineNumber}` : undefined,
      });
    });
    page.on('pageerror', (error) => {
      pushBounded(this.consoleMessages, { type: 'pageerror', text: error.message });
    });
    page.on('request', (request) => {
      const entry: NetworkEntry = {
        method: request.method(),
        url: request.url(),
        resourceType: request.resourceType(),
      };
      requestIndex.set(request, entry);
      pushBounded(this.networkRequests, entry);
    });
    page.on('response', (response) => {
      const entry = requestIndex.get(response.request());
      if (entry) entry.status = response.status();
    });
    page.on('requestfailed', (request) => {
      const entry = requestIndex.get(request);
      if (entry) entry.failure = request.failure()?.errorText ?? 'failed';
    });
    page.on('dialog', async (dialog) => {
      const policy = this.pendingDialog;
      this.pendingDialog = null;
      log('dialog', dialog.type(), dialog.message(), policy);
      if (policy?.accept) await dialog.accept(policy.promptText);
      else await dialog.dismiss();
    });
  }

  // Navigation

  async navigate(url: string) {
    const page = await this.getPage();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    return { url: page.url(), status: response?.status() };
  }

  async goBack() {
    const page = await this.getPage();
    await page.goBack();
    return page.url();
  }

  async goForward() {
    const page = await this.getPage();
    await page.goForward();
    return page.url();
  }

  async reload() {
    const page = await this.getPage();
    await page.reload();
    return page.url();
  }

  // Interaction

  async click(selector: string, options: { button?: 'left' | 'right' | 'middle'; doubleClick?: boolean } = {}) {
    const locator = (await this.getPage()).locator(selector);
    if (options.doubleClick) await locator.dblclick({ button: options.button });
    else await locator.click({ button: options.button });
  }

  async type(selector: string, text: string, options: { clear?: boolean; submit?: boolean } = {}) {
    const locator = (await this.getPage()).locator(selector);
    if (options.clear ?? true) await locator.fill(text);
    else await locator.pressSequentially(text);
    if (options.submit) await locator.press('Enter');
  }

  async hover(selector: string) {
    await (await this.getPage()).locator(selector).hover();
  }

  async dragAndDrop(sourceSelector: string, targetSelector: string) {
    const page = await this.getPage();
    await page.locator(sourceSelector).dragTo(page.locator(targetSelector));
  }

  async selectOption(selector: string, values: string[]) {
    return (await this.getPage()).locator(selector).selectOption(values);
  }

  async pressKey(key: string) {
    await (await this.getPage()).keyboard.press(key);
  }

  async uploadFiles(selector: string, filePaths: string[]) {
    await (await this.getPage()).locator(selector).setInputFiles(filePaths);
  }

  setDialogPolicy(policy: DialogPolicy) {
    this.pendingDialog = policy;
  }

  // Mouse

  async mouseMove(x: number, y: number) {
    await (await this.getPage()).mouse.move(x, y);
    this.mouse = { x, y };
  }

  async mouseClick(x?: number, y?: number) {
    const page = await this.getPage();
    const target = { x: x ?? this.mouse.x, y: y ?? this.mouse.y };
    await page.mouse.click(target.x, target.y);
    this.mouse = target;
    return target;
  }

  async mouseDrag(startX: number, startY: number, endX: number, endY: number) {
    const { mouse } = await this.getPage();
    await mouse.move(startX, startY);
    await mouse.down();
    await mouse.move(endX, endY, { steps: 10 });
    await mouse.up();
    this.mouse = { x: endX, y: endY };
  }

  async scroll(x: number, y: number, smooth = false) {
    const page = await this.getPage();
    const position = () => page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
    const before = await position();
    await page.evaluate(
      ({ x, y, smooth }) => window.scrollBy({ left: x, top: y, behavior: smooth ? 'smooth' : 'instant' }),
      { x, y, smooth },
    );
    await page.waitForTimeout(smooth ? 500 : 50);
    const after = await position();
    return { before, after, scrolled: { x: after.x - before.x, y: after.y - before.y } };
  }

  // Waiting

  async waitForText(text: string, timeout?: number) {
    await (await this.getPage()).getByText(text).first().waitFor({ state: 'visible', timeout });
  }

  async waitForSelector(selector: string, timeout?: number, state?: 'attached' | 'detached' | 'visible' | 'hidden') {
    await (await this.getPage()).locator(selector).first().waitFor({ state: state ?? 'visible', timeout });
  }

  // Viewport and screenshots

  async resize(width: number, height: number) {
    await (await this.getPage()).setViewportSize({ width, height });
  }

  async screenshot(options: { path?: string; fullPage?: boolean; selector?: string; format?: 'png' | 'jpeg' }) {
    const page = await this.getPage();
    const type = options.format ?? 'png';
    return options.selector
      ? page.locator(options.selector).screenshot({ path: options.path, type })
      : page.screenshot({ path: options.path, fullPage: options.fullPage, type });
  }

  // Page content

  async getPageInfo() {
    const page = await this.getPage();
    return { url: page.url(), title: await page.title() };
  }

  async getPageSource() {
    return (await this.getPage()).content();
  }

  async getPageText() {
    return (await this.getPage()).locator('body').innerText();
  }

  async getElementContent(selector: string) {
    const locator = (await this.getPage()).locator(selector).first();
    return { html: await locator.innerHTML(), text: await locator.innerText() };
  }

  async inspectElement(selector: string) {
    return (await this.getPage()).locator(selector).first().evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        tagName: el.tagName.toLowerCase(),
        attributes: Object.fromEntries(Array.from(el.attributes, (a) => [a.name, a.value])),
        text: (el as HTMLElement).innerText ?? el.textContent,
        boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        visible: rect.width > 0 && rect.height > 0,
      };
    });
  }

  async getScripts() {
    return (await this.getPage()).$$eval('script', (scripts) =>
      scripts
        .map((s) => (s.src ? `// External script: ${s.src}` : s.textContent ?? ''))
        .filter((content) => content.trim().length > 0),
    );
  }

  async getStylesheets() {
    return (await this.getPage()).$$eval('style, link[rel="stylesheet"]', (elements) =>
      elements
        .map((el) => (el instanceof HTMLLinkElement ? `/* External stylesheet: ${el.href} */` : el.textContent ?? ''))
        .filter((content) => content.trim().length > 0),
    );
  }

  async getMetaTags() {
    return (await this.getPage()).$$eval('meta', (metas) =>
      metas.map((m) => ({
        name: m.getAttribute('name') ?? undefined,
        property: m.getAttribute('property') ?? undefined,
        content: m.getAttribute('content') ?? undefined,
        httpEquiv: m.getAttribute('http-equiv') ?? undefined,
        charset: m.getAttribute('charset') ?? undefined,
      })),
    );
  }

  async getLinks() {
    return (await this.getPage()).$$eval('a[href]', (links) =>
      links.map((a) => ({
        href: (a as HTMLAnchorElement).href,
        text: a.textContent?.trim() ?? '',
        title: a.getAttribute('title') ?? undefined,
      })),
    );
  }

  async getImages() {
    return (await this.getPage()).$$eval('img', (images) =>
      images.map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.getAttribute('alt') ?? undefined,
        title: img.getAttribute('title') ?? undefined,
        width: img.naturalWidth || undefined,
        height: img.naturalHeight || undefined,
      })),
    );
  }

  async getForms() {
    return (await this.getPage()).$$eval('form', (forms) =>
      forms.map((form) => ({
        id: form.id || undefined,
        name: form.getAttribute('name') ?? undefined,
        action: form.getAttribute('action') ?? undefined,
        method: form.getAttribute('method') ?? undefined,
        fields: Array.from(form.querySelectorAll('input, select, textarea, button'), (field) => ({
          tag: field.tagName.toLowerCase(),
          name: field.getAttribute('name') ?? undefined,
          id: field.id || undefined,
          type: field.getAttribute('type') ?? undefined,
          value: (field as HTMLInputElement).value || undefined,
          required: (field as HTMLInputElement).required || undefined,
        })),
      })),
    );
  }

  async getElementHierarchy({ selector, maxDepth, includeText, includeAttributes }: HierarchyOptions) {
    return (await this.getPage()).locator(selector).first().evaluate(
      (root, { maxDepth, includeText, includeAttributes }) => {
        type Node = Record<string, unknown> & { children?: Node[] };
        const describe = (el: Element, depth: number): Node => {
          const node: Node = { tag: el.tagName.toLowerCase() };
          if (el.id) node.id = el.id;
          const className = el.getAttribute('class');
          if (className) node.class = className;
          if (includeText) {
            const text = Array.from(el.childNodes)
              .filter((n) => n.nodeType === 3)
              .map((n) => n.textContent?.trim())
              .filter(Boolean)
              .join(' ');
            if (text) node.text = text;
          }
          if (includeAttributes) {
            const attrs = Array.from(el.attributes).filter((a) => a.name !== 'id' && a.name !== 'class');
            if (attrs.length) node.attributes = Object.fromEntries(attrs.map((a) => [a.name, a.value]));
          }
          if (el.children.length) {
            if (maxDepth === -1 || depth < maxDepth) {
              node.children = Array.from(el.children, (child) => describe(child, depth + 1));
            } else {
              node.childCount = el.children.length;
            }
          }
          return node;
        };
        return describe(root, 0);
      },
      { maxDepth, includeText, includeAttributes },
    );
  }

  /**
   * Evaluates `script` in the page. Expressions return their value; statement
   * blocks may use `return`. Top-level `await` works in both forms.
   */
  async evaluate(script: string): Promise<unknown> {
    const page = await this.getPage();
    try {
      return await page.evaluate(`(async () => (${script}\n))()`);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('SyntaxError')) throw error;
      return page.evaluate(`(async () => {${script}\n})()`);
    }
  }

  // Diagnostics

  getConsoleMessages(clear = false) {
    const messages = [...this.consoleMessages];
    if (clear) this.consoleMessages.length = 0;
    return messages;
  }

  getNetworkRequests(clear = false) {
    const requests = [...this.networkRequests];
    if (clear) this.networkRequests.length = 0;
    return requests;
  }
}
