import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  buildShareableToolLink,
  getShareableConfigKeys,
} from './shareable-tool-link.ts';

test('shareable tool links include only allow-listed non-sensitive configuration', () => {
  const link = buildShareableToolLink({
    origin: 'https://convertapp.local',
    path: '/converters/random-token-generator',
    toolId: 'random-token-generator',
    config: {
      length: 64,
      quantity: 3,
      characterSets: 'lowercase,uppercase,numbers,symbols',
      excludeAmbiguous: true,
      requireEachSelectedSet: true,
      input: 'raw-user-input',
      tokens: ['generated-secret-token'],
      result: 'generated-secret-token',
      signingKey: 'super-secret',
      validationSecret: 'validator-secret',
    },
  });

  const url = new URL(link);

  assert.equal(url.origin, 'https://convertapp.local');
  assert.equal(url.pathname, '/converters/random-token-generator');
  assert.equal(url.searchParams.get('tool'), 'random-token-generator');
  assert.equal(url.searchParams.get('length'), '64');
  assert.equal(url.searchParams.get('quantity'), '3');
  assert.equal(url.searchParams.get('characterSets'), 'lowercase,uppercase,numbers,symbols');
  assert.equal(url.searchParams.get('excludeAmbiguous'), 'true');
  assert.equal(url.searchParams.get('requireEachSelectedSet'), 'true');

  const serialized = url.toString();
  assert.doesNotMatch(serialized, /raw-user-input/);
  assert.doesNotMatch(serialized, /generated-secret-token/);
  assert.doesNotMatch(serialized, /super-secret/);
  assert.doesNotMatch(serialized, /validator-secret/);
  assert.equal(url.searchParams.has('input'), false);
  assert.equal(url.searchParams.has('tokens'), false);
  assert.equal(url.searchParams.has('result'), false);
  assert.equal(url.searchParams.has('signingKey'), false);
  assert.equal(url.searchParams.has('validationSecret'), false);
});

test('shareable configuration allow-lists exclude raw content and secret fields for developer tools', () => {
  const forbiddenKeys = [
    'input',
    'token',
    'tokens',
    'result',
    'output',
    'secret',
    'signingKey',
    'validationSecret',
    'privateKey',
    'builderBody',
    'builderAuthValue',
    'builderAuthPassword',
    'pattern',
    'testText',
    'payloadJson',
    'customClaimsJson',
    'expectedCustomClaimsJson',
  ];

  for (const toolId of [
    'random-token-generator',
    'jwt-decoder',
    'curl-to-code',
    'code-to-curl',
    'regex-tester',
    'env-validator',
  ]) {
    const keys = getShareableConfigKeys(toolId);

    for (const forbiddenKey of forbiddenKeys) {
      assert.equal(
        keys.includes(forbiddenKey),
        false,
        `${toolId} must not share sensitive "${forbiddenKey}" values`,
      );
    }
  }
});

test('unknown tools produce a path-only share link without user-provided fields', () => {
  const link = buildShareableToolLink({
    origin: 'https://convertapp.local',
    path: '/converters/custom',
    toolId: 'custom',
    config: {
      language: 'javascript',
      input: 'do-not-share',
    },
  });

  const url = new URL(link);

  assert.equal(url.pathname, '/converters/custom');
  assert.equal(url.searchParams.get('tool'), null);
  assert.equal(url.searchParams.get('language'), null);
  assert.equal(url.searchParams.get('input'), null);
  assert.doesNotMatch(url.toString(), /do-not-share/);
});

