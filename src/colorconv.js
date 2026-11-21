/**
 * 颜色格式转换:HEX ↔ RGB ↔ HSL。
 * 非法输入直接抛 Error(调用方负责兜底),往返转换保证一致。
 */

export function hexToRgb(input) {
  if (typeof input !== 'string') throw new TypeError('HEX 颜色必须是字符串');
  let hex = input.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]+$/.test(hex) || ![3, 6].includes(hex.length)) {
    throw new Error(`不合法的 HEX 颜色:${input}(应为 3 或 6 位十六进制)`);
  }
  if (hex.length === 3) hex = [...hex].map((ch) => ch + ch).join('');
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function assertChannel(value, name) {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new RangeError(`${name} 必须是 0-255 的整数:${value}`);
  }
}

export function rgbToHex(r, g, b) {
  const names = ['R', 'G', 'B'];
  [r, g, b].forEach((v, i) => assertChannel(v, names[i]));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** 返回 {h: 0-360, s: 0-100, l: 0-100}(取整)。 */
export function rgbToHsl(r, g, b) {
  [r, g, b].forEach(assertChannel);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const light = (max + min) / 2;
  let hue = 0;
  let sat = 0;
  if (max !== min) {
    const delta = max - min;
    sat = light > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case rn: hue = (gn - bn) / delta + (gn < bn ? 6 : 0); break;
      case gn: hue = (bn - rn) / delta + 2; break;
      default: hue = (rn - gn) / delta + 4;
    }
    hue = Math.round(hue * 60) % 360;
  }
  return { h: hue, s: Math.round(sat * 100), l: Math.round(light * 100) };
}

export function hslToRgb(h, s, l) {
  if (!Number.isFinite(h) || h < 0 || h >= 360) throw new RangeError(`H 必须是 0-359 的数:${h}`);
  if (!Number.isInteger(s) || s < 0 || s > 100) throw new RangeError(`S 必须是 0-100 的整数:${s}`);
  if (!Number.isInteger(l) || l < 0 || l > 100) throw new RangeError(`L 必须是 0-100 的整数:${l}`);
  const sn = s / 100, ln = l / 100;
  const chroma = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - chroma / 2;
  let rgb;
  if (h < 60) rgb = [chroma, x, 0];
  else if (h < 120) rgb = [x, chroma, 0];
  else if (h < 180) rgb = [0, chroma, x];
  else if (h < 240) rgb = [0, x, chroma];
  else if (h < 300) rgb = [x, 0, chroma];
  else rgb = [chroma, 0, x];
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  };
}
