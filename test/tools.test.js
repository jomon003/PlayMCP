import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, beforeEach, describe, test } from 'node:test';
import { connectClient, startFixtureServer } from './helpers.js';

let site;
let mcp;

before(async () => {
  process.env.PLAYMCP_TIMEOUT = '2000';
  site = await startFixtureServer();
  mcp = await connectClient();
  await mcp.call('openBrowser', { headless: true });
});

after(async () => {
  await mcp?.call('closeBrowser').catch(() => {});
  await mcp?.close();
  await site?.close();
});

beforeEach(async () => {
  await mcp.call('navigate', { url: `${site.url}/` });
});

describe('tool listing', () => {
  test('every tool has a title, description, object schema and annotations', async () => {
    const { tools } = await mcp.client.listTools();
    assert.ok(tools.length >= 35, `expected at least 35 tools, got ${tools.length}`);
    for (const tool of tools) {
      assert.ok(tool.title, `${tool.name} has no title`);
      assert.ok(tool.description, `${tool.name} has no description`);
      assert.equal(tool.inputSchema.type, 'object', `${tool.name} schema is not an object`);
      assert.equal(typeof tool.annotations?.readOnlyHint, 'boolean', `${tool.name} has no readOnlyHint`);
    }
  });

  test('declares required parameters', async () => {
    const { tools } = await mcp.client.listTools();
    const navigate = tools.find((t) => t.name === 'navigate');
    assert.deepEqual(navigate.inputSchema.required, ['url']);
  });
});

describe('navigation', () => {
  test('navigate reports the final URL and status', async () => {
    const result = await mcp.callJson('navigate', { url: `${site.url}/` });
    assert.equal(result.status, 200);
    assert.equal(result.url, `${site.url}/`);
  });

  test('getPageInfo returns URL and title', async () => {
    assert.deepEqual(await mcp.callJson('getPageInfo'), { url: `${site.url}/`, title: 'PlayMCP Fixture' });
  });

  test('goBack, goForward and reload move through history', async () => {
    await mcp.call('click', { selector: 'text=Go to second' });
    await mcp.call('waitForText', { text: 'Second page' });
    assert.match(await mcp.call('goBack'), /\/$/);
    assert.match(await mcp.call('goForward'), /second\.html$/);
    assert.match(await mcp.call('reload'), /second\.html$/);
  });
});

describe('interaction', () => {
  test('type, selectOption and click drive a form', async () => {
    await mcp.call('type', { selector: '#username', text: 'ada' });
    assert.deepEqual(await mcp.callJson('selectOption', { selector: '#color', values: ['green'] }), {
      selected: ['green'],
    });
    await mcp.call('click', { selector: '#submit' });
    assert.equal(await mcp.call('getElementContent', { selector: '#result' }).then(JSON.parse).then((c) => c.text), 'Submitted ada green');
  });

  test('type replaces existing content and accepts an empty string', async () => {
    await mcp.call('type', { selector: '#username', text: 'first' });
    await mcp.call('type', { selector: '#username', text: '' });
    assert.equal(await mcp.callJson('executeJavaScript', { script: "document.querySelector('#username').value" }), '');
  });

  test('handleDialog answers the next prompt', async () => {
    await mcp.call('handleDialog', { accept: true, promptText: 'Grace' });
    await mcp.call('click', { selector: '#prompt-button' });
    await mcp.call('waitForText', { text: 'Answer: Grace' });
  });

  test('dialogs without a policy are dismissed instead of hanging', async () => {
    await mcp.call('click', { selector: '#prompt-button' });
    await mcp.call('waitForText', { text: 'Answer: null' });
  });

  test('hover triggers mouse events', async () => {
    await mcp.call('hover', { selector: '#hover-target' });
    await mcp.call('waitForText', { text: 'Hovered' });
  });

  test('pressKey types into the focused element', async () => {
    await mcp.call('click', { selector: '#username' });
    await mcp.call('pressKey', { key: 'x' });
    assert.equal(await mcp.callJson('executeJavaScript', { script: "document.querySelector('#username').value" }), 'x');
  });

  test('mouseMove, mouseClick and mouseDrag accept coordinates', async () => {
    await mcp.call('mouseMove', { x: 10, y: 10 });
    assert.equal(await mcp.call('mouseClick'), 'Clicked at (10, 10)');
    await mcp.call('mouseDrag', { startX: 10, startY: 10, endX: 50, endY: 50 });
  });

  test('scroll reports positions before and after', async () => {
    const result = await mcp.callJson('scroll', { x: 0, y: 400 });
    assert.deepEqual(result.before, { x: 0, y: 0 });
    assert.equal(result.scrolled.y, 400);
  });
});

