import { ipcMain } from 'electron';
import { Device } from './model';
import { findMinMax } from './unitls/tool';
import { handleDeviceData } from './controllers/device';

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

ipcMain.handle('query:db', (event, params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await Device.findAll();
      resolve(data);
    } catch (error) {
      reject(false);
    }
  });
});

ipcMain.handle('update:db', (event, params) => {
  return new Promise(async (resolve, reject) => {
    const data = await Device.findAll();
    return data;
  });
});

ipcMain.handle('delete:db', (event, params) => {
  return new Promise((resolve, reject) => {});
});
