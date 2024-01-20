import fs from 'fs';
import path from 'path';
import content from './content';
import { BrowserWindow, app, ipcMain, utilityProcess } from 'electron';
import log from '../../unitls/log';
import drivelist from 'drivelist';
import HID from 'node-hid';
import { PATH_PARAM, HID_PARAM } from '../../config';
import { hidGbkKeys, toGBK } from './hidUnit';

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
const targetFileName = PATH_PARAM.THREAD;

log.info('targetFileName ==>', targetFileName);
const createThread = async () => {
  try {
    // 创建子进程
    hidProcess = utilityProcess.fork(targetFileName, process.argv, { cwd: PATH_PARAM.STATIC_PATH });
    hidProcess.on('message', message => {
      // 判断事件类型并触发对应的事件处理函数
      const msg = message as HidEvent<any>;
      if (msg.event === 'hidError') {
        log.error('子进程发生错误 hidError:', msg.data);
        hidProcess?.kill();
        hidProcess = null;
        // mainWindow?.webContents.send('hidError', msg.data);
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

let timeoutClose;
ipcMain.handle('hidClose', (event, params: HidEventData) => {
  // 向hidProcess发送消息，关闭hid
  timeoutClose = setTimeout(() => {
    hidProcess?.postMessage({ event: 'hidClose', data: params });
    clearTimeout(timeoutClose);
    timeoutClose = null;
    Object.values(timeout).map((e: any) => {
      e && clearTimeout(e);
    });
    // 将timeout对象置空
    timeout = {};
  }, 1200);
  // 杀死hidProcess
  // hidProcess?.kill();
  // hidProcess = null;
  //   console.log(hidProcess);
  // 遍历timeout对象，清除每一个timeout
});

function stringToUint8Array(str, key): number[] {
  if (hidGbkKeys.includes(key)) {
    return toGBK(str);
  }
  const buffer = Buffer.from(str, 'utf-8');
  return [1, ...buffer];
}

let timeout: any = {};
const errorCount: any = {};
// hidWrite函数用于执行HID写入操作
const hidWrite = async (params): Promise<{ key: string; value: string } | boolean> => {
  // 如果hidProcess不存在，则创建线程
  if (!hidProcess) {
    await createThread();
  }
  if (timeoutClose) {
    clearTimeout(timeoutClose);
    timeoutClose = null;
  }
  params.delayState = HID_PARAM.DELAY_LIST.includes(params.key) || false;
  if (params.delayState) {
    params.delayTime = HID_PARAM.DELAY_TIME;
  }
  return new Promise(async (resolve, reject) => {
    try {
      // 发送hidWrite事件和参数给hidProcess线程
      hidProcess?.postMessage({
        event: 'hidWrite',
        data: { ...params, value: stringToUint8Array(params.value, params.key) },
      });

      // 监听hidProcess线程的消息
      hidProcess?.on('message', message => {
        const msg = message as HidEvent<any>;
        if (msg.event === 'hidData') {
          // 收到hidData事件时，解析数据并返回
          resolve(msg.data);
        }
        // 清除对应key的超时定时器
        clearTimeout(timeout[params.key]);
        timeout[params.key] = null;
      });

      // 设置超时定时器，1秒后执行超时处理逻辑
      const handleTimeout = () => {
        // 如果该错误已经发生三次，则执行超时处理逻辑
        if (errorCount[params.key] >= 1) {
          log.error(`子进程读取超时==> ${params.key} ${params.value}`);
          hidProcess?.kill();
          hidProcess = null;
          clearTimeout(timeout[params.key]);
          timeout[params.key] = null;
          errorCount[params.key] = 0;
          resolve({ key: params.key, value: '' });
        } else {
          // 增加错误计数
          errorCount[params.key] = (errorCount[params.key] || 0) + 1;
          log.error(`${params.key} 第${errorCount[params.key]} 次读取错误，尝试下次中...`);
          // 重新调用hidWrite函数来重新发送hidWrite事件和参数给hidProcess线程
          hidWrite(params).then(resolve).catch(reject);
        }
      };
      timeout[params.key] = setTimeout(handleTimeout, 1000);
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
      try {
        const files = fs.readdirSync(element.mountpoints[0].path, {
          withFileTypes: true,
        });
        files.forEach(item => {
          names += `${item.name} `;
        });

        fileListPath.push({
          drivePath: element.mountpoints[0].path,
          names,
        });
      } catch (error) {
        fileListPath.push({
          drivePath: element.mountpoints[0].path,
          names,
        });
      }
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

  // 为空可能是静默设备，数据为空
  if (usbList.length == 0 && fileListPath.length == hidList.length) {
    hidList.forEach((item, index) => {
      usbList.push({
        ...fileListPath[index],
        ...item,
      });
    });
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
