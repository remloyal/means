import path from 'path';
import fs from 'fs';
import { Device, FileData } from '../model';
import { findMinMax } from '../unitls/tool';
import dayjs from 'dayjs';
import { Op } from 'sequelize';
import { database } from '../db';

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
    dataName: params.csvName.split('.')[0],
    startTime: dayjs(record.firstRecordTime),
    dataCount: todo.length,
    maxTemperature: result.c.max,
    minTemperature: result.c.min,
    maxHumidity: result.humi.max,
    minHumidity: result.humi.min,
    dataStorage_type: 0,
    otherData: JSON.stringify(other_data),
  });

  //   保存数据源
  //   const jsonData = JSON.stringify(todo, null, 2);
  const jsonData = convertToCSV(todo);
  const jsonName = record.getsn + '_' + new Date().getTime();
  const jsonPath = path.join(dbPath, jsonName + '.csv');
  fs.writeFileSync(jsonPath, jsonData);
  await FileData.create({
    path: jsonPath,
    name: jsonName,
    deviceId: data.toJSON().id,
  });
  return data;
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
