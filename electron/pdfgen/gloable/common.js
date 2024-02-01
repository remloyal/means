'use strict';
import dayjs from 'dayjs';
import { getOffsetByName } from './timezones';

/**
 * 获取字符串长度
 * @param {*} str
 * @param {*} isEncode
 */
export const getStrLength = function (str, isEncode) {
  let size = 0;
  let step = 1;
  if (isEncode) {
    step = 2;
  }
  for (let i = 0, len = str ? str.length : 0; i < len; i++) {
    if (str.charCodeAt(i) > 255) {
      size += step; // utf-8中文三个字节
    } else {
      size++;
    }
  }
  return size;
};

export const subString = function (str, size, isEncode) {
  let curSize = 0;
  const arr = [];
  let step = 1;
  if (isEncode) {
    step = 2;
  }
  for (let i = 0, len = str.length; i < len; i++) {
    if (str.charCodeAt(i) > 255) {
      if (size >= curSize + step) {
        arr.push(str.charAt(i));
        curSize += step; // utf-8中文三个字节
      } else {
        return arr.join('');
      }
    } else {
      if (size >= curSize) {
        arr.push(str.charAt(i));
        curSize++;
      } else {
        return arr.join('');
      }
    }
  }
};

/**
 * 将日期格式化
 * 将2012-12-20 格式化为 2012年12月20日
 * 将2012-12-20 08:08:08 格式化为2012年12月20日 08时08分08秒
 * 输出格式以mask掩码格式为准，默认输出格式yyyy年MM月dd日 HH时mm分ss秒
 * @param {*} timestamp 如果为时间，转换成时间戳
 * @param {*} timeZone
 * @param {*} mask
 */
export const formatDate = function (timestamp, timeZone, mask = 'YY-MM-DD HH:mm:ss') {
  // if (!timestamp) return '--';
  // const tz = getTz(timeZone);
  // if (timestamp instanceof Date) {
  //   timestamp = timestamp.getTime();
  // } else if (typeof timestamp === 'string') {
  //   timestamp = new Date(timestamp).getTime();
  // }
  // // 根据传入时间 + 相应时间戳 毫秒数
  // const date = new Date(timestamp + tz * 60 * 60 * 1000);

  return dayjs(timestamp).format(mask || 'YY-MM-DD HH:mm:ss');
};

/**
 * PDF中图表的x轴坐标值，时间显示，首尾显示年月日时分，中间显示月日时分
 * @param {*} timestamp
 * @param {*} timeZone
 * @param {*} mask
 * @param {boolean} special 特殊处理
 */
export const getChartDate = function (
  timestamp,
  timeZone,
  mask = 'YY-MM-DD HH:mm:ss',
  special = false
) {
  if (!timestamp) return '--';
  const tz = getTz(timeZone);
  if (timestamp instanceof Date) {
    timestamp = timestamp.getTime();
  }
  // 根据传入时间 + 相应时间戳 毫秒数
  const date = new Date(timestamp);
  const time = dayjs(date).format('HH:mm');
  let month = dayjs(date).format('DD.MM');
  if (special) {
    month = dayjs(date).format('DD.MM.YYYY');
  }
  // pdf图表首位两个点
  return `${time} ${month}`;
};

export const timestampToTime = function (time) {
  time = Math.floor(time / 1000);
  let str = '';
  if (parseInt(time / 3600) !== 0) {
    str += `${parseInt(time / 3600)}h`;
  }
  if (parseInt(time / 3600) !== 0 || parseInt((time % 3600) / 60) !== 0) {
    str += `${parseInt((time % 3600) / 60)}m`;
  }
  str += '0s';
  return str;
};

export const getTz = function (timeZone) {
  // 判断时区是字串还是数字
  const zone = parseFloat(timeZone);
  let tz = 0;
  if (typeof zone === 'number' && isFinite(zone)) {
    tz = zone;
  } else {
    tz = getOffsetByName(timeZone);
  }
  return tz;
};

export const getTzToTimeStr = function (timeZone) {
  const utcOffset = getUtcOffset(timeZone);
  let str = parseInt(utcOffset / 60);
  // if (parseInt(utcOffset / 60) !== 0) {
  // str = parseInt(utcOffset / 60);
  // }
  // if (parseInt(utcOffset / 60) === 0) {
  //   str = '0';
  // }
  if (parseInt(utcOffset % 60) == 0) {
    str += ':00';
  }
  if (parseInt(utcOffset % 60) > 0) {
    str += `:${parseInt(utcOffset % 60)}`;
  }
  if (parseInt(utcOffset % 60) < 0) {
    str += `:${parseInt((utcOffset * -1) % 60)}`;
  }
  if (utcOffset >= 0) {
    str = `+${str}`;
  }
  return str;
};

export const getUtcOffset = function (timeZone) {
  return Math.floor(getTz(timeZone) * 60);
};