test('shareable tool links strip current route search and hash state before copying', () => {
  const link = buildShareableToolLink({
    origin: 'https://convertapp.local/app?token=current-url-secret#jwt',
    path: '/converters/jwt-decoder?token=current-route-secret&payloadJson=raw-payload#result',
    toolId: 'jwt-decoder',
    config: {
      mode: 'decode',
      token: 'jwt.secret.value',
      payloadJson: '{"password":"secret"}',
      signingKey: 'signing-secret',
      validationSecret: 'validation-secret',
    },
  });

  const url = new URL(link);

  assert.equal(url.origin, 'https://convertapp.local');
  assert.equal(url.pathname, '/converters/jwt-decoder');
  assert.equal(url.hash, '');
  assert.equal(url.searchParams.get('tool'), 'jwt-decoder');
  assert.equal(url.searchParams.get('mode'), 'decode');
  assert.equal(url.searchParams.has('token'), false);
  assert.equal(url.searchParams.has('payloadJson'), false);
  assert.equal(url.searchParams.has('signingKey'), false);
  assert.equal(url.searchParams.has('validationSecret'), false);

  const serialized = url.toString();
  assert.doesNotMatch(serialized, /current-url-secret/);
  assert.doesNotMatch(serialized, /current-route-secret/);
  assert.doesNotMatch(serialized, /raw-payload/);
  assert.doesNotMatch(serialized, /jwt\.secret\.value/);
  assert.doesNotMatch(serialized, /signing-secret/);
  assert.doesNotMatch(serialized, /validation-secret/);
});

test('share-link allow lists keep every developer utility raw input out of copied URLs', () => {
  const sensitiveByTool = {
    'random-token-generator': {
      prefix: 'prod_',
      suffix: '_secret',
      excludeCharacters: 'abc123',
      tokens: 'generated-secret-token',
    },
    'jwt-decoder': {
      token: 'header.payload.signature',
      signingKey: 'jwt-signing-key',
      validationSecret: 'jwt-validation-secret',
      privateKey: '-----BEGIN PRIVATE KEY-----',
      payloadJson: '{"sub":"user-1"}',
      customClaimsJson: '{"role":"admin"}',
      expectedCustomClaimsJson: '{"role":"admin"}',
    },
    'curl-to-code': {
      input: 'curl https://api.example.test -H "Authorization: Bearer secret-token"',
      output: 'fetch("https://api.example.test")',
    },
    'code-to-curl': {
      input: 'fetch("https://api.example.test", { headers: { Authorization: "Bearer secret-token" } })',
      output: 'curl https://api.example.test',
      builderBody: '{"password":"secret"}',
      builderAuthValue: 'bearer-secret',
      builderAuthPassword: 'password-secret',
    },
    'regex-tester': {
      pattern: '(secret)-(?<token>\\w+)',
      testText: 'secret-token',
      matches: 'secret-token',
    },
    'env-validator': {
      input: 'API_KEY=secret-token',
      output: 'API_KEY is valid',
    },
  };

  for (const [toolId, sensitiveConfig] of Object.entries(sensitiveByTool)) {
    const link = buildShareableToolLink({
      origin: 'https://convertapp.local',
      path: `/converters/${toolId}`,
      toolId,
      config: {
        mode: 'decode',
        language: 'javascript',
        flags: 'gim',
        allowExport: true,
        ...sensitiveConfig,
      },
    });
    const serialized = new URL(link).toString();

    for (const [key, value] of Object.entries(sensitiveConfig)) {
      assert.equal(
        new URL(link).searchParams.has(key),
        false,
        `${toolId} copied share link must not include "${key}"`,
      );
      assert.doesNotMatch(
        serialized,
        new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        `${toolId} copied share link must not expose raw "${key}" value`,
      );
    }
  }
});

test('tool workspace exposes a copyable configuration link action without reading raw inputs', () => {
  const source = readFileSync('app/components/tool-workspace-shell.tsx', 'utf8');

  assert.match(source, /buildShareableToolLink/);
  assert.match(source, /label="설정 링크 복사"/);
  assert.match(source, /copiedMessage="민감한 입력값 없이 설정 링크를 복사했습니다\."/);
  assert.match(source, /config:\s*\{\}/);
  assert.match(source, /origin:\s*window\.location\.origin/);
  assert.match(source, /path:\s*activeTool\.path/);
  assert.doesNotMatch(source, /\b(input|token|tokens|signingKey|validationSecret|builderBody|builderAuthValue|builderAuthPassword)\b/);
  assert.doesNotMatch(source, /\b(window\.location\.(?:href|search|hash|pathname)|pathname)\b[\s\S]{0,120}buildShareableToolLink/);
});
