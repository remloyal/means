import dayjs from 'dayjs';

interface Data {
  c: number;
  f: number;
  humi: number;
}
export function findMinMax(data: Data[]): {
  c: { min: number; max: number; average: number | string };
  f: { min: number; max: number; average: number | string };
  humi: { min: number; max: number; average: number | string };
} {
  const cList: number[] = [];
  const fList: number[] = [];
  const humiList: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const { c, f, humi } = data[i];
    cList.push(Number(c));
    fList.push(Number(f));
    humiList.push(Number(humi));
  }
  const cMin = findMinValue(cList);
  const cMax = findMaxValue(cList);
  const fMin = findMinValue(fList);
  const fMax = findMaxValue(fList);
  const humiMin = findMinValue(humiList);
  const humiMax = findMaxValue(humiList);
  return {
    c: { min: cMin, max: cMax, average: getAverage(cList) },
    f: { min: fMin, max: fMax, average: getAverage(fList) },
    humi: { min: humiMin, max: humiMax, average: getAverage(humiList) },
  };
}

function findMaxValue(numbers) {
  let max = -Infinity;
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }
  return max;
}
function findMinValue(data: number[]): number {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < data.length; i++) {
    if (data[i] < min) {
      min = data[i];
    }
  }
  return min;
}

function getAverage(arr) {
  const res =
    arr.reduce((sum, value) => {
      return sum + value;
    }, 0) / arr.length;
  return res.toFixed(1) || 0;
}

interface DataType {
  c: number;
  f: number;
  humi: number;
  timeStamp: string;
}
export function convertToCSV(data: DataType[]): string {
  let csv = 'timeStamp,c,f,humi\n'; // CSV 文件的头部
  for (const { c, f, humi, timeStamp } of data) {
    csv += `${timeStamp},${c},${f},${humi}\n`; // 将每行数据格式化为 CSV 格式的字符串
  }
  return csv;
}

/**
 * 解析 csv 数据
 * @param {String} csvString csv 数据
 * @returns 解析后的数据
 */
export const parseCSVData = (csvString): TimeType[] => {
  const lines = csvString.split('\n');
  const data: TimeType[] = [];

  // 我们从第2行开始处理，因为前几行包含元数据或标题。
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 跳过空行
    const fields = line.split(',');
    data.push({
      timeStamp: fields[0],
      c: fields[1],
      f: fields[2],
      humi: fields[3],
    });
  }
  return data;
};

export const timeDiff = (startTime, endTime) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const diffInMinutes = end.diff(start, 'minutes');
  return diffInMinutes;
};

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

export function Uint8ArrayToString(fileData: Uint8Array) {
  let dataString = '';
  for (let i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  return dataString.replace('\u0002', '').replaceAll('\u0000', '');
}

export function stringToUint8Array(str): number[] {
  const tmpUint8Array = str.split('').map(e => e.charCodeAt(0));
  tmpUint8Array.unshift(1);
  return tmpUint8Array;
}

export const getDuration = (todo: any[]) => {
  const minList: number[] = [];
  for (let i = 1; i < todo.length; i++) {
    const diff = dayjs(todo[i].timeStamp).valueOf();
    minList.push(diff);
  }
  const maxDiff = minList.sort((a, b) => a - b);
  const seconds = dayjs(maxDiff[maxDiff.length - 1]).diff(dayjs(maxDiff[0])) / 1000;
  return secondsToTime(seconds);
};

// 传入秒数 转换成 时 分
export const secondsToTime = (seconds: number) => {
  if (seconds <= 0) {
    return '0 m';
  }
  if (seconds < 3600 && seconds > 0) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} m`;
  }
  let hours = Math.floor(seconds / 3600);
  const remainder = seconds % 3600;
  const minutes = Math.floor(remainder / 60);
  if (hours >= 24) {
    const day = Math.floor(hours / 24);
    hours = hours - day * 24;
    return `${day}D ${hours}H ${minutes}M`;
  }
  return `${hours}H ${minutes}M`;
};

// 格式化UTC
export function formatUtc(utcStr) {
  if (utcStr == '' || utcStr == null || utcStr == undefined) {
    return utcStr;
  }
  const regex = /UTC([+-]\d{1,2}):(\d{2})/;
  const match = utcStr.match(regex);

  if (!match) {
    throw new Error(`Invalid UTC format: ${utcStr}`);
  }

  let sign = '+';

  let hours = match[1];
  let minutes = match[2];
  if (hours.includes('+')) {
    sign = '+';
  } else {
    sign = '-';
  }

  hours = parseInt(hours).toString();
  if (hours.length === 1) {
    hours = `0${hours}`;
  }
  if (minutes.length === 1) {
    minutes = `0${minutes}`;
  }

  return `UTC${sign}${hours}:${minutes}`;
}

// 平均热力学温度 （MKT）
// 开尔文
const kelvin = 273.15;
// h 热能值
const caloricValue = 83.14472;
// 气体常数
const gasConstant = 8.314;
// 温度求MKT
export function tempMkT(tempList: number[]) {
  // 长度
  const len = tempList.length;
  // 求和
  let sum = 0;
  const kelvinList: any = [];
  const coefficient: any = [];
  for (let i = 0; i < len; i++) {
    sum += tempList[i];
    const kelvinValue = kelvin + tempList[i];
    kelvinList[i] = kelvinValue;
    coefficient[i] = Math.exp(-caloricValue / (gasConstant * kelvinValue));
  }
  // 求coefficient 和
  let sumC = 0;
  for (let i = 0; i < len; i++) {
    sumC += coefficient[i];
  }
  // 求coefficient 平均值
  const coefficientAvg = sumC / len;
  const result = -Math.log(coefficientAvg);
  //   MKT值
  const mkt = caloricValue / gasConstant / result;
  const mktC = (mkt - kelvin).toFixed(1);
  return Number(mktC);
}
