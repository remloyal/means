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
