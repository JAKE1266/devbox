import test from 'node:test';
import assert from 'node:assert/strict';

import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from '../src/colorconv.js';

test('hexToRgb 支持 3/6 位与 # 前缀', () => {
  assert.deepEqual(hexToRgb('#34d399'), { r: 52, g: 211, b: 153 });
  assert.deepEqual(hexToRgb('34D399'), { r: 52, g: 211, b: 153 });
  assert.deepEqual(hexToRgb('#fff'), { r: 255, g: 255, b: 255 });
  assert.deepEqual(hexToRgb('0f0'), { r: 0, g: 255, b: 0 });
});

test('hexToRgb 非法输入抛错', () => {
  assert.throws(() => hexToRgb('#12345'), /HEX/);
  assert.throws(() => hexToRgb('xyz123'), /HEX/);
  assert.throws(() => hexToRgb(123), /TypeError|必须是字符串/);
});

test('rgbToHex 往返一致', () => {
  for (const [r, g, b] of [[0, 0, 0], [255, 255, 255], [52, 211, 153], [1, 2, 3]]) {
    assert.deepEqual(hexToRgb(rgbToHex(r, g, b)), { r, g, b });
  }
});

test('rgbToHex 越界抛错', () => {
  assert.throws(() => rgbToHex(256, 0, 0), /0-255/);
  assert.throws(() => rgbToHex(-1, 0, 0), /0-255/);
  assert.throws(() => rgbToHex(1.5, 0, 0), /0-255/);
});

test('rgbToHsl 已知颜色', () => {
  assert.deepEqual(rgbToHsl(255, 0, 0), { h: 0, s: 100, l: 50 });
  assert.deepEqual(rgbToHsl(0, 128, 0), { h: 120, s: 100, l: 25 });
  assert.deepEqual(rgbToHsl(255, 255, 255), { h: 0, s: 0, l: 100 });
});

test('hslToRgb 往返一致(采样调色板,HSL 整数量化误差 ≤ 2)', () => {
  for (const [r, g, b] of [[52, 211, 153], [59, 130, 246], [250, 204, 21], [239, 68, 68]]) {
    const hsl = rgbToHsl(r, g, b);
    const back = hslToRgb(hsl.h, hsl.s, hsl.l);
    assert.ok(Math.abs(back.r - r) <= 2, `R 偏差 ${Math.abs(back.r - r)}`);
    assert.ok(Math.abs(back.g - g) <= 2, `G 偏差 ${Math.abs(back.g - g)}`);
    assert.ok(Math.abs(back.b - b) <= 2, `B 偏差 ${Math.abs(back.b - b)}`);
  }
});

test('hslToRgb 越界抛错', () => {
  assert.throws(() => hslToRgb(360, 0, 0), /H 必须是/);
  assert.throws(() => hslToRgb(0, 101, 0), /S 必须是/);
  assert.throws(() => hslToRgb(0, 0, -1), /L 必须是/);
});
