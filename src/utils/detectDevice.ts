const fs = require('fs');
const path = require('path');
import { ipcRenderer, ipcMain } from 'electron';
import { createDeviceInstance, setTypePower } from './deviceOperation';
import dayjs from 'dayjs';

/**
 * 从新增的磁盘中读取 .csv 文件
 * @param {*} drive 磁盘
 */
const readCSVFilesFromDrive = async drive => {
  const { drivePath } = drive;
  const files = fs.readdirSync(drivePath);
  const csvFiles = files.filter(file => file.endsWith('.csv'));
  let dataParsed: TimeType[] = [];
  let csvName = '';
  let stopMode = '';
  for (const csvFile of csvFiles) {
    csvName = csvFile;
    const filePath = path.join(drivePath, csvFile);
    const data = fs.readFileSync(filePath, 'utf-8');
    // console.log(`读取到CSV文件 ${csvFile} 的内容：`);
    // console.log(data);
    const { data: todo, stopMode: mode } = parseCSVData(data);
    dataParsed = todo;
    stopMode = mode;
  }
  return [drive, dataParsed, csvName, stopMode];
};

/**
 * 解析 csv 数据
 * @param {String} csvString csv 数据
 * @returns 解析后的数据
 */
const parseCSVData = csvString => {
  const lines = csvString.split('\n');
  const data: TimeType[] = [];
  // Stop Mode,USB Stop,
  const stopMode = lines[1].split(',');
  // 我们从第3行开始处理，因为前几行包含元数据或标题。
  for (let i = 3; i < lines.length; i++) {
    const line: string = lines[i].trim();
    if (!line) continue; // 跳过空行
    if (line.indexOf('Output') != -1) break; //结束语句
    const fields = line.split(',');

    const date = fields[0];
    const time = fields[1];
    const celsius = parseFloat(fields[2]);
    const temperature = parseFloat(fields[3]);
    const humi = parseFloat(fields[4]);
    // 合并日期和时间为一个时间戳字符串
    const dateTimeString = `${date} ${time}`;
    /* eslint-disable */
    const dateTimeParts = dateTimeString.split(/[\/ :]/).map(Number);
    const timeStamp = dayjs(
      new Date(
        dateTimeParts[2],
        dateTimeParts[1] - 1,
        dateTimeParts[0],
        dateTimeParts[3],
        dateTimeParts[4],
        dateTimeParts[5]
      ).valueOf()
    ).format('YYYY-MM-DD HH:mm:ss');
    data.push({
      timeStamp,
      c: celsius,
      f: temperature,
      humi: humi || 0,
    });
  }

  return { data, stopMode: stopMode[1] };
};

export let usbData;
ipcRenderer.on('deviceInsertion', async (event, data) => {
  console.log('deviceInsertion==>', data);
  if (usbData) return;
  loadUsbData(data);
});

export const loadUsbData = async data => {
  if (!data) return;
  // 获取csv数据
  window.eventBus.emit('loading');
  usbData = data;
  const csvData = await readCSVFilesFromDrive(data);
  if (data) {
    try {
      const operation = await createDeviceInstance(data);
      operation.getData().then(async res => {
        if (csvData.length > 0) {
          operation.drive = csvData[0];
          await operation.setCsvData(csvData[1]);
          operation.csvName = csvData[2];
          operation.record.stopMode = csvData[3].split(' ')[0];
        }
        const data = await ipcRenderer.invoke('createDevice', Object.assign({}, operation));
        operation.database = data;
        console.log(operation);
        window.eventBus.emit('friggaDevice:in', Object.assign({}, operation));
        window.eventBus.emit('loadingCompleted');
      });
    } catch (error) {
      window.eventBus.emit('loadingCompleted', {
        error: 'The application does not support this device!',
      });
      usbData = null;
      // console.log(error);
    }
  }
};

ipcRenderer.on('deviceRemoval', async (event, data) => {
  console.log('deviceRemoval==>', data);
  if (data && data?.name == usbData?.name) {
    usbData = null;
    window.eventBus.emit('friggaDevice:out');
    setTypePower();
  }
});
