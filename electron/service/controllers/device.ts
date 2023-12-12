import path from 'path';
import fs from 'fs';
import { Device, FileData } from '../model';
import { convertToCSV, findMinMax, getDuration, parseCSVData } from '../../unitls/tool';
import dayjs from 'dayjs';
import { Op } from 'sequelize';
import { database } from '../db';
import { decrypt, encrypt } from '../../unitls/encryption';
import log from '../../unitls/log';
import { PATH_PARAM } from '../../config';

if (!fs.existsSync(PATH_PARAM.CACHE_PATH)) {
  fs.mkdirSync(PATH_PARAM.CACHE_PATH);
}
export const dbPath = path.join(PATH_PARAM.CACHE_PATH, dayjs().format('YYYY-MM'));
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
}

// 处理device数据
export const handleDeviceData = async params => {
  const todo = params.csvData;
  const { record } = params;
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
    alarm: result.c.max > record.highHumi ? 1 : 0,
  });

  //   保存数据源
  //   const jsonData = JSON.stringify(todo, null, 2);
  const jsonData = convertToCSV(todo);
  const encryptText = encrypt(jsonData);
  const jsonName = `${record.getsn}_${new Date().getTime()}`;
  const jsonPath = path.join(dbPath, `${jsonName}.dewav`);
  fs.writeFileSync(jsonPath, encryptText);
  await FileData.create({
    path: jsonPath,
    name: jsonName,
    deviceId: data.toJSON().id,
  });
  return data.toJSON();
};

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
  const fileParameters: { deviceId: string | number }[] = [];
  params.forEach(element => {
    queryParameters.push({
      id: element.id,
    });
    fileParameters.push({
      deviceId: element.id,
    });
  });
  try {
    await Device.destroy({
      where: {
        [Op.or]: queryParameters,
      },
    });
    const file_data = await FileData.findAll({
      where: {
        [Op.or]: fileParameters,
      },
    });
    file_data.forEach(item => {
      const file = item.toJSON();
      fs.unlinkSync(file.path);
      item.destroy();
    });

    await t.commit();
    return true;
  } catch (error) {
    log.error(error);
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
    log.error(error);
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
    const deviceData = params.otherData;
    deviceData.csvData = todo;
    deviceData.database = params;
    return deviceData;
  } catch (error) {
    log.error(error);
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
    log.error(error);
    return [];
  }
};

const getDeviceList = (device, file) => {
  const data = fs.readFileSync(file.path);
  const decryptText = decrypt(data.toString());
  const todo = parseCSVData(decryptText);
  const duration = getDuration(todo);
  device.csvData = todo;
  device.duration = duration;
  return device;
};
