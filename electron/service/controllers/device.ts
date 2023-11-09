import path from 'path';
import fs from 'fs';
import { Device, FileData } from '../model';
import { findMinMax } from '../unitls/tool';
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
    data_name: params.csvName.split('.')[0],
    start_time: record.firstRecordTime,
    data_count: todo.length,
    max_temperature: result.c.max,
    min_temperature: result.c.min,
    max_humidity: result.humi.max,
    min_humidity: result.humi.min,
    data_storage_type: 0,
    other_data: JSON.stringify(other_data),
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
    device_id: data.toJSON().id,
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
