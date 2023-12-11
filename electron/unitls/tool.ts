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
