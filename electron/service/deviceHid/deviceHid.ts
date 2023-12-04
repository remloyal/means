import { filePath } from '../../unitls/unitls';
import fs from 'fs';
import path from 'path';
import content from './content';
import { BrowserWindow, app, ipcMain, utilityProcess } from 'electron';
import log from '../../pdfgen/log';
import drivelist from 'drivelist';
import HID from 'node-hid';

const targetPath = filePath('static');
let mainWindow: BrowserWindow | null = null;
export let hidProcess: Electron.UtilityProcess | null;

interface HidEvent<T> {
  event: string;
  data: T;
}

interface HidEventData {
  path: string;
  value: any;
  key: string;
}

const VERSION_ID = 10473; // 1003
const PRODUCT_ID = 631; // 517
let targetFileName = path.join(process.cwd(), './public/thread.js');

if (app.isPackaged) {
  targetFileName = filePath('./app.asar/dist/thread.js');
}

log.info('targetFileName ==>', targetFileName);
const createThread = async () => {
  try {
    // 创建子进程
    hidProcess = utilityProcess.fork(targetFileName, process.argv, { cwd: targetPath });
    hidProcess.on('message', message => {
      // 判断事件类型并触发对应的事件处理函数
      const msg = message as HidEvent<any>;
      if (msg.event === 'hidError') {
        log.error('子进程发生错误 hidError:', msg.data);
        hidProcess?.kill();
        hidProcess = null;
        mainWindow?.webContents.send('hidError', msg.data);
      }
    });

    hidProcess.on('exit', err => {
      log.info('子进程发生退出 exit:', err);
      hidProcess?.kill();
      hidProcess = null;
      // mainWindow?.webContents.send('hidError', err);
    });
  } catch (error) {
    log.error(error);
  }
};

export const initGidThread = win => {
  mainWindow = win;
  createThread();
};

ipcMain.handle('hidWrite', async (event, params: HidEventData) => {
  const data = await hidWrite(params);
  return data;
});

ipcMain.handle('hidClose', (event, params: HidEventData) => {
  hidProcess?.postMessage({ event: 'hidClose', data: params });
  // hidProcess?.kill();
  // hidProcess = null;
  //   console.log(hidProcess);
  Object.values(timeout).map((e: any) => {
    e && clearTimeout(e);
  });
  timeout = {};
});

function stringToUint8Array(str): number[] {
  const tmpUint8Array = str.split('').map(e => e.charCodeAt(0));
  tmpUint8Array.unshift(1);
  return tmpUint8Array;
}

let timeout: any = {};
const hidWrite = async (params): Promise<{ key: string; value: string } | boolean> => {
  // log.info('hidWrite ===>', JSON.stringify(params));
  if (!hidProcess) {
    await createThread();
  }
  return new Promise(async (resolve, reject) => {
    try {
      hidProcess?.postMessage({
        event: 'hidWrite',
        data: { ...params, value: stringToUint8Array(params.value) },
      });
      hidProcess?.on('message', message => {
        const msg = message as HidEvent<any>;
        if (msg.event === 'hidData') {
          //   console.log('收到 hidData:', msg.data);
          resolve(msg.data);
        }
        clearTimeout(timeout[params.key]);
        timeout[params.key] = null;
      });
      timeout[params.key] = setTimeout(() => {
        log.info('子进程读取超时...');
        hidProcess?.kill();
        hidProcess = null;
        timeout[params.key] && clearTimeout(timeout[params.key]);
        timeout[params.key] = null;
        resolve({ key: params.key, value: '' });
      }, 10000);
    } catch (error) {
      resolve(false);
    }
  });
};

// 筛选匹配路径
let deviceUsbList: any = [];
export const filterUsbList = async () => {
  const list = await drivelist.list();
  const fileListPath: any = [];
  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    if (element.isUSB) {
      let names = '';
      const files = fs.readdirSync(element.mountpoints[0].path, {
        withFileTypes: true,
      });
      files.forEach(item => {
        names += `${item.name} `;
      });

      fileListPath.push({
        drivePath: element.mountpoints[0].path,
        names: names,
      });
    }
  }

  const hidList: any = [];
  const previousDevices = await HID.devices();
  for (let index = 0; index < previousDevices.length; index++) {
    const element = previousDevices[index];
    // productId  vendorId
    if (element.productId === PRODUCT_ID && element.vendorId === VERSION_ID) {
      const getsn: any = await hidWrite({ key: 'getsn', value: 'AT+GETSN:', path: element.path });
      hidList.push({ ...element, name: getsn.value.split(':')[1].replaceAll(';', '') });
      await hidProcess?.postMessage({ event: 'hidClose' });
    }
  }

  const usbList: any = [];
  for (let index = 0; index < hidList.length; index++) {
    const hidData = hidList[index];
    for (let index = 0; index < fileListPath.length; index++) {
      const fileData = fileListPath[index];
      if (fileData.names.includes(hidData.name)) {
        usbList.push({
          ...fileData,
          ...hidData,
        });
      }
    }
  }

  // 默认返回第一个
  if (deviceUsbList.length == 0) {
    deviceUsbList.push(...usbList);
    return deviceUsbList[0];
  }
  //对比是增加还是减少
  console.log('设备对比 ==>', usbList.length, deviceUsbList.length);
  if (usbList.length > deviceUsbList.length) {
    let data = {};
    for (let i = 0; i < usbList.length; i++) {
      const usbData = usbList[i];
      let state = false;
      for (let j = 0; j < deviceUsbList.length; j++) {
        const deviceData = deviceUsbList[j];
        if (deviceData.name === usbData.name) {
          state = true;
        }
      }
      if (!state) {
        data = usbData;
        // break;
      }
    }
    deviceUsbList = usbList;
    return data;
  }
  if (usbList.length < deviceUsbList.length) {
    let data = {};
    for (let i = 0; i < deviceUsbList.length; i++) {
      const deviceData = deviceUsbList[i];
      let state = false;
      for (let j = 0; j < usbList.length; j++) {
        const usbData = usbList[j];
        if (deviceData.name === usbData.name) {
          state = true;
        }
      }

      if (!state) {
        data = deviceData;
        // break;
      }
    }
    deviceUsbList = usbList;
    return data;
  }
  return usbList[0];
};

ipcMain.handle('deviceFirst', async (event, params) => {
  const data = await filterUsbList();
  return data;
});
