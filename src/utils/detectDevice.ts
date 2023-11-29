const HID = require('node-hid');
const drivelist = require('drivelist');
const fs = require('fs');
const path = require('path');
import { ipcRenderer, ipcMain } from 'electron';
import { createDeviceInstance } from './deviceOperation';
import dayjs from 'dayjs';

let previousDevices: any[] = [];
let previousDrives: any[] = [];

const getFriggaDevice = devices => {
  const VERSION_ID = 10473; // 1003
  const PRODUCT_ID = 631; // 517
  return devices.filter(
    device =>
      device.vendorId &&
      device.productId &&
      device.vendorId === VERSION_ID &&
      device.productId === PRODUCT_ID
  );
};

/**
 * 从新增的磁盘中读取 .csv 文件
 * @param {*} drive 磁盘
 */
const readCSVFilesFromDrive = async drive => {
  const drivePath = drive.mountpoints[0].path;
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
    // console.log(`解析后得到的数据：`)
    // console.log(dataParsed);
    // window.eventBus.emit('friggaDevice:in', dataParsed);
    window.eventBus.emit('friggaDeviceCsv', [drive, dataParsed]);
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
    if (line.indexOf('Output') != -1) continue; //结束语句
    const fields = line.split(',');

    const date = fields[0];
    const time = fields[1];
    const celsius = parseFloat(fields[2]);
    const temperature = parseFloat(fields[3]);
    const humi = parseFloat(fields[4]);
    // 合并日期和时间为一个时间戳字符串
    const dateTimeString = `${date} ${time}`;
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

ipcRenderer.on('deviceOnload', async (event, data) => {
  previousDevices = await HID.devices();
  previousDrives = await drivelist.list();
});

ipcRenderer.on('deviceInsertion', async (event, data) => {
  const currentDevices = HID.devices();
  const drives = await drivelist.list();
  const newDrives = drives.filter(d => !previousDrives.some(pd => pd.device === d.device));
  let csvData = <any>[];
  for (const newDrive of newDrives) {
    csvData = await readCSVFilesFromDrive(newDrive);
  }

  const newDevices = currentDevices.filter(d => !previousDevices.some(pd => pd.path === d.path));
  const friggaDevices = getFriggaDevice(newDevices);
  if (friggaDevices.length > 0) {
    try {
      let operation = await createDeviceInstance(friggaDevices[0]);
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
      });
    } catch (error) {
      console.log(error);
    }
  }
  previousDevices = currentDevices;
  previousDrives = drives;
});

ipcRenderer.on('deviceRemoval', async (event, data) => {
  previousDevices = await HID.devices();
  previousDrives = await drivelist.list();
  if (data) {
    window.eventBus.emit('friggaDevice:out');
  }
});
