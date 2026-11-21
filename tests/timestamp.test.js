import test from 'node:test';
import assert from 'node:assert/strict';

import { formatUnix, normalizeUnix, relativeTime, zonedTimeToUnix } from '../src/timestamp.js';

test('normalizeUnix 秒/毫秒自动识别', () => {
  assert.equal(normalizeUnix(0), 0);
  assert.equal(normalizeUnix('1763712000'), 1763712000);
  assert.equal(normalizeUnix(1763712000000), 1763712000); // 毫秒转秒
  assert.equal(normalizeUnix('now') > 1_600_000_000, true);
  assert.throws(() => normalizeUnix('abc'), /时间戳/);
});

test('formatUnix UTC 已知时刻', () => {
  const sec = Date.UTC(2026, 10, 21, 12, 34, 56) / 1000;
  assert.equal(formatUnix(sec, 'UTC'), '2026-11-21 12:34:56 UTC');
  assert.equal(formatUnix(sec * 1000, 'UTC'), '2026-11-21 12:34:56 UTC'); // 毫秒入参
});

test('formatUnix 上海时区偏移 8 小时', () => {
  const sec = Date.UTC(2026, 10, 21, 4, 0, 0) / 1000;
  assert.equal(formatUnix(sec, 'Asia/Shanghai'), '2026-11-21 12:00:00 Asia/Shanghai');
});

test('zonedTimeToUnix 三种时区(含夏令时区 1 月)', () => {
  const utc = zonedTimeToUnix('2026-01-15', '12:00:00', 'UTC');
  assert.equal(utc, Date.UTC(2026, 0, 15, 12, 0, 0) / 1000);
  // 上海 UTC+8:12:00 墙钟 = 04:00 UTC
  assert.equal(zonedTimeToUnix('2026-01-15', '12:00:00', 'Asia/Shanghai'),
               Date.UTC(2026, 0, 15, 4, 0, 0) / 1000);
  // 纽约 1 月为 EST(UTC-5):12:00 墙钟 = 17:00 UTC
  assert.equal(zonedTimeToUnix('2026-01-15', '12:00:00', 'America/New_York'),
               Date.UTC(2026, 0, 15, 17, 0, 0) / 1000);
  // 半小时时区:印度 UTC+5:30
  assert.equal(zonedTimeToUnix('2026-01-15', '12:00:00', 'Asia/Kolkata'),
               Date.UTC(2026, 0, 15, 6, 30, 0) / 1000);
});

test('zonedTimeToUnix 省略时间默认 00:00:00', () => {
  assert.equal(zonedTimeToUnix('2026-01-15', '', 'UTC'),
               Date.UTC(2026, 0, 15, 0, 0, 0) / 1000);
});

test('zonedTimeToUnix 非法日期报错(不静默顺延)', () => {
  assert.throws(() => zonedTimeToUnix('2026-02-30', '12:00'), /不存在/);
  assert.throws(() => zonedTimeToUnix('2026/01/15', '12:00'), /格式/);
  assert.throws(() => zonedTimeToUnix('2026-01-15', '25:00'), /超范围/);
});

test('relativeTime 中英文自然语言', () => {
  const now = Date.UTC(2026, 10, 21, 12, 0, 0) / 1000;
  assert.equal(relativeTime(now - 5, now), '5 秒前');
  assert.equal(relativeTime(now - 300, now), '5 分钟前');
  assert.equal(relativeTime(now + 7200, now), '2 小时后');
  assert.equal(relativeTime(now - 86400 * 3, now), '3 天前');
  assert.equal(relativeTime(now - 86400 * 90, now), '3 个月前');
  assert.equal(relativeTime(now + 86400 * 90, now), '3 个月后');
});
