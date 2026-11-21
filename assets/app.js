/**
 * DevBox UI 逻辑:标签页切换与各工具的取数/渲染。
 * 全部计算复用 src/ 下与 UI 无关的纯函数模块(它们有 node:test 单元测试)。
 */

import { formatJSON, minifyJSON, parseJSON, sortJSON } from '../src/jsonfmt.js';
import { formatUnix, normalizeUnix, relativeTime, zonedTimeToUnix } from '../src/timestamp.js';
import { base64Decode, base64Encode, urlDecode, urlEncode } from '../src/codec.js';
import { hashText } from '../src/hash.js';
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from '../src/colorconv.js';
import { uuidV4Many } from '../src/identity.js';

const $ = (id) => document.getElementById(id);

/* ---------- 标签页 ---------- */
document.querySelectorAll('#nav button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#nav button').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tool').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    $(`tool-${btn.dataset.tab}`).classList.add('active');
  });
});

/* ---------- 通用 ---------- */
function setStatus(id, text, ok = true) {
  const el = $(id);
  el.textContent = text;
  el.classList.toggle('err', !ok);
  el.classList.toggle('ok', ok && text.length > 0);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => toast('已复制到剪贴板 ✔'))
    .catch(() => toast('复制失败,请手动选择文本'));
}

let toastTimer = null;
function toast(message) {
  let el = $('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

function resolveTz(value) {
  return value === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : value;
}

/* ---------- JSON ---------- */
document.querySelectorAll('[data-json]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const text = $('json-in').value;
    const action = { format: formatJSON, minify: minifyJSON, sort: sortJSON }[btn.dataset.json];
    const result = text.trim() ? action(text) : { ok: false, error: '请先输入 JSON 内容' };
    setStatus('json-status', result.ok ? '✔ 转换成功' : `✘ ${result.error}`, result.ok);
    $('json-out').textContent = result.ok ? result.value : '';
  });
});

/* ---------- 时间戳 ---------- */
$('ts-go').addEventListener('click', () => {
  try {
    const input = $('ts-unix').value.trim() || 'now';
    const tz = resolveTz($('ts-tz').value);
    setStatus('ts-out', formatUnix(input, tz));
    $('ts-rel').textContent = `相对时间:${relativeTime(input)}`;
  } catch (err) {
    setStatus('ts-out', `✘ ${err.message}`, false);
    $('ts-rel').textContent = '';
  }
});

$('ts-go2').addEventListener('click', () => {
  try {
    const date = $('ts-date').value;
    if (!date) throw new Error('请先选择日期');
    const tz = resolveTz($('ts-tz2').value);
    const seconds = zonedTimeToUnix(date, $('ts-time').value || '00:00:00', tz);
    setStatus('ts-out2', `秒 ${seconds} | 毫秒 ${seconds * 1000}`);
  } catch (err) {
    setStatus('ts-out2', `✘ ${err.message}`, false);
  }
});

/* ---------- URL ---------- */
$('url-in').addEventListener('input', () => {
  const text = $('url-in').value;
  $('url-enc').textContent = text ? urlEncode(text) : '';
  const decoded = text ? urlDecode(text) : { ok: true, value: '' };
  $('url-dec').textContent = decoded.ok ? decoded.value : '';
  setStatus('url-status', text ? (decoded.ok ? '✔ 解码成功' : `✘ ${decoded.error}`) : '', decoded.ok);
});

/* ---------- Base64 ---------- */
$('b64-in').addEventListener('input', () => {
  const text = $('b64-in').value;
  $('b64-enc').textContent = text ? base64Encode(text) : '';
  const decoded = text ? base64Decode(text) : { ok: true, value: '' };
  $('b64-dec').textContent = decoded.ok ? decoded.value : '';
  setStatus('b64-status', text ? (decoded.ok ? '✔ 解码成功' : `✘ ${decoded.error}`) : '', decoded.ok);
});
$('b64-copy').addEventListener('click', () => copyText($('b64-enc').textContent));

/* ---------- SHA 哈希 ---------- */
let hashSeq = 0;
$('hash-in').addEventListener('input', runHash);
$('hash-algo').addEventListener('change', runHash);
async function runHash() {
  const seq = ++hashSeq;
  const text = $('hash-in').value;
  if (!text) { $('hash-out').textContent = ''; setStatus('hash-status', ''); return; }
  const digest = await hashText(text, $('hash-algo').value);
  if (seq !== hashSeq) return; // 只采用最后一次输入的结果
  $('hash-out').textContent = digest;
  setStatus('hash-status', `✔ ${$('hash-algo').value.toUpperCase()} · ${digest.length * 4} bits`);
}

/* ---------- 颜色 ---------- */
function updateColor() {
  const raw = $('color-in').value.trim();
  const status = $('color-status');
  const out = $('color-out');
  if (!raw) { out.textContent = ''; status.textContent = ''; $('color-swatch').style.background = 'transparent'; return; }
  try {
    const rgb = raw.toLowerCase().startsWith('rgb')
      ? parseRgb(raw)
      : hexToRgb(raw);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    $('color-swatch').style.background = hex;
    out.textContent = `HEX  ${hex}\nRGB  rgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nHSL  hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    setStatus('color-status', '✔ 转换成功');
  } catch (err) {
    out.textContent = '';
    setStatus('color-status', `✘ ${err.message}`, false);
  }
}
function parseRgb(text) {
  const m = text.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i);
  if (!m) throw new Error('RGB 格式应为 rgb(52, 211, 153)');
  return { r: +m[1], g: +m[2], b: +m[3] };
}
$('color-in').addEventListener('input', updateColor);
$('color-random').addEventListener('click', () => {
  const hex = rgbToHex(...crypto.getRandomValues(new Uint8Array(3)));
  $('color-in').value = hex;
  updateColor();
});

/* ---------- UUID ---------- */
$('uuid-go').addEventListener('click', () => {
  try {
    const list = uuidV4Many(Number($('uuid-count').value) || 5);
    $('uuid-out').textContent = list.join('\n');
  } catch (err) {
    setStatus('uuid-out', `✘ ${err.message}`, false);
  }
});
$('uuid-copy').addEventListener('click', () => {
  const text = $('uuid-out').textContent;
  if (text) copyText(text);
});
