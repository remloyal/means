import { ipcMain } from 'electron';
import { Device } from './model';
import {
  deleteDevice,
  handleDeviceData,
  queryDevice,
  queryHistoryDevice,
  queryHistoryDeviceList,
  updateDevice,
} from './controllers/device';
import { exportDevicePdf } from './controllers/exportDevice';
import { exportHistory } from './controllers/exportHistory';
import { importPDF } from './pdfRead/pdfRead';
import log from '../unitls/log';

ipcMain.handle('createDevice', (event, params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = handleDeviceData(params);
      resolve(data);
    } catch (error) {
      log.error(error);
      reject(false);
    }
  });
});

ipcMain.handle('queryDevice', (event, params) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!params) {
        const data = (await Device.findAll()).reverse();
        const todo = data.map(item => item.toJSON());
        resolve(todo);
      } else {
        const data = await queryDevice(params);
        resolve(data);
      }
    } catch (error) {
      log.error(error);
      reject(false);
    }
  });
});

ipcMain.handle('updateDevice', (event, params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = updateDevice(params);
      resolve(data);
    } catch (error) {
      log.error(error);
      resolve(false);
    }
  });
});

ipcMain.handle('deleteDevice', (event, params) => {
  return new Promise((resolve, reject) => {
    try {
      const data = deleteDevice(params);
      resolve(data);
    } catch (error) {
      log.error(error);
      resolve(false);
    }
  });
});

ipcMain.handle('queryHistoryDevice', (event, params) => {
  return new Promise((resolve, reject) => {
    try {
      if (params instanceof Array) {
        const data = queryHistoryDeviceList(params);
        resolve(data);
      } else {
        const data = queryHistoryDevice(params);
        resolve(data);
      }
    } catch (error) {
      log.error(error);
      resolve(false);
    }
  });
});

// 导出数据
ipcMain.handle('exportDevice', (event, params) => {
  return new Promise((resolve, reject) => {
    try {
      const data = exportDevicePdf(params);
      resolve(data);
    } catch (error) {
      log.error(error);
      resolve(false);
    }
  });
});

// 导出历史分析
ipcMain.handle('exportHistory', (event, params) => {
  return new Promise((resolve, reject) => {
    try {
      const data = exportHistory(params);
      resolve(data);
    } catch (error) {
      log.error(error);
      resolve(false);
    }
  });
});

// 导入历史分析
ipcMain.handle('importPDF', (event, params) => {
  return new Promise((resolve, reject) => {
    try {
      const data = importPDF();
      resolve(data);
    } catch (error) {
      log.error(error);
      resolve(false);
    }
  });
});
