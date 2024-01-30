// 字符串时间拆分成数组
export function splitStringTime(str: string) {
  let time = '';
  time += str.substring(0, 4);
  time += `-${str.substring(4, 6)}`;
  time += `-${str.substring(6, 8)}`;
  time += ` ${str.substring(8, 10)}`;
  time += `:${str.substring(10, 12)}`;
  time += `:${str.substring(12, 14)}`;
  return time;
}

export function color16() {
  //十六进制颜色随机
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const r16 =
    r.toString(16).length === 1 && r.toString(16) <= 'f' ? 0 + r.toString(16) : r.toString(16);
  const g16 =
    g.toString(16).length === 1 && g.toString(16) <= 'f' ? 0 + g.toString(16) : g.toString(16);
  const b16 =
    b.toString(16).length === 1 && b.toString(16) <= 'f' ? 0 + b.toString(16) : b.toString(16);
  const color = `#${r16}${g16}${b16}`;
  return color;
}

// TZ ==> UTC
export function convertTZ(timezone: string): string {
  let time = '';
  let sign = '';
  if (timezone.indexOf('-') != -1) {
    time = timezone.split('-')[1];
    sign = '-';
  } else {
    time = timezone.split(':')[1];
    sign = '+';
  }
  if (time.length == 3 || time.length == 1) {
    time = `0${time}`;
  }
  if (!time) {
    time = '0000';
  }
  if (time == '00') {
    time = '0000';
  }
  return `UTC${sign}${time.substring(0, 2)}:${time.substring(2, 4) || 0o0}`;
}

// UTC==> TZ
export function convertUTC(timezone: string): string {
  // UTC+00:00
  return timezone.replace(':', '').replace('+', '').replace('UTC', 'TZ:');
}

export const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));
