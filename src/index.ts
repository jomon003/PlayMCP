#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BrowserController } from './browser.js';
import { createServer } from './server.js';

const browser = new BrowserController();
const server = createServer(browser);

let shuttingDown = false;
async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  await browser.close().catch(() => {});
  await server.close().catch(() => {});
  process.exit(code);
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
// The client closing stdin means the session is over.
process.stdin.on('end', () => void shutdown());

try {
  await server.connect(new StdioServerTransport());
  console.error('PlayMCP server running on stdio');
} catch (error) {
  console.error('PlayMCP failed to start:', error);
  await shutdown(1);
}
