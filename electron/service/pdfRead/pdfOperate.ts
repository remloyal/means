// import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { pdfType } from './pdfType';
import { c2f, f2c } from '../../unitls/tool';
import pdfjsLib from 'pdfjs-dist';
dayjs.extend(customParseFormat);
import log from '../../pdfgen/log';

// let pdfjsLib;
export const importPDFFile = async (filePath: string) => {
  // if (!pdfjsLib) {
  //   pdfjsLib = await import('pdfjs-dist');
  // }
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = pdfjsLib.getDocument(data);
  let lang = 'en'; //zh
  let type = pdfType[lang];
  const list: any = [];
  let total = 0;
  await loadingTask.promise.then(
    async function (pdf) {
      total = pdf.numPages;
      // PDF 文件解析成功后的回调函数
      // 在这里你可以访问 PDF 文件的所有内容

      for (let index = 1; index <= pdf.numPages; index++) {
        // const element = array[index];
        if (index == 1) {
        }
        const textContent = await pdf.getPage(index).then(function (page) {
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
    function (reason) {
      // PDF 文件解析失败后的回调函数
      log.error(reason);
      console.error(reason);
    }
  );

  //   console.log(list);
  let deviceInstance;
  deviceInstance = await readFirst(list[0], type);

  let csvData: any = [];
  for (let index = 1; index < list.length; index++) {
    const element = list[index];
    const todo = await readData(element, deviceInstance, `${index + 1}/${list.length}`);
    csvData.push(...todo);
  }
  deviceInstance.csvData = csvData;
  const threshold = await getThreshold(deviceInstance.threshold, deviceInstance.type);
  //   console.log(deviceInstance, csvData.length);
  return { ...deviceInstance, ...threshold };
  // console.log(csvData);
};

const readFirst = (text, type) => {
  const data = text.replace('ALARM', '').replace('www.friggatech.com', '').replace('®', ' ');
  data.slice(0, data.lastIndexOf('Record Chart'));
  let rule;
  let todo = { type: '' };
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
        log.error(error);
        // console.log(error);
      }
    });
  });
  console.log(todo);
  return todo;
};

const readData = async (text, todo, pageFooting) => {
  let size = 2;
  let key = '';
  let unit = '°C';
  if (text.includes('°C') || text.includes('℃')) {
    size += 1;
    key = '°C';
  }
  if (text.includes('℉')) {
    size += 1;
    key = '℉';
    unit = '℉';
  }
  if (text.includes('RH')) {
    size += 1;
    key = 'RH';
  }
  text.replace(`wwww.friggatech.com`, '');
  let data = text.replace(`wwww.friggatech.com`, '').replace(pageFooting, '').trim();
  data = await formatText(data);
  var chunkedData = splitData(data, size, unit, todo);
  return chunkedData;
};
function splitData(data, size, unit, todo) {
  var result: any = [];
  const format = todo.timeFormat
    ? `${todo.timeFormat.split(' ')[0]} HH:mm:ss`
    : 'DD-MM-YY HH:mm:ss';
  const chunkSize = size == 4 ? 22 : size == 3 ? 20 : 20;
  // 23-11-1005:28:1971.466
  for (var i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const time = chunk.slice(0, 8);
    const temp = chunk.slice(8, 16);

    const heat = size == 3 ? chunk.slice(-4) : chunk.slice(-6, -2);
    const hum = size == 3 ? 0 : chunk.slice(-2);
    let c;
    let f;
    if (unit == '℉') {
      c = f2c(parseFloat(heat));
      f = heat;
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

function formatText(text) {
  const rule = [
    'www.friggatech.com',
    'Date',
    'Time',
    'RH',
    '%RH',
    '日期',
    '时间',
    '°C',
    '°F',
    '℃',
    '℉',
    '期',
    '…',
    ' ',
  ];
  let character = text;
  rule.forEach(item => {
    character = character.replaceAll(item, '');
  });
  return character.trim();
}

// 温湿度 阈值
function getThreshold(data, type) {
  console.log('getThreshold===>', data);
  if (!data) {
    return { hightEmp: 0, lowtEmp: 0, highHumi: 0, lowHumi: 0 };
  }
  // const text = type == 'currency' ? data.split('：')[1].trim() : data.split(':')[1].trim();
  let text = '';
  try {
    text = data.split('：')[1].trim();
  } catch (error) {
    text = data.split(':')[1].trim();
  }
  // 温度、湿度
  if (
    (text.includes('℃') || text.includes('°C')) &&
    (text.includes('RH') || text.includes('%RH'))
  ) {
    const data = text
      .replaceAll('℃', ',')
      .replaceAll('°C', ',')
      .replaceAll('%RH', ',')
      .replaceAll('RH', ',')
      .replaceAll('～', '')
      .replaceAll('/', '')
      .replaceAll('~', '')
      .replace(/^,+/, '')
      .replace(/,+$/, '')
      .split(',');
    console.log(data);
    return {
      hightEmp: parseFloat(data[1]) || 0,
      lowtEmp: parseFloat(data[0]) || 0,
      highHumi: parseFloat(data[3]) || 0,
      lowHumi: parseFloat(data[2]) || 0,
    };
  }
  // 只有温度
  if (
    (text.includes('℃') || text.includes('°C')) &&
    (!text.includes('RH') || !text.includes('%RH'))
  ) {
    console.log(text);
    const data = text
      .replaceAll('℃', ',')
      .replaceAll('°C', ',')
      .replaceAll('%RH', ',')
      .replaceAll('RH', ',')
      .replaceAll('～', '')
      .replaceAll('~', '')
      .replaceAll('/', '')
      .replace(/^,+/, '')
      .replace(/,+$/, '')
      .split(',');
    return {
      hightEmp: parseFloat(data[1]) || 0,
      lowtEmp: parseFloat(data[0]) || 0,
      highHumi: 0,
      lowHumi: 0,
    };
  }
  return { hightEmp: 0, lowtEmp: 0, highHumi: 0, lowHumi: 0 };
}
