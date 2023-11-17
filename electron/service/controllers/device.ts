import path from 'path';
import fs from 'fs';
import { Device, FileData } from '../model';
import { findMinMax, parseCSVData } from '../unitls/tool';
import dayjs from 'dayjs';
import { Op } from 'sequelize';
import { database } from '../db';
import { decrypt, encrypt } from '../unitls/encryption';

const appPath = path.resolve(process.cwd());
const dbPath = path.join(appPath, 'resources', 'cache');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
}

// 处理device数据
export const handleDeviceData = async params => {
  const todo = params.csvData;
  const record = params.record;
  const result = await findMinMax(todo);
  const other_data = { ...params, csvData: null };
  const data = await Device.create({
    type: record.deviceType,
    gentsn: record.getsn,
    dataName: `${record.getsn}_${dayjs(new Date()).format('YYYYMMDDHHmmss')}`,
    startTime: dayjs(record.firstRecordTime),
    dataCount: todo.length,
    temperature: JSON.stringify(result.c),
    fahrenheit: JSON.stringify(result.f),
    humidity: JSON.stringify(result.humi),
    dataStorage_type: 0,
    otherData: JSON.stringify(other_data),
  });

  //   保存数据源
  //   const jsonData = JSON.stringify(todo, null, 2);
  const jsonData = convertToCSV(todo);
  const encryptText = encrypt(jsonData);
  const jsonName = record.getsn + '_' + new Date().getTime();
  const jsonPath = path.join(dbPath, jsonName + '.dewav');
  fs.writeFileSync(jsonPath, encryptText);
  await FileData.create({
    path: jsonPath,
    name: jsonName,
    deviceId: data.toJSON().id,
  });
  return data.toJSON();
};

interface Data {
  c: number;
  f: number;
  humi: number;
  timeStamp: string;
}
function convertToCSV(data: Data[]): string {
  let csv = 'timeStamp,c,f,humi\n'; // CSV 文件的头部
  for (const { c, f, humi, timeStamp } of data) {
    csv += `${timeStamp},${c},${f},${humi}\n`; // 将每行数据格式化为 CSV 格式的字符串
  }
  return csv;
}

export const queryDevice = async params => {
  // const data = await Device.findAll({...query});
  const data = await Device.findAll({
    // group: [database.col('date')],
    where: {
      startTime: {
        [Op.gte]: new Date(params[0]), // 查询大于当前时间的记录
        [Op.lt]: new Date(params[1]),
      },
    },
  });
  const todo = data.map(item => item.toJSON());
  return todo;
};

export const deleteDevice = async params => {
  const t = await database.transaction();
  const queryParameters: { id: string | number }[] = [];
  params.forEach(element => {
    queryParameters.push({
      id: element.id,
    });
  });
  try {
    await Device.destroy({
      where: {
        [Op.or]: queryParameters,
      },
    });
    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    return false;
  }
};

export const updateDevice = async params => {
  const t = await database.transaction();
  try {
    const device = await Device.findOne({ where: { id: params.id } });
    if (!device) {
      return false;
    }
    device.update({ notes: params.notes });
    await device.save();
    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    return false;
  }
};

export const queryHistoryDevice = async params => {
  try {
    const file = await FileData.findOne({ where: { deviceId: params.id } });
    if (!file) {
      return false;
    }
    const data = fs.readFileSync(file.toJSON().path);
    const decryptText = decrypt(data.toString());
    const todo = parseCSVData(decryptText);
    const deviceData = JSON.parse(params.otherData);
    deviceData.csvData = todo;
    return deviceData;
  } catch (error) {
    return false;
  }
};

export const queryHistoryDeviceList = async (params: number[]) => {
  try {
    const deviceList = await Device.findAll({ where: { id: params } });
    const files = await FileData.findAll({ where: { deviceId: params } });
    const dataList: any[] = [];
    for (let index = 0; index < deviceList.length; index++) {
      const element = deviceList[index].toJSON();
      const file = files[index].toJSON();
      const data = getDeviceList(element, file);
      dataList.push(data);
    }
    return dataList;
  } catch (error) {
    return [];
  }
};

const getDeviceList = (device, file) => {
  const data = fs.readFileSync(file.path);
  const decryptText = decrypt(data.toString());
  const todo = parseCSVData(decryptText);
  device.csvData = todo;
  return device;
};
