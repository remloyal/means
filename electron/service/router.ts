import { ipcMain } from 'electron';
import { Device } from './model';
import { findMinMax } from './unitls/tool';
import { deleteDevice, handleDeviceData, queryDevice, queryHistoryDevice, queryHistoryDeviceList, updateDevice } from './controllers/device';

ipcMain.handle('createDevice', (event, params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = handleDeviceData(params);
      resolve(data);
    } catch (error) {
      reject(false);
    }
  });
});

ipcMain.handle('queryDevice', (event, params) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!params) {
        const data = await Device.findAll();
        const todo = data.map(item => item.toJSON());
        resolve(todo);
      } else {
        const data = await queryDevice(params);
        resolve(data);
      }
    } catch (error) {
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
      }else{
        const data = queryHistoryDevice(params);
        resolve(data);
      }
    } catch (error) {
      resolve(false);
    }
  });
});