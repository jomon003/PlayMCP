import { chromium } from 'playwright';
import { BrowserError, BrowserState, ScreenshotOptions, ElementInfo } from '../types/index.js';

class PlaywrightController {
  private state: BrowserState = {
    browser: null,
    context: null,
    page: null,
    debug: false
  };

  private currentMousePosition = { x: 0, y: 0 };

  private log(...args: any[]) {
    if (this.state.debug) {
      console.log(JSON.stringify({
        type: "debug",
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
      }));
    }
  }

  async openBrowser(headless: boolean = false, debug: boolean = false): Promise<void> {
    try {
      this.state.debug = debug;
      this.log('Attempting to launch browser');
      
      if (this.state.browser?.isConnected()) {
        this.log('Browser already running');
        return;
      }

      this.log('Launching new browser instance', { headless });
      this.state.browser = await chromium.launch({ 
        headless,
        args: ['--no-sandbox']
      });
      
      this.log('Creating browser context');
      this.state.context = await this.state.browser.newContext({
        viewport: { width: 1280, height: 720 }
      });
      
      this.log('Creating new page');
      this.state.page = await this.state.context.newPage();
      
      this.log('Browser successfully launched');
    } catch (error: any) {
      console.error('Browser launch error:', error);
      throw new BrowserError(
        'Failed to launch browser', 
        `Technical details: ${error?.message || 'Unknown error'}`
      );
    }
  }

  async closeBrowser(): Promise<void> {
    try {
      this.log('Closing browser');
      await this.state.page?.close();
      await this.state.context?.close();
      await this.state.browser?.close();
      this.state = { browser: null, context: null, page: null, debug: false };
      this.log('Browser closed');
    } catch (error: any) {
      console.error('Browser close error:', error);
      throw new BrowserError('Failed to close browser', 'The browser might have already been closed');
    }
  }

