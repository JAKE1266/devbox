/**
 * 时间戳与日期互转。
 * 秒/毫秒自动识别(≥1e12 视为毫秒);时区用 IANA 名称,统计用 Intl 标准库。
 */

/** 归一化输入为秒级整数。接受 "now"、数字、数字字符串。 */
export function normalizeUnix(input) {
  if (input === 'now') return Math.floor(Date.now() / 1000);
  let value = typeof input === 'number' ? input : Number(String(input).trim());
  if (!Number.isFinite(value)) throw new Error(`时间戳必须是数字:${input}`);
  if (Math.abs(value) >= 1e12) value /= 1000; // 毫秒自动转秒
  return Math.round(value);
}

/** 用 Intl 按 IANA 时区格式化,返回 "YYYY-MM-DD HH:mm:ss 时区"。 */
export function formatUnix(input, timeZone = 'UTC') {
  const seconds = normalizeUnix(input);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(seconds * 1000));
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '--';
  return `${get('year')}-${get('month')}-${get('day')} ` +
         `${get('hour')}:${get('minute')}:${get('second')} ${timeZone}`;
}

/** 计算某时区在给定时刻的 UTC 偏移(分钟,东正西负)。 */
function zoneOffsetMinutes(epochMs, timeZone) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(new Date(epochMs))
    .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
  const match = part.match(/GMT([+-])(\d{1,2}):(\d{2})/);
  if (!match) return 0; // GMT(偏移 0)
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/** 把某时区的墙钟时间转为 Unix 秒(严格校验,2026-02-30 这类日期会报错而不是静默顺延)。 */
export function zonedTimeToUnix(dateStr, timeStr, timeZone = 'UTC') {
  const dateMatch = String(dateStr).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) throw new Error(`日期格式应为 YYYY-MM-DD:${dateStr}`);
  const [, year, month, day] = dateMatch.map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1
      || probe.getUTCDate() !== day) {
    throw new Error(`日期不存在:${dateStr}`);
  }
  const time = (timeStr && String(timeStr).trim()) || '00:00:00';
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!timeMatch) throw new Error(`时间格式应为 HH:MM 或 HH:MM:SS:${time}`);
  const [, hh, mm, ss] = timeMatch.map(Number);
  if (hh > 23 || mm > 59 || (ss ?? 0) > 59) throw new Error(`时间数值超范围:${time}`);
  const naive = Date.UTC(year, month - 1, day, hh, mm, ss ?? 0);
  const offset = zoneOffsetMinutes(naive, timeZone);
  return Math.round(naive / 1000) - offset * 60;
}

/** 相对时间的自然语言描述(如「5 分钟前」);now 可注入以便测试。 */
export function relativeTime(input, now = Date.now() / 1000) {
  const seconds = normalizeUnix(input);
  const nowSec = typeof now === 'number' ? Math.round(now) : normalizeUnix(now);
  const diff = seconds - nowSec;
  const abs = Math.abs(diff);
  const word = diff > 0 ? '后' : '前';
  if (abs < 60) return `${abs} 秒${word}`;
  if (abs < 3600) return `${Math.round(abs / 60)} 分钟${word}`;
  if (abs < 86400) return `${Math.round(abs / 3600)} 小时${word}`;
  if (abs < 86400 * 30) return `${Math.round(abs / 86400)} 天${word}`;
  return `${Math.round(abs / 86400 / 30)} 个月${word}`;
}
