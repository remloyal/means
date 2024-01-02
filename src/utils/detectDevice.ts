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
  //  静默设备 文件会读取错误
  try {
    const files = fs.readdirSync(drivePath);
    console.log(files);
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    let dataParsed: TimeType[] = [];
    let csvName = '';
    let stopMode = '';
    let markList = [];
    if (csvFiles.length === 0) {
      return { drive, csvData: [], csvName: drive.name, stopMode: '--', markList: [] };
    }
    for (const csvFile of csvFiles) {
      csvName = csvFile;
      const filePath = path.join(drivePath, csvFile);
      const data = fs.readFileSync(filePath, 'utf-8');
      // console.log(`读取到CSV文件 ${csvFile} 的内容：`);
      // console.log(data);
      const { data: todo, stopMode: mode, markList: mark } = parseCSVData(data);
      dataParsed = todo;
      stopMode = mode;
      markList = mark;
    }
    return { drive, csvData: dataParsed, csvName: csvName.split('.')[0], stopMode, markList };
  } catch (error) {
    return { drive, csvData: [], csvName: drive.name, stopMode: '--', markList: [] };
  }
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
  let startHandle = false;
  for (let i = 1; i < lines.length; i++) {
    const line: string = lines[i].trim();
    // 查询开始位置
    if (!startHandle) {
      const state = line.includes('Date');
      startHandle = state;
      continue;
    }
    if (!line) continue; // 跳过空行
    if (line.indexOf('Output') != -1) {
      startHandle = false;
      break; //结束语句
    }
    if (!startHandle) continue;
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
  const markList: any = [];
  const markIndex = lines.indexOf('Mark Event Output,');
  if (markIndex != -1) {
    for (let i = markIndex + 1; i < lines.length; i++) {
      const line: string = lines[i].trim();
      if (!line) continue; // 跳过空行
      const fields = line.split(',');
      const date = fields[0];
      const celsius = parseFloat(fields[2]);
      const temperature = parseFloat(fields[3]);
      const humi = parseFloat(fields[4]);
      // 合并日期和时间为一个时间戳字符串
      const dateTime = date.split('/');
      /* eslint-disable */
      // const dateTimeParts = dateTimeString.split(/[\/ :]/).map(Number);
      console.log(dateTime);
      const timeStamp = dayjs(`${dateTime[2]}-${dateTime[1]}-${dateTime[0]} ${fields[1]}`).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      markList.push({
        timeStamp,
        c: celsius,
        f: temperature,
        humi: humi || 0,
      });
    }
  }
  return { data, stopMode: stopMode[1], markList };
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
        operation.drive = csvData.drive;
        await operation.setCsvData(csvData.csvData);
        operation.csvName = csvData.csvName;
        operation.record.stopMode = csvData.stopMode.split(' ')[0];
        operation.markList = csvData.markList;
        const data = await ipcRenderer.invoke('createDevice', Object.assign({}, operation));
        operation.database = data;

        // 获取PDF UTC
        const oldData = await ipcRenderer.invoke('deviceUtcUpdate', Object.assign({}, operation));
        if (oldData) {
          operation.database = oldData;
        }
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
