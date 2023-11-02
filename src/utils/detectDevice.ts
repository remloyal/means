const HID = require('node-hid');
const drivelist = require('drivelist');
const fs = require('fs');
const path = require('path');
import { ipcRenderer } from 'electron';
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
  for (const csvFile of csvFiles) {
    const filePath = path.join(drivePath, csvFile);
    const data = fs.readFileSync(filePath, 'utf-8');
    // console.log(`读取到CSV文件 ${csvFile} 的内容：`);
    // console.log(data);
    dataParsed = parseCSVData(data);
    // console.log(`解析后得到的数据：`)
    // console.log(dataParsed);
    // window.eventBus.emit('friggaDevice:in', dataParsed);
    window.eventBus.emit('friggaDeviceCsv', [drive, dataParsed]);
  }
  return [drive, dataParsed];
};

/**
 * 解析 csv 数据
 * @param {String} csvString csv 数据
 * @returns 解析后的数据
 */
const parseCSVData = (csvString): TimeType[] => {
  const lines = csvString.split('\n');
  const data: TimeType[] = [];

  // 我们从第3行开始处理，因为前几行包含元数据或标题。
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 跳过空行

    const fields = line.split(',');

    const date = fields[0];
    const time = fields[1];
    const celsius = parseFloat(fields[2]);

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
    console.log(dateTimeParts);

    data.push({
      timeStamp,
      c: celsius,
    });
  }

  return data;
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
    const operation = createDeviceInstance(friggaDevices[0]);
    operation.getData().then(res => {
      operation.drive = csvData[0];
      operation.setCsvData(csvData[1]);
      window.eventBus.emit('friggaDevice:in', operation);
    });
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
