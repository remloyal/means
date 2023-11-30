import { filePath } from '../../unitls/unitls';
import fs from 'fs';
import path from 'path';
import { fork, ChildProcess } from 'child_process';
import content from './content';
import { BrowserWindow, ipcMain } from 'electron';
import log from '../../pdfgen/log';

const targetPath = filePath('static');
let mainWindow: BrowserWindow | null = null;
let hidProcess: ChildProcess | null;

interface HidEvent<T> {
  event: string;
  data: T;
}

interface HidEventData {
  path: string;
  value: any;
}
const targetFileName = `${targetPath}/thread.js`;
if (!fs.existsSync(targetFileName)) {
  fs.writeFileSync(targetFileName, content);
}
const createThread = () => {
  try {
    // 创建子进程
    hidProcess = fork(path.join(targetFileName));
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

    hidProcess.on('error', err => {
      log.error('子进程发生错误:', err);
      hidProcess?.kill();
      hidProcess = null;
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
  if (!hidProcess) {
    await createThread();
  }
  return new Promise(async (resolve, reject) => {
    try {
      await hidProcess?.send({
        event: 'hidWrite',
        data: { ...params, value: stringToUint8Array(params.value) },
      });
      hidProcess?.on('message', message => {
        const msg = message as HidEvent<any>;
        if (msg.event === 'hidData') {
          //   console.log('收到 hidData:', msg.data);
          resolve(msg.data);
        }
      });
    } catch (error) {
      resolve(false);
    }
  });
});

ipcMain.handle('hidClose', (event, params: HidEventData) => {
  hidProcess?.send({ event: 'hidClose', data: params });
  //   hidProcess?.kill();
  //   hidProcess = null;
  //   console.log(hidProcess);
});

function stringToUint8Array(str): number[] {
  const tmpUint8Array = str.split('').map(e => e.charCodeAt(0));
  tmpUint8Array.unshift(1);
  return tmpUint8Array;
}
