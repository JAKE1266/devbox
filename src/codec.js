/**
 * 编码转换:URL 编解码与 Unicode 安全的 Base64。
 * 解码类函数返回 {ok, value|error},不向 UI 抛异常。
 */

export function urlEncode(text, component = true) {
  return component ? encodeURIComponent(text) : encodeURI(text);
}

export function urlDecode(text) {
  try {
    return { ok: true, value: decodeURIComponent(text) };
  } catch {
    return { ok: false, error: '解码失败:存在不合法的百分号转义(如 %ZZ)' };
  }
}

/** Base64 编码(TextEncoder 先转 UTF-8 字节,支持中文与 emoji)。 */
export function base64Encode(text) {
  const bytes = new TextEncoder().encode(String(text));
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

/** Base64 解码,非法输入返回 {ok:false} 而不是抛异常。 */
export function base64Decode(text) {
  try {
    const binary = atob(text.trim());
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return { ok: true, value: new TextDecoder('utf-8').decode(bytes) };
  } catch {
    return { ok: false, error: 'Base64 解码失败:内容不是合法的 Base64' };
  }
}
