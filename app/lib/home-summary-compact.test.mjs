import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pageSource = readFileSync(resolve(import.meta.dirname, '../page.tsx'), 'utf8');

test('home summary metrics stay compact above the tool list', () => {
  assert.match(pageSource, /<section className="grid gap-3 md:grid-cols-3">/);
  assert.match(pageSource, /rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm/);
  assert.match(pageSource, /mt-1 text-2xl font-bold tracking-tight text-slate-950/);
  assert.match(pageSource, /mt-1 text-base font-semibold text-slate-950/);
});
