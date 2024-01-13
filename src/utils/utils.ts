/**
 * 摄氏 转成 华氏
 * @param {Number} c
 */
export const c2f = c => {
    return Math.round((c * 1.8 + 32) * 10) / 10;
  },
  /**
   * 华氏 转成 摄氏
   * @param {Number} f
   */
  f2c = f => {
    return Math.round(((f - 32) / 1.8) * 10) / 10;
  };

// 传入秒数 转换成 时 分
export const secondsToTime = (seconds: number) => {
  if (seconds <= 0) {
    return '0 M';
  }
  if (seconds < 3600 && seconds > 0) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} M`;
  }
  let hours = Math.floor(seconds / 3600);
  const remainder = seconds % 3600;
  const minutes = Math.floor(remainder / 60);
  if (hours >= 24) {
    const day = Math.floor(hours / 24);
    hours = hours - day * 24;
    return `${day} D ${hours} H ${minutes} M`;
  }
  return `${hours} H ${minutes} M`;
};
