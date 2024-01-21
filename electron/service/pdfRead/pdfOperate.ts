// import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { pdfType } from './pdfType';
import { c2f, f2c, formatUtc } from '../../unitls/tool';
import pdfjsLib from 'pdfjs-dist';
dayjs.extend(customParseFormat);
import log from '../../unitls/log';
import { parsePDF } from './pad_json';
import { ipcMain, ipcRenderer } from 'electron';
import { win } from '../../main/index';
import path from 'path';
const iconv = require('iconv-lite');

// let pdfjsLib;
const attempts = 5;
export const importPDFFile = async (filePath: string, pdfPassword = '', deviceRead = false) => {
  // if (!pdfjsLib) {
  //   pdfjsLib = await import('pdfjs-dist');
  // }
  // const data = new Uint8Array(fs.readFileSync(filePath));
  let isGarbled = false;
  const loadingTask = pdfjsLib.getDocument({
    url: filePath,
    // cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/cmaps/',
    cMapPacked: true,
  });
  let lang = 'en'; //zh
  let type = pdfType[lang];
  let list: any = [];
  let total = 0;
  const fileName = path.basename(filePath).split('.')[0];
  let password = '';
  let passwordNumber = 0;
  loadingTask.onPassword = async (updatePassword, reason) => {
    if (deviceRead) {
      // pdf 使用设备密码读取，次数限制
      if (passwordNumber > attempts) {
        updatePassword('');
        loadingTask.onPassword = Function;
        return;
      }
      passwordNumber++;
      updatePassword(pdfPassword);
      ipcMain.removeHandler('callPassword');
      ipcMain.removeHandler('pdfPassword');
      ipcMain.removeHandler('pdfEnterPassword');
      return;
    }
    // 取消
    ipcMain.handle('callPassword', (event, params) => {
      password = '';
      ipcMain.removeHandler('callPassword');
      ipcMain.removeHandler('pdfPassword');
      ipcMain.removeHandler('pdfEnterPassword');
      updatePassword('');
      loadingTask.onPassword = Function;
      return;
    });
    await win?.webContents.send('pdfPassword', { fileName, reason });
    ipcMain.handle('pdfEnterPassword', (event, params) => {
      console.log(params);
      password = params;
      ipcMain.removeHandler('callPassword');
      ipcMain.removeHandler('pdfPassword');
      ipcMain.removeHandler('pdfEnterPassword');
      updatePassword(params);
      return;
    });
  };
  await loadingTask.promise.then(
    async pdf => {
      total = pdf.numPages;
      // PDF 文件解析成功后的回调函数
      // 在这里你可以访问 PDF 文件的所有内容

      for (let index = 1; index <= pdf.numPages; index++) {
        // const element = array[index];
        // if (index == 1) {
        // }
        const textContent = await pdf.getPage(index).then(page => {
          return page.getTextContent();
        });

        const textList = textContent.items as any;

        const text = textList.map(item => item.str).join('');
        if (index == 1) {
          if (text.indexOf('Device') != -1) {
            lang = 'en';
          }
          if (text.indexOf('设备') != -1) {
            lang = 'zh';
          }
          type = pdfType[lang];
        }
        list.push(text);
        //   console.log(text);
      }
    },
    reason => {
      // PDF 文件解析失败后的回调函数
      log.error(reason);
      console.error(reason);
    }
  );

  //   console.log(list);
  if (list.length > 1 && list[1] == '') {
    // 乱码解析
    const data = await parsePDF(filePath, list.length, pdfPassword || password);
    if (data) {
      isGarbled = true;
      list = data;
    }
  }

  const newDeviceType = ['°C°C°C°C°C', '°C°C°C°C°C°C', '°F°F°F°F°F', '°F°F°F°F°F°F'];
  if (list.length >= 1 && newDeviceType.includes(list[1])) {
    // 新设备端中文识别 可能错误 ，重新解析
    const data = await parsePDF(filePath, list.length, pdfPassword || password);
    if (data) {
      isGarbled = true;
      list = data;
    }
  }
  if (list.length == 0) {
    return false;
  }
  const deviceInstance: any = await readFirst(list[0], type);

  const csvData: any = [];
  for (let index = 1; index < list.length; index++) {
    const element = list[index];
    const todo = await readData(element, deviceInstance, `${index + 1}/${list.length}`);
    csvData.push(...todo);
  }
  deviceInstance.csvData = csvData;
  const threshold = await getThreshold(deviceInstance.threshold, deviceInstance.type);
  //   console.log(deviceInstance, csvData.length);
  if (deviceInstance.timeZone) {
    deviceInstance.timeZone = formatUtc(deviceInstance.timeZone);
  }
  if (deviceInstance.shipment || deviceInstance.shipmentId) {
    deviceInstance.shipment = iconv.decode(deviceInstance.shipment, 'GB2312');
    deviceInstance.shipmentId = iconv.decode(deviceInstance.shipmentId, 'GB2312');
    console.log(iconv.decode(deviceInstance.shipment, 'GBK'));
  }
  return { ...deviceInstance, ...threshold };
  // console.log(csvData);
};

