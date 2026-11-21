/**
 * JSON 格式化 / 校验 / 压缩 / 键排序。
 * 统一返回 {ok: true, value} 或 {ok: false, error},便于 UI 直接消费。
 */

/** 解析 JSON;若运行时报错带位置信息,则附上行号列号提示。 */
export function parseJSON(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    return { ok: false, error: locateError(err, text) };
  }
}

function locateError(err, text) {
  const match = String(err.message).match(/position (\d+)/);
  if (!match) return err.message;
  const pos = Number(match[1]);
  const before = text.slice(0, pos);
  const line = before.split('\n').length;
  const column = pos - before.lastIndexOf('\n');
  return `${err.message}(第 ${line} 行,第 ${column} 列附近)`;
}

/** 美化输出,indent 为缩进空格数。 */
export function formatJSON(text, indent = 2) {
  const parsed = parseJSON(text);
  return parsed.ok ? { ok: true, value: JSON.stringify(parsed.value, null, indent) } : parsed;
}

/** 压缩为单行。 */
export function minifyJSON(text) {
  const parsed = parseJSON(text);
  return parsed.ok ? { ok: true, value: JSON.stringify(parsed.value) } : parsed;
}

/** 递归排序对象键(数组保持顺序)。 */
export function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = sortKeys(value[key]);
      return acc;
    }, {});
  }
  return value;
}

/** 解析并按键排序后美化。 */
export function sortJSON(text, indent = 2) {
  const parsed = parseJSON(text);
  return parsed.ok ? { ok: true, value: JSON.stringify(sortKeys(parsed.value), null, indent) } : parsed;
}
