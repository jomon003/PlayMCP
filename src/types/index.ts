import { Page, Browser, BrowserContext } from 'playwright';

export interface BrowserState {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
  debug: boolean;
}

export class BrowserError extends Error {
  suggestion?: string;

  constructor(message: string, suggestion?: string) {
    super(message);
    this.name = 'BrowserError';
    this.suggestion = suggestion;
  }
}

export interface ScreenshotOptions {
  path: string;
  type?: 'element' | 'page' | 'viewport';
  selector?: string;
}

export interface ElementInfo {
  tagName: string;
  className: string;
  id: string;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  innerText: string | null;
}