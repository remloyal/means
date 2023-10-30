const HID = require('node-hid');
const drivelist = require('drivelist');
const fs = require('fs');
const path = require('path');

let previousDevices: any[] = [];
let previousDrives: any[] = [];

const getFriggaDevice = (devices) => {
  // console.log('devices: ', devices)
  const VERSION_ID = 10473; // 1003
  const PRODUCT_ID = 631; // 517

  return devices.filter(device => device.vendorId && device.productId && device.vendorId === VERSION_ID && device.productId === PRODUCT_ID);
};

/**
 * 从新增的磁盘中读取 .csv 文件
 * @param {*} drive 磁盘
 */
const readCSVFilesFromDrive = async (drive) => {
  const drivePath = drive.mountpoints[0].path;
  const files = fs.readdirSync(drivePath);
  const csvFiles = files.filter(file => file.endsWith('.csv'));

  for (const csvFile of csvFiles) {
    const filePath = path.join(drivePath, csvFile);
    const data = fs.readFileSync(filePath, 'utf-8');
    // console.log(`读取到CSV文件 ${csvFile} 的内容：`);
    // console.log(data);
    const dataParsed = parseCSVData(data)
    // console.log(`解析后得到的数据：`)
    // console.log(dataParsed)
    window.eventBus.emit("friggaDevice:in", dataParsed)
  }
};

/**
 * 解析 csv 数据
 * @param {String} csvString csv 数据
 * @returns 解析后的数据
 */
const parseCSVData = (csvString) => {
  const lines = csvString.split('\n');
  const data: any[] = [];

  // 我们从第3行开始处理，因为前几行包含元数据或标题。
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;  // 跳过空行

    const fields = line.split(',');

    const date = fields[0];
    const time = fields[1];
    const celsius = parseFloat(fields[2]);

    // 合并日期和时间为一个时间戳字符串
    const dateTimeString = `${date} ${time}`;
    const dateTimeParts = dateTimeString.split(/[\/ :]/).map(Number);
    const timeStamp = new Date(dateTimeParts[2], dateTimeParts[1] - 1, dateTimeParts[0], dateTimeParts[3], dateTimeParts[4], dateTimeParts[5]).valueOf();

    data.push({
      timeStamp,
      c: celsius
    });
  }

  return data;
};

const checkDevices = async () => {
  const currentDevices = HID.devices();

  const newDevices = currentDevices.filter(
    d => !previousDevices.some(pd => pd.path === d.path)
  );

  const friggaDevices = getFriggaDevice(newDevices);

  if (friggaDevices.length > 0) {
    console.log('监听到 frigga 设备插入：', friggaDevices);

    const drives = await drivelist.list();
    const newDrives = drives.filter(
      d => !previousDrives.some(pd => pd.device === d.device)
    );

    for (const newDrive of newDrives) {
      await readCSVFilesFromDrive(newDrive);
    }

    previousDrives = drives;
  }

  const removedDevices = previousDevices.filter(
    pd => !currentDevices.some(d => d.path === pd.path)
  );

  if (removedDevices.length > 0) {
    // console.log(removedDevices);
    const friggaDevices = getFriggaDevice(removedDevices);

    if (friggaDevices.length > 0) {
      console.log('监听到 frigga 设备拔出：', friggaDevices)
      window.eventBus.emit('friggaDevice:out', friggaDevices)
      previousDrives = await drivelist.list();
    }
  }

  previousDevices = currentDevices;
};

// 每 1000 毫秒检查一次
setInterval(() => {
  checkDevices().catch(err => console.error(err));
}, 1000);
