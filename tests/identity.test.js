import test from 'node:test';
import assert from 'node:assert/strict';

import { isValidUUID, uuidV4, uuidV4Many } from '../src/identity.js';

test('uuidV4 格式符合 RFC 4122', () => {
  const id = uuidV4();
  assert.equal(id.length, 36);
  assert.equal(id[14], '4');                                  // 版本位
  assert.match(id[19], /[89ab]/);                             // 变体位
  assert.equal(isValidUUID(id), true);
});

test('uuidV4 批量生成不重复', () => {
  const list = uuidV4Many(200);
  assert.equal(list.length, 200);
  assert.equal(new Set(list).size, 200);
  list.forEach((id) => assert.equal(isValidUUID(id), true));
});

test('uuidV4Many 数量边界', () => {
  assert.equal(uuidV4Many(1).length, 1);
  assert.equal(uuidV4Many(1000).length, 1000);
  assert.throws(() => uuidV4Many(0), /数量/);
  assert.throws(() => uuidV4Many(1001), /数量/);
  assert.throws(() => uuidV4Many(2.5), /数量/);
});

test('isValidUUID 各版本格式与拒绝样例', () => {
  assert.equal(isValidUUID('550e8400-e29b-41d4-a716-446655440000'), true);  // v4
  assert.equal(isValidUUID('550E8400-E29B-41D4-A716-446655440000'), true);  // 大写
  assert.equal(isValidUUID('urn:uuid:550e8400-e29b-41d4-a716-446655440000'), false);
  assert.equal(isValidUUID('550e8400e29b41d4a716446655440000'), false);     // 缺连字符
  assert.equal(isValidUUID(''), false);
  assert.equal(isValidUUID(null), false);
  assert.equal(isValidUUID(123), false);
});
