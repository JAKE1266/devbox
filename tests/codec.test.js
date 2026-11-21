import test from 'node:test';
import assert from 'node:assert/strict';

import { base64Decode, base64Encode, urlDecode, urlEncode } from '../src/codec.js';
import { hashText } from '../src/hash.js';

test('urlEncode 组件模式与整体模式', () => {
  assert.equal(urlEncode('hello world'), 'hello%20world');
  assert.equal(urlEncode('中文&='), '%E4%B8%AD%E6%96%87%26%3D');
  assert.equal(urlEncode('https://a.com/b?q=中文', false), 'https://a.com/b?q=%E4%B8%AD%E6%96%87');
});

test('urlDecode 往返一致', () => {
  const original = 'a=1&b=测试 text/🎉';
  assert.equal(urlDecode(urlEncode(original)).value, original);
});

test('urlDecode 非法转义返回错误', () => {
  const result = urlDecode('%E4%ZZ');
  assert.equal(result.ok, false);
  assert.match(result.error, /百分号/);
});

test('base64 已知向量 Hello', () => {
  assert.equal(base64Encode('Hello'), 'SGVsbG8=');
  assert.equal(base64Decode('SGVsbG8=').value, 'Hello');
});

test('base64 中文与 emoji 往返', () => {
  const original = '中文 base64 🚀 roundtrip';
  assert.equal(base64Decode(base64Encode(original)).value, original);
});

test('base64 非法输入返回错误', () => {
  const result = base64Decode('!!不是base64!!');
  assert.equal(result.ok, false);
  assert.match(result.error, /Base64/);
});

test('hashText SHA-256 已知向量 abc', async () => {
  assert.equal(await hashText('abc', 'sha-256'),
               'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('hashText SHA-1 与中文输入', async () => {
  assert.equal(await hashText('abc', 'sha1'),
               'a9993e364706816aba3e25717850c26c9cd0d89d');
  const digest = await hashText('你好', 'sha-256');
  assert.equal(digest, await hashText('你好', 'SHA-256')); // 大小写别名
});

test('hashText 不支持的算法报错', async () => {
  await assert.rejects(() => hashText('x', 'md5'), /不支持/);
});