const readFirst = (text, type) => {
  const data = text.replace('ALARM', '').replace('www.friggatech.com', '').replace('®', ' ');
  data.slice(0, data.lastIndexOf('Record Chart'));
  let rule;
  const todo = { type: '' };
  console.log(data.charAt(0));
  if (data.charAt(0) == '.') {
    rule = type.currency.rule;
    todo.type = 'currency';
  } else {
    rule = type.device.rule;
    todo.type = 'device';
  }

  Object.keys(rule).forEach(key => {
    const law = rule[key];
    todo[key] = '';
    law.forEach(item => {
      try {
        const matches = item.exec(text);
        const result = matches[1];
        if (!todo[key]) {
          todo[key] = result;
        }
        if (key == 'timeFormat') {
          todo[key] = result.replace('[', '').replace(']', '');
        }
      } catch (error) {
        console.error(`正则匹配错误===》 ${item}  ${error}`);
      }
    });
  });
  for (const i in todo) {
    todo[i] = todo[i].trim();
  }
  console.log(todo);
  return todo;
};

const readData = async (text, todo, pageFooting) => {
  let size = 3;
  let key = '';
  let unit = '°C';
  if (text.includes('°C') || text.includes('℃')) {
    // size += 1;
    key = '°C';
  }
  if (text.includes('℉') || text.includes('°F')) {
    // size += 1;
    key = '℉';
    unit = '℉';
  }
  if (text.includes('RH') || text.includes('%RH')) {
    size += 1;
    key = 'RH';
  }
  text.replace('wwww.friggatech.com', '');
  let data = text.replace('wwww.friggatech.com', '').replace(pageFooting, '').trim();
  data = await formatText(data, todo.type);
  const chunkedData = splitData(data, size, unit, todo);
  return chunkedData;
};
function splitData(data, size, unit, todo) {
  const result: any = [];
  let text = data
    .replace(/(\d{2})-(\d{2})-(\d{2})/g, ' $1-$2-$3')
    .trim()
    .split(' ');
  text = text.filter(s => {
    return s && s.trim();
  });
  const format = todo.timeFormat
    ? `${todo.timeFormat.split(' ')[0]} HH:mm:ss`
    : 'DD-MM-YY HH:mm:ss';
  // const chunkSize = size == 4 ? 22 : size == 3 ? 20 : 20;
  // 23-11-1005:28:1971.466
  for (let i = 0; i < text.length; i += size) {
    const time = text[i];
    const temp = text[i + 1];
    const heat = text[i + 2];
    const hum = size == 3 ? 0 : text[i + 3];
    let c;
    let f;
    if (unit == '℉') {
      c = f2c(parseFloat(heat));
      f = parseFloat(heat);
    } else {
      f = c2f(parseFloat(heat));
      c = parseFloat(heat);
    }

    result.push({
      timeStamp: dayjs(`${time} ${temp}`, format).format('YYYY-MM-DD HH:mm:ss'),
      humi: parseFloat(hum),
      c,
      f,
    });
  }
  return result;
}

