import test from 'node:test';
import assert from 'node:assert/strict';

import { formatJSON, minifyJSON, parseJSON, sortJSON, sortKeys } from '../src/jsonfmt.js';

test('parseJSON 正常解析嵌套结构与中文', () => {
  const result = parseJSON('{"name":"张三","tags":["a","b"],"n":3}');
  assert.equal(result.ok, true);
  assert.equal(result.value.name, '张三');
  assert.deepEqual(result.value.tags, ['a', 'b']);
});

test('parseJSON 非法输入返回可读错误', () => {
  const result = parseJSON('{\n  "a": 1,\n  "b": }\n');
  assert.equal(result.ok, false);
  assert.ok(result.error.length > 0);
  // 运行时若提供位置信息,则附带行列提示(不同引擎格式不同,不强求)
});

test('formatJSON 两空格缩进美化', () => {
  const result = formatJSON('{"a":1,"b":{"c":[1,2]}}');
  assert.equal(result.ok, true);
  assert.equal(result.value, '{\n  "a": 1,\n  "b": {\n    "c": [\n      1,\n      2\n    ]\n  }\n}');
});

test('formatJSON 保留中文不转义', () => {
  const result = formatJSON('{"城市":"上海"}');
  assert.equal(result.ok, true);
  assert.ok(result.value.includes('上海'));
});

test('minifyJSON 压缩为单行', () => {
  const result = minifyJSON('{\n  "a": [1, 2]\n}');
  assert.equal(result.value, '{"a":[1,2]}');
});

test('sortKeys 递归排序且数组保持顺序', () => {
  const sorted = sortKeys({ b: 1, a: { d: [{ z: 1, y: 2 }], c: 2 } });
  assert.deepEqual(Object.keys(sorted), ['a', 'b']);              // 顶层排序
  assert.deepEqual(Object.keys(sorted.a), ['c', 'd']);            // 嵌套排序
  assert.deepEqual(sorted.a.d, [{ y: 2, z: 1 }]);                 // 数组顺序保持,键排序
  assert.deepEqual(Object.keys(sorted.a.d[0]), ['y', 'z']);
});

test('sortJSON 端到端', () => {
  const result = sortJSON('{"b":1,"a":2}', 0);
  assert.equal(result.value, '{"a":2,"b":1}');
});

test('非法输入返回 ok:false 而不是抛异常', () => {
  assert.equal(formatJSON('not json').ok, false);
  assert.equal(minifyJSON('').ok, false);
  assert.equal(sortJSON('[1,2').ok, false);
});
