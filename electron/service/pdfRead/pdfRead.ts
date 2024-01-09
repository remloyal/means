import { dialog } from 'electron';
// import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';
import path from 'path';
import { pdfType } from './pdfType';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { c2f, convertToCSV, f2c, findMinMax, formatUtc } from '../../unitls/tool';
import { Device, FileData } from '../model';
import { encrypt } from '../../unitls/encryption';
import { dbPath } from '../controllers/device';
import { importPDFFile } from './pdfOperate';
dayjs.extend(customParseFormat);
import log from '../../unitls/log';
import { win } from '../../main/index';

export const importPDF = async () => {
  const filePaths: string[] | boolean = await openFile();
  if (!filePaths) return 'nopath';
  if (filePaths instanceof Array && filePaths.length == 0) return 'nopath';
  try {
    const fileList = filePaths as string[];
    const message = { success: 0, error: 0 };
    for (let i = 0; i < fileList.length; i++) {
      const filePath = filePaths[i];
      try {
        const pdfReadData = await importPDFFile(filePath);
        const pdfFormatData = await setFormatData(pdfReadData);
        await handlePdf(pdfFormatData, filePath);
        message.success++;
      } catch (error) {
        message.error++;
        log.error(`PDF导入失败： ${filePath}`, error);
      }
    }
    return message;
  } catch (error) {
    log.error('PDF导入失败：', error);
    return false;
  }
};

const handlePdf = async (params, filePath) => {
  const filename = path.basename(filePath);
  const todo = params.csvData;
  const { record } = params;
  const { result } = params;
  const other_data = { ...params, csvData: null };
  const data = await Device.create({
    type: record.deviceType,
    gentsn: record.getsn,
    dataName:
      filename.split('.')[0] || `${record.getsn}_${dayjs(new Date()).format('YYYYMMDDHHmmss')}`,
    startTime: dayjs(record.firstRecordTime),
    dataCount: todo.length || 0,
    temperature: JSON.stringify(result.c),
    fahrenheit: JSON.stringify(result.f),
    humidity: JSON.stringify(result.humi),
    dataStorage_type: 0,
    otherData: JSON.stringify(other_data),
    alarm: result.c.max > record.hightEmp ? 1 : result.c.min < record.lowtEmp ? 1 : 0,
    mode: record.mode || 5,
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
};

const setFormatData = async data => {
  const { csvData } = data;
  const result = await findMinMax(csvData);
  const firstRecordTime = dayjs(csvData[0].timeStamp).format('YYYY-MM-DD HH:mm:ss');
  const lastRecordedTime = dayjs(csvData[csvData.length - 1].timeStamp).format(
    'YYYY-MM-DD HH:mm:ss'
  );

  const startDelay = parseInt(
    data.startDelay.trim().replace('Mins', '').replace('Min', '').replace('-', '') || 0
  );
  const logInterval = parseInt(data.logInterval.trim().replace('Mins', '').replace('Min', '') || 0);
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
      firstRecordTime,
      lastRecordedTime,
      maximumValue: result.c.max,
      minimumValue: result.c.min,
      timeZone: data.timeZone || 'UTC+08:00',
      firmwareVersion: data.firmwareVersion || '',
      hardwareVersion: data.hardwareVersion || '',
      stopMode: data.stopMode,
      shipmentId: data.shipmentId || null,
      shipment: data.shipment || null,
    },
    operateConfig: {},
    isComplete: true,
    actionList: [],
    csvData,
    csvName: '',
    markList: [],
    drive: {},
    param: '',
  };
};

const openFile = (): Promise<string[] | boolean> => {
  return new Promise((resolve, reject) => {
    dialog
      .showOpenDialog(win!, {
        properties: ['openFile', 'multiSelections'],
        filters: [
          {
            name: '',
            extensions: ['pdf'],
          },
        ],
      })
      .then(result => {
        if (!result.canceled) {
          resolve(result.filePaths);
        } else {
          resolve(false);
          console.log('取消选择===>', result);
        }
      });
  });
};

// 查询PDF UTC
export const deviceUtcUpdate = async param => {
  // console.log(param);
  const { drive, database, record, csvTimeZone } = param;
  const oldData = await Device.findOne({
    where: {
      gentsn: database.gentsn,
      type: database.type,
      id: database.id,
    },
  });
  if (!oldData) return false;
  if (csvTimeZone) {
    oldData.update({
      timeZone: formatUtc(csvTimeZone),
    });
    await oldData.save();
    return oldData.toJSON();
  }
  if (drive.drivePath) {
    const files = fs.readdirSync(drive.drivePath);
    console.log(files);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    if (pdfFiles.length == 0 || !pdfFiles) {
      return false;
    }
    const pdfFile = pdfFiles[0];
    const filePath = path.join(drive.drivePath, pdfFile);
    const pdfReadData = await importPDFFile(filePath as string, record.pdfPwd || '', true);
    if (pdfReadData.timeZone) {
      oldData.update({
        timeZone: pdfReadData.timeZone,
      });
      await oldData.save();
      return oldData.toJSON();
    }
  }
  return false;
};
