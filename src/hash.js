/**
 * 文本哈希:WebCrypto SHA-1/256/384/512(浏览器与 Node ≥19 均内置)。
 */

const ALGOS = {
  'sha-1': 'SHA-1', sha1: 'SHA-1',
  'sha-256': 'SHA-256', sha256: 'SHA-256',
  'sha-384': 'SHA-384', sha384: 'SHA-384',
  'sha-512': 'SHA-512', sha512: 'SHA-512',
};

export const SUPPORTED = ['sha-1', 'sha-256', 'sha-384', 'sha-512'];

export async function hashText(text, algo = 'sha-256') {
  const name = ALGOS[String(algo).toLowerCase()];
  if (!name) throw new Error(`不支持的算法:${algo}(可选 ${SUPPORTED.join(', ')})`);
  const bytes = new TextEncoder().encode(String(text));
  const digest = await crypto.subtle.digest(name, bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