describe('waiting', () => {
  test('waitForSelector waits for late elements', async () => {
    await mcp.call('waitForSelector', { selector: '#late', timeout: 5000 });
  });

  test('timeouts are reported as tool errors', async () => {
    const result = await mcp.client.callTool({
      name: 'waitForSelector',
      arguments: { selector: '#missing', timeout: 200 },
    });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /Timeout 200ms exceeded/);
  });
});

describe('content extraction', () => {
  test('getPageText returns visible text', async () => {
    assert.match(await mcp.call('getPageText'), /Hello PlayMCP/);
  });

  test('getPageSource returns HTML', async () => {
    assert.match(await mcp.call('getPageSource'), /<h1 id="heading"/);
  });

  test('getLinks resolves hrefs', async () => {
    const links = await mcp.callJson('getLinks');
    assert.deepEqual(links, [{ href: `${site.url}/second.html`, text: 'Go to second', title: 'Second page' }]);
  });

  test('getImages, getForms and getMetaTags describe the page', async () => {
    const [image] = await mcp.callJson('getImages');
    assert.equal(image.alt, 'pixel');
    const [form] = await mcp.callJson('getForms');
    assert.equal(form.id, 'login');
    assert.ok(form.fields.some((f) => f.name === 'username' && f.required));
    const metas = await mcp.callJson('getMetaTags');
    assert.ok(metas.some((m) => m.name === 'description' && m.content === 'PlayMCP test page'));
  });

  test('getScripts and getStylesheets return inline sources', async () => {
    assert.match(await mcp.call('getScripts'), /fixture loaded/);
    assert.match(await mcp.call('getStylesheets'), /#spacer/);
  });

  test('inspectElement returns attributes and bounding box', async () => {
    const info = await mcp.callJson('inspectElement', { selector: '#heading' });
    assert.equal(info.tagName, 'h1');
    assert.deepEqual(info.attributes, { id: 'heading', class: 'title' });
    assert.equal(info.visible, true);
  });

  test('getElementHierarchy honours maxDepth, including 0', async () => {
    const shallow = await mcp.callJson('getElementHierarchy', { selector: '#tree', maxDepth: 0 });
    assert.deepEqual(shallow, { tag: 'div', id: 'tree', childCount: 1 });
    const deep = await mcp.callJson('getElementHierarchy', { selector: '#tree', maxDepth: -1, includeText: true });
    assert.equal(deep.children[0].children[0].children[0].text, 'deep');
  });
});

describe('executeJavaScript', () => {
  test('returns the value of an expression', async () => {
    assert.equal(await mcp.callJson('executeJavaScript', { script: 'document.title' }), 'PlayMCP Fixture');
  });

  test('supports statements with return', async () => {
    assert.equal(await mcp.callJson('executeJavaScript', { script: 'const a = 2; return a * 21;' }), 42);
  });

  test('awaits promises', async () => {
    assert.equal(await mcp.callJson('executeJavaScript', { script: 'await Promise.resolve(7)' }), 7);
  });

  test('reports page exceptions as tool errors', async () => {
    const result = await mcp.client.callTool({ name: 'executeJavaScript', arguments: { script: 'throw new Error("boom")' } });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /boom/);
  });
});

describe('diagnostics', () => {
  test('getConsoleMessages captures output logged before the call', async () => {
    const messages = await mcp.callJson('getConsoleMessages', { clear: true });
    assert.ok(messages.some((m) => m.type === 'log' && m.text === 'fixture loaded'));
    assert.deepEqual(await mcp.callJson('getConsoleMessages'), []);
  });

  test('getNetworkRequests records requests with status codes', async () => {
    const requests = await mcp.callJson('getNetworkRequests', { clear: true });
    assert.ok(requests.some((r) => r.url === `${site.url}/` && r.status === 200));
    assert.ok(requests.some((r) => r.url.endsWith('/pixel.png') && r.resourceType === 'image'));
  });
});

describe('screenshot', () => {
  test('returns an image and saves it when a path is given', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'playmcp-'));
    try {
      const path = join(dir, 'shot.png');
      const result = await mcp.client.callTool({ name: 'screenshot', arguments: { path, selector: '#heading' } });
      assert.equal(result.isError, undefined);
      assert.equal(result.content[0].type, 'image');
      assert.equal(result.content[0].mimeType, 'image/png');
      const saved = await readFile(path);
      assert.equal(saved.toString('base64'), result.content[0].data);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('supports jpeg', async () => {
    const result = await mcp.client.callTool({ name: 'screenshot', arguments: { format: 'jpeg' } });
    assert.equal(result.content[0].mimeType, 'image/jpeg');
  });
});

describe('validation and errors', () => {
  test('rejects arguments that fail the schema', async () => {
    const result = await mcp.client.callTool({ name: 'resize', arguments: { width: -1, height: 'tall' } });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /validation/i);
  });

  test('includes the Playwright reason when an element is missing', async () => {
    const result = await mcp.client.callTool({ name: 'getElementContent', arguments: { selector: '#missing' } });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /#missing/);
  });
});