function formatText(text, type) {
  const rule = [
    'www.friggatech.com',
    'Date',
    'Time',
    '%RH',
    'RH',
    '日期',
    '时间',
    '°C',
    '°F',
    '℃',
    '℉',
    '期',
    '…',
    'undefined',
    '죕웚',
    '쪱볤',
    'ꇦ',
  ];
  let character = newFromat(text, type);
  rule.forEach(item => {
    character = character.replaceAll(item, '');
  });
  return character.trim();
}

// 温湿度 阈值
function getThreshold(data, type, isGarbled = false) {
  let unit = '℃';
  if (data.includes('°C') || data.includes('℃') || data.includes('ꇦ')) {
    // size += 1;
    unit = '℃';
  }
  if (data.includes('℉') || data.includes('°F')) {
    unit = '℉';
  }
  if (data.includes('RH')) {
    unit += 'RH';
  }
  let text = '';

  try {
    text = data.split('：')[1].trim();
  } catch (error) {
    text = data.split(':')[1].trim();
  }
  const handleData = text
    .replaceAll('℃', ',')
    .replaceAll('°C', ',')
    .replaceAll('ꇦ', ',')
    .replaceAll('℉', ',')
    .replaceAll('°F', ',')
    .replaceAll('%RH', ',')
    .replaceAll('RH', ',')
    .replaceAll('～', '')
    .replaceAll('ꆫ', '')
    .replaceAll('/', '')
    .replaceAll('~', '')
    .replace(/^,+/, '')
    .replace(/,+$/, '')
    .split(',');
  if (unit.includes('℃') && unit.includes('RH')) {
    return {
      hightEmp: parseFloat(handleData[1]) || 0,
      lowtEmp: parseFloat(handleData[0]) || 0,
      highHumi: parseFloat(handleData[3]) || 0,
      lowHumi: parseFloat(handleData[2]) || 0,
    };
  }
  if (unit.includes('℉') && unit.includes('RH')) {
    return {
      hightEmp: f2c(parseFloat(handleData[1])) || 0,
      lowtEmp: f2c(parseFloat(handleData[0])) || 0,
      highHumi: parseFloat(handleData[3]) || 0,
      lowHumi: parseFloat(handleData[2]) || 0,
    };
  }
  // 只有温度
  if ((unit.includes('℃') || unit.includes('℉')) && !unit.includes('RH')) {
    return {
      hightEmp: unit.includes('℃') ? parseFloat(handleData[1]) : f2c(parseFloat(handleData[1])),
      lowtEmp: unit.includes('℃') ? parseFloat(handleData[0]) : f2c(parseFloat(handleData[0])),
      highHumi: 0,
      lowHumi: 0,
    };
  }

  return { hightEmp: 0, lowtEmp: 0, highHumi: 0, lowHumi: 0 };
}

function newFromat(text, type) {
  if (type == 'currency') {
    let timeIndex = text.indexOf('日期 时间');
    if (timeIndex == -1) {
      timeIndex = text.indexOf('Date Time');
    }
    let deviceIndex = text.indexOf('设备 ID');
    if (deviceIndex == -1) {
      deviceIndex = text.indexOf('Device ID');
    }
    const str = text.substring(timeIndex, deviceIndex);
    return str || text;
  }
  // 新设备端
  if (text.includes('设备 ID') || text.includes('Device ID')) {
    let timeIndex = text.indexOf('日期 时间');
    if (timeIndex == -1) {
      timeIndex = text.indexOf('Date Time');
    }
    const str = text.substring(timeIndex, text.length);
    return str;
  }
  return text;
}
