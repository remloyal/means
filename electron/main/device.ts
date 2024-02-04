import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { decrypt, encrypt } from '../unitls/encryption';
import { WebUSB, usb, findByIds } from 'usb';
import { filterUsbList } from '../service/deviceHid/deviceHid';
import log from '../unitls/log';
import { HID_PARAM } from '../config';
const path = require('path');
const fs = require('fs');

let win: BrowserWindow | null = null;
const VERSION_ID = 10473; // 1003
const PRODUCT_ID = 631; // 517

try {
  usb.on('attach', async device => {
    setTimeout(async () => {
      const data = await filterUsbList();
      console.log('attach==>', data);
      win?.webContents.send('deviceInsertion', data);
    }, HID_PARAM.DELAY_HID_TIME);
  });

  usb.on('detach', async device => {
    const data = await filterUsbList();
    console.log('detach ==>', data);
    setTimeout(() => {
      win?.webContents.send('deviceRemoval', data);
    }, HID_PARAM.DELAY_HID_TIME);
  });
} catch (error) {
  console.log(error);
}

export const deviceInit = async (browserWindow: BrowserWindow) => {
  win = browserWindow;
  win.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    console.log('deviceList', deviceList);
  });
  // filterUsbList();
};

ipcMain.handle('export-config', (event, data) => {
  return new Promise(async (resolve, reject) => {
    dialog
      .showSaveDialog(win!, {
        title: '保存文件', // 对话框标题
        // defaultPath: '/path/to/default/folder', // 默认保存路径
        buttonLabel: '保存', // 自定义保存按钮的文本
        filters: [{ name: 'config', extensions: ['dewav'] }],
      })
      .then(result => {
        console.log(result);
        if (result.canceled == false) {
          const jsonData = JSON.stringify(data);
          const encryption = encrypt(jsonData);
          fs.writeFileSync(result.filePath, encryption);
          // const directory = result.filePath!.substring(0, result.filePath!.lastIndexOf('\\'));
          // shell.openPath(directory);
          resolve(true);
        } else {
          resolve('cancel');
        }
      })
      .catch(err => {
        log.error(err);
        resolve(false);
      });
  });
});

ipcMain.handle('select-config', (event, data) => {
  return new Promise(async (resolve, reject) => {
    dialog
      .showOpenDialog(win!, {
        title: '选择配置文件', // 对话框的标题
        defaultPath: 'config.dewav', // 默认的文件名字
        filters: [{ name: 'DEWAV', extensions: ['dewav'] }],
        // buttonLabel: '读取', // 自定义按钮文本显示内容
      })
      .then(res => {
        // 选择文件之后的处理
        if (!res.canceled) {
          // 如果不是点击的 取消按钮
          fs.readFile(res.filePaths[0], { flag: 'r', encoding: 'utf-8' }, (err, data) => {
            const encryption = decrypt(data);
            if (err) {
              console.log(err);
            } else {
              event.sender.send('select-config-reply', JSON.parse(encryption));
              resolve(true);
            }
          });
        } else {
          console.log('取消选择===>', res);
          resolve('cancel');
        }
      })
      .catch(err => {
        // 选择文件出错的处理
        log.error(err);
        resolve(false);
      });
  });
});

ipcMain.on('export-jpg', (event, data) => {
  dialog
    .showSaveDialog(win!, {
      title: '保存为图片', // 对话框标题
      // defaultPath: '/path/to/default/folder', // 默认保存路径
      // buttonLabel: '保存', // 自定义保存按钮的文本
      filters: [{ name: 'config', extensions: ['jpg'] }],
    })
    .then(result => {
      console.log(result);
      if (result.canceled == false) {
        // const jsonData = JSON.stringify(data);
        // const encryption = encrypt(jsonData);
        const base64 = data.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(result.filePath, base64, 'base64');
        const directory = result.filePath!.substring(0, result.filePath!.lastIndexOf('\\'));
        shell.openPath(directory);
      }
    })
    .catch(err => {
      console.log(err);
    });
});
