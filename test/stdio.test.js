import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const entry = fileURLToPath(new URL('../dist/index.js', import.meta.url));
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

test('speaks MCP over stdio and reports the package version', async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [entry],
    // Debug logging must go to stderr; enabling it proves stdout stays protocol-only.
    env: { ...process.env, PLAYMCP_DEBUG: '1', PLAYMCP_HEADLESS: 'true' },
    stderr: 'pipe',
  });
  const client = new Client({ name: 'playmcp-stdio-test', version: '0.0.0' });
  await client.connect(transport);
  try {
    assert.deepEqual(client.getServerVersion(), { name: 'playmcp', version: pkg.version });
    assert.match(client.getInstructions() ?? '', /Typical loop/);
    await client.ping();

    const result = await client.callTool({
      name: 'navigate',
      arguments: { url: 'data:text/html,<title>stdio ok</title>' },
    });
    assert.equal(result.isError, undefined, result.content[0]?.text);
    const info = await client.callTool({ name: 'getPageInfo', arguments: {} });
    assert.equal(JSON.parse(info.content[0].text).title, 'stdio ok');
  } finally {
    await client.close();
  }
});