  async navigate(url: string): Promise<void> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Navigating to', url);
      await this.state.page?.goto(url);
      this.log('Navigation complete');
    } catch (error: any) {
      console.error('Navigation error:', error);
      throw new BrowserError('Failed to navigate', 'Check if the URL is valid and accessible');
    }
  }

  async goBack(): Promise<void> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Going back');
      await this.state.page?.goBack();
      this.log('Navigation back complete');
    } catch (error: any) {
      console.error('Go back error:', error);
      throw new BrowserError('Failed to go back', 'Check if there is a previous page in history');
    }
  }

  async refresh(): Promise<void> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Refreshing page');
      await this.state.page?.reload();
      this.log('Page refresh complete');
    } catch (error: any) {
      console.error('Refresh error:', error);
      throw new BrowserError('Failed to refresh page', 'Check if the page is still accessible');
    }
  }

  async click(selector?: string): Promise<void> {
    try {
      if (!this.isInitialized() || !this.state.page) {
        throw new Error('Browser not initialized');
      }
      if (selector) {
        this.log('Clicking element', selector);
        await this.state.page.click(selector);
      } else {
        this.log('Clicking at position', this.currentMousePosition);
        await this.state.page.mouse.click(this.currentMousePosition.x, this.currentMousePosition.y);
      }
      this.log('Click complete');
    } catch (error: any) {
      console.error('Click error:', error);
      throw new BrowserError(
        'Failed to click',
        selector ? 'Check if the element exists and is visible' : 'Check if mouse position is valid'
      );
    }
  }

  async type(selector: string, text: string): Promise<void> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Typing into element', { selector, text });
      await this.state.page?.type(selector, text);
      this.log('Type complete');
    } catch (error: any) {
      console.error('Type error:', error);
      throw new BrowserError('Failed to type text', 'Check if the input element exists and is editable');
    }
  }

  async moveMouse(x: number, y: number): Promise<void> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Moving mouse to', { x, y });
      await this.state.page?.mouse.move(x, y);
      this.currentMousePosition = { x, y };
      this.log('Mouse move complete');
    } catch (error: any) {
      console.error('Mouse move error:', error);
      throw new BrowserError('Failed to move mouse', 'Check if coordinates are within viewport');
    }
  }

  async scroll(x: number, y: number): Promise<void> {
    try {
      if (!this.isInitialized() || !this.state.page) {
        throw new Error('Browser not initialized');
      }
      this.log('Scrolling', { x, y });
      await this.state.page.evaluate(`window.scrollBy(${x}, ${y})`);
      this.log('Scroll complete');
    } catch (error: any) {
      console.error('Scroll error:', error);
      throw new BrowserError('Failed to scroll', 'Check if scroll values are valid');
    }
  }

  async screenshot(options: ScreenshotOptions): Promise<void> {
    try {
      if (!this.isInitialized() || !this.state.page) {
        throw new Error('Browser not initialized');
      }
      this.log('Taking screenshot', options);
      
      if (options.type === 'element' && options.selector) {
        const element = await this.state.page.$(options.selector);
        if (!element) {
          throw new Error('Element not found');
        }
        await element.screenshot({ path: options.path });
      } else if (options.type === 'viewport') {
        await this.state.page.screenshot({ path: options.path });
      } else {
        await this.state.page.screenshot({ path: options.path, fullPage: true });
      }
      
      this.log('Screenshot saved to', options.path);
    } catch (error: any) {
      console.error('Screenshot error:', error);
      throw new BrowserError(
        'Failed to take screenshot',
        'Check if the path is writable and element exists (if capturing element)'
      );
    }
  }

  async inspectElement(selector: string): Promise<ElementInfo> {
    try {
      if (!this.isInitialized() || !this.state.page) {
        throw new Error('Browser not initialized');
      }
      this.log('Inspecting element', selector);
      const info = await this.state.page.$eval(selector, (el: Element) => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        attributes: Array.from(el.attributes).map(attr => ({
          name: attr.name,
          value: attr.value
        })),
        innerText: el.textContent
      }));
      this.log('Element inspection complete');
      return info;
    } catch (error: any) {
      console.error('Inspect element error:', error);
      throw new BrowserError('Failed to inspect element', 'Check if the element exists');
    }
  }

  async getPageSource(): Promise<string> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting page source');
      const content = await this.state.page?.content();
      this.log('Page source retrieved');
      return content || '';
    } catch (error: any) {
      console.error('Get page source error:', error);
      throw new BrowserError('Failed to get page source', 'Check if the page is loaded');
    }
  }

  async getPageText(): Promise<string> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting page text content');
      const text = await this.state.page?.innerText('body');
      this.log('Page text retrieved');
      return text || '';
    } catch (error: any) {
      console.error('Get page text error:', error);
      throw new BrowserError('Failed to get page text', 'Check if the page is loaded');
    }
  }

  async getPageTitle(): Promise<string> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting page title');
      const title = await this.state.page?.title();
      this.log('Page title retrieved:', title);
      return title || '';
    } catch (error: any) {
      console.error('Get page title error:', error);
      throw new BrowserError('Failed to get page title', 'Check if the page is loaded');
    }
  }

  async getPageUrl(): Promise<string> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting page URL');
      const url = this.state.page?.url();
      this.log('Page URL retrieved:', url);
      return url || '';
    } catch (error: any) {
      console.error('Get page URL error:', error);
      throw new BrowserError('Failed to get page URL', 'Check if the page is loaded');
    }
  }

  async getScripts(): Promise<string[]> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting page scripts');
      const scripts = await this.state.page?.evaluate(() => {
        const scriptElements = Array.from(document.querySelectorAll('script'));
        return scriptElements.map(script => {
          if (script.src) {
            return `// External script: ${script.src}`;
          }
          return script.textContent || script.innerHTML;
        }).filter(content => content.trim().length > 0);
      });
      this.log('Scripts retrieved:', scripts?.length);
      return scripts || [];
    } catch (error: any) {
      console.error('Get scripts error:', error);
      throw new BrowserError('Failed to get scripts', 'Check if the page is loaded');
    }
  }

  async getStylesheets(): Promise<string[]> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting page stylesheets');
      const stylesheets = await this.state.page?.evaluate(() => {
        const styleElements = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
        return styleElements.map(element => {
          if (element.tagName === 'LINK') {
            const link = element as HTMLLinkElement;
            return `/* External stylesheet: ${link.href} */`;
          }
          return element.textContent || element.innerHTML;
        }).filter(content => content.trim().length > 0);
      });
      this.log('Stylesheets retrieved:', stylesheets?.length);
      return stylesheets || [];
    } catch (error: any) {
      console.error('Get stylesheets error:', error);
      throw new BrowserError('Failed to get stylesheets', 'Check if the page is loaded');
    }
  }

  async getMetaTags(): Promise<Array<{name?: string, property?: string, content?: string, httpEquiv?: string}>> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting meta tags');
      const metaTags = await this.state.page?.evaluate(() => {
        const metaElements = Array.from(document.querySelectorAll('meta'));
        return metaElements.map(meta => ({
          name: meta.getAttribute('name') || undefined,
          property: meta.getAttribute('property') || undefined,
          content: meta.getAttribute('content') || undefined,
          httpEquiv: meta.getAttribute('http-equiv') || undefined
        }));
      });
      this.log('Meta tags retrieved:', metaTags?.length);
      return metaTags || [];
    } catch (error: any) {
      console.error('Get meta tags error:', error);
      throw new BrowserError('Failed to get meta tags', 'Check if the page is loaded');
    }
  }

  async getLinks(): Promise<Array<{href: string, text: string, title?: string}>> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting page links');
      const links = await this.state.page?.evaluate(() => {
        const linkElements = Array.from(document.querySelectorAll('a[href]'));
        return linkElements.map(link => ({
          href: (link as HTMLAnchorElement).href,
          text: link.textContent?.trim() || '',
          title: link.getAttribute('title') || undefined
        }));
      });
      this.log('Links retrieved:', links?.length);
      return links || [];
    } catch (error: any) {
      console.error('Get links error:', error);
      throw new BrowserError('Failed to get links', 'Check if the page is loaded');
    }
  }

  async getImages(): Promise<Array<{src: string, alt?: string, title?: string, width?: number, height?: number}>> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting page images');
      const images = await this.state.page?.evaluate(() => {
        const imgElements = Array.from(document.querySelectorAll('img'));
        return imgElements.map(img => ({
          src: (img as HTMLImageElement).src,
          alt: img.getAttribute('alt') || undefined,
          title: img.getAttribute('title') || undefined,
          width: (img as HTMLImageElement).naturalWidth || undefined,
          height: (img as HTMLImageElement).naturalHeight || undefined
        }));
      });
      this.log('Images retrieved:', images?.length);
      return images || [];
    } catch (error: any) {
      console.error('Get images error:', error);
      throw new BrowserError('Failed to get images', 'Check if the page is loaded');
    }
  }

  async getForms(): Promise<Array<{action?: string, method?: string, fields: Array<{name?: string, type?: string, value?: string}>}>> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting page forms');
      const forms = await this.state.page?.evaluate(() => {
        const formElements = Array.from(document.querySelectorAll('form'));
        return formElements.map(form => ({
          action: form.getAttribute('action') || undefined,
          method: form.getAttribute('method') || undefined,
          fields: Array.from(form.querySelectorAll('input, select, textarea')).map(field => ({
            name: field.getAttribute('name') || undefined,
            type: field.getAttribute('type') || field.tagName.toLowerCase(),
            value: (field as HTMLInputElement).value || undefined
          }))
        }));
      });
      this.log('Forms retrieved:', forms?.length);
      return forms || [];
    } catch (error: any) {
      console.error('Get forms error:', error);
      throw new BrowserError('Failed to get forms', 'Check if the page is loaded');
    }
  }

  async getElementContent(selector: string): Promise<{html: string, text: string}> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Getting element content for selector:', selector);
      const content = await this.state.page?.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) {
          throw new Error(`Element not found: ${sel}`);
        }
        return {
          html: element.innerHTML,
          text: element.textContent || ''
        };
      }, selector);
      this.log('Element content retrieved');
      return content || {html: '', text: ''};
    } catch (error: any) {
      console.error('Get element content error:', error);
      throw new BrowserError('Failed to get element content', 'Check if the element exists');
    }
  }

  async executeJavaScript(script: string): Promise<any> {
    try {
      if (!this.isInitialized()) {
        throw new Error('Browser not initialized');
      }
      this.log('Executing JavaScript:', script);
      const result = await this.state.page?.evaluate((scriptToExecute) => {
        // Create a function wrapper to handle different types of JavaScript code
        try {
          // If the script is an expression, return its value
          // If the script is statements, execute them and return undefined
          const wrappedScript = `
            (function() {
              ${scriptToExecute}
            })()
          `;
          return eval(wrappedScript);
        } catch (error) {
          // If wrapping fails, try executing directly
          return eval(scriptToExecute);
        }
      }, script);
      this.log('JavaScript execution completed:', result);
      return result;
    } catch (error: any) {
      console.error('Execute JavaScript error:', error);
      throw new BrowserError('Failed to execute JavaScript', 'Check if the JavaScript syntax is valid');
    }
  }

  isInitialized(): boolean {
    return !!(this.state.browser?.isConnected() && this.state.context && this.state.page);
  }
}

export const playwrightController = new PlaywrightController();