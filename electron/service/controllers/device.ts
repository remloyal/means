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
import axios from 'axios';
import { getPdfUrl } from '../../unitls/unitls';
import { shell } from 'electron';
import { downloadFiles } from '../../main/index';

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
  const oldData = await Device.findOne({
    where: {
      dataName: params.csvName,
      gentsn: record.getsn,
      type: record.deviceType,
      mode: record.mode,
    },
  });
  if (oldData) {
    oldData.update({
      type: record.deviceType,
      gentsn: record.getsn,
      dataName: params.csvName || `${record.getsn}_${dayjs(new Date()).format('YYYYMMDDHHmmss')}`,
      startTime: dayjs(record.firstRecordTime),
      dataCount: todo.length,
      temperature: JSON.stringify(result.c),
      fahrenheit: JSON.stringify(result.f),
      humidity: JSON.stringify(result.humi),
      dataStorage_type: 0,
      otherData: JSON.stringify(other_data),
      alarm: result.c.max > record.hightEmp ? 1 : result.c.min < record.lowtEmp ? 1 : 0,
      mode: record.mode,
    });
    await oldData.save();
    return oldData.toJSON();
  } else {
    const data = await Device.create({
      type: record.deviceType,
      gentsn: record.getsn,
      dataName: params.csvName || `${record.getsn}_${dayjs(new Date()).format('YYYYMMDDHHmmss')}`,
      startTime: dayjs(record.firstRecordTime),
      dataCount: todo.length,
      temperature: JSON.stringify(result.c),
      fahrenheit: JSON.stringify(result.f),
      humidity: JSON.stringify(result.humi),
      dataStorage_type: 0,
      otherData: JSON.stringify(other_data),
      alarm: result.c.max > record.hightEmp ? 1 : result.c.min < record.lowtEmp ? 1 : 0,
      mode: record.mode,
      timeZone: record.timeZone,
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
  }
};

export const queryDevice = async params => {
  console.log(params);
  const { time } = params;
  if (time.length > 0 && time[0] != '' && time[1] != '') {
    const data = await Device.findAll({
      // group: [database.col('date')],
      where: {
        createdAt: {
          [Op.gte]: new Date(time[0]), // 查询大于当前时间的记录
          [Op.lte]: new Date(time[1]),
        },
      },
    });
    const todo = data.reverse().map(item => item.toJSON());
    return todo;
  } else {
    const data = await Device.findAll();
    const todo = data.reverse().map(item => item.toJSON());
    return todo;
  }
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

export const deviceHelp = async (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const pdfUrl = getPdfUrl();
    log.error('pdfUrl', pdfUrl);
    if (!fs.existsSync(PATH_PARAM.PDF_PATH)) {
      fs.mkdirSync(PATH_PARAM.PDF_PATH);
    }
    const pdfPath = path.join(PATH_PARAM.PDF_PATH, 'M_tool_help.pdf');
    try {
      await downloadFiles(pdfUrl, pdfPath);
      // shell.openExternal(`file://${pdfPath}`);
      shell.openPath(pdfPath);
      //shell.showItemInFolder(pdfPath);
      resolve(true);
    } catch (err) {
      if (fs.existsSync(pdfPath)) {
        // shell.openExternal(`file://${pdfPath}`);
        shell.openPath(pdfPath);
        //shell.showItemInFolder(pdfPath);
      }
      log.error(err);
      resolve(false);
    }
  });
};
