import { dialog } from 'electron';
// import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';
import path from 'path';
import { pdfType } from './pdfType';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { c2f, convertToCSV, f2c, findMinMax } from '../../unitls/tool';
import { Device, FileData } from '../model';
import { encrypt } from '../../unitls/encryption';
import { dbPath } from '../controllers/device';
import { importPDFFile } from './pdfOperate';
dayjs.extend(customParseFormat);
import log from '../../pdfgen/log';

export const importPDF = async () => {
  const filePath: string | boolean = await openFile();
  if (!filePath) return false;
  try {
    const pdfReadData = await importPDFFile(filePath as string);
    const pdfFormatData = await setFormatData(pdfReadData);
    const pdfData = await handlePdf(pdfFormatData);
    return pdfData;
  } catch (error) {
    log.error('PDF导入失败：', error);
    return false;
  }
};

const handlePdf = async params => {
  const todo = params.csvData;
  const record = params.record;
  const result = params.result;
  const other_data = { ...params, csvData: null };
  const data = await Device.create({
    type: record.deviceType,
    gentsn: record.getsn,
    dataName: `${record.getsn}_${dayjs(new Date()).format('YYYYMMDDHHmmss')}`,
    startTime: dayjs(record.firstRecordTime),
    dataCount: todo.length || 0,
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

const setFormatData = async data => {
  const csvData = data.csvData;
  const result = await findMinMax(csvData);
  const firstRecordTime = dayjs(csvData[0].timeStamp).format(`YYYY-MM-DD HH:mm:ss`);
  const lastRecordedTime = dayjs(csvData[csvData.length - 1].timeStamp).format(
    `YYYY-MM-DD HH:mm:ss`
  );

  const startDelay = parseInt(data.startDelay.replace('Min', '').replace('Mins', '') || 0);
  const logInterval = parseInt(data.logInterval.replace('Min', '').replace('Mins', '') || 0);
  return {
    result,
    record: {
      setMultidUnit: null,
      setMultidBootMode: null,
      setMultidBootTime: null,
      setMultidSleepTime: null,
      setMultidExpTime: null,
      setStartDelay: null,
      setTempPeriod: null,
      setTime: null,
      setHightEmp: null,
      setLowtEmp: null,
      setHighHumi: null,
      setLowHumi: null,
      setKeyStopEnableset: null,
      setPdfPwd: null,
      setAdjustTime: null,
      setDevreStore: null,
      setDevreSet: null,
      deviceType: data.deviceModel,
      multidUnit: '0',
      multIdBootMode: '0',
      multIdBootTime: '0',
      multIdSleepTime: '0',
      multIdExpTime: '',
      getsn: data.deviceID,
      startDelayTime: startDelay * 60,
      tempPeriod: logInterval * 60,
      time: '',
      hightEmp: data.hightEmp,
      lowtEmp: data.lowtEmp,
      highHumi: data.highHumi,
      lowHumi: data.lowHumi,
      mode: '',
      keyStopEnableget: '',
      pdfPwd: '',
      firstRecordTime: firstRecordTime,
      lastRecordedTime: lastRecordedTime,
      maximumValue: result.c.max,
      minimumValue: result.c.min,
      timeZone: '',
      firmwareVersion: data.firmwareVersion,
      stopMode: data.stopMode,
    },
    operateConfig: {},
    isComplete: true,
    actionList: [],
    csvData: csvData,
    csvName: '',
    drive: {},
    param: '',
  };
};

const openFile = (): Promise<string | boolean> => {
  return new Promise((resolve, reject) => {
    dialog
      .showOpenDialog({
        properties: ['openFile'],
        filters: [
          {
            name: '',
            extensions: ['pdf'],
          },
        ],
      })
      .then(result => {
        if (!result.canceled) {
          resolve(result.filePaths[0]);
        } else {
          resolve(false);
          console.log('取消选择===>', result);
        }
      });
  });
};
