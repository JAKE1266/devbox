/**
 * 标识符生成与校验:UUID v4(WebCrypto)与批量生成。
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** 校验任意版本 UUID(v1-v8)格式。 */
export function isValidUUID(text) {
  return typeof text === 'string' && UUID_RE.test(text.trim());
}

/** 生成 RFC 4122 v4 UUID。 */
export function uuidV4() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** 批量生成,数量 1-1000,自动去重。 */
export function uuidV4Many(count = 5) {
  if (!Number.isInteger(count) || count < 1 || count > 1000) {
    throw new RangeError(`数量必须是 1-1000 的整数:${count}`);
  }
  const list = new Set();
  while (list.size < count) list.add(uuidV4());
  return [...list];
}
