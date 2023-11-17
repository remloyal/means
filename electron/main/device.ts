import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { decrypt, encrypt } from '../service/unitls/encryption';
import { WebUSB, usb, findByIds } from 'usb';
const path = require('path');
const fs = require('fs');

let win: BrowserWindow | null = null;
const VERSION_ID = 10473; // 1003
const PRODUCT_ID = 631; // 517

try {
  usb.on('attach', async function (device) {
    if (
      device.deviceDescriptor.idProduct === PRODUCT_ID &&
      device.deviceDescriptor.idVendor === VERSION_ID
    ) {
      win?.webContents.send('deviceInsertion', device);
    }
  });

  usb.on('detach', function (device) {
    // console.log('监听到 usb 设备拔出：', device);
    if (
      device.deviceDescriptor.idProduct === PRODUCT_ID &&
      device.deviceDescriptor.idVendor === VERSION_ID
    ) {
      win?.webContents.send('deviceRemoval', device);
    } else {
      win?.webContents.send('deviceRemoval', false);
    }
  });
} catch (error) {
  console.log(error);
}

export const deviceInit = async (browserWindow: BrowserWindow) => {
  win = browserWindow;
  const customWebUSB = new WebUSB({
    // Bypass cheking for authorised devices
    allowAllDevices: true,
  });
  const devices = await customWebUSB.getDevices();
  for (const device of devices) {
    if (device.vendorId === VERSION_ID && device.productId === PRODUCT_ID) {
      // console.log(device); // WebUSB device
      setTimeout(() => {
        win?.webContents.send('deviceInsertion', device);
      }, 5000);
    }
  }
  win.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    console.log('deviceList', deviceList);
  });
};

ipcMain.on('export-config', (event, data) => {
  dialog
    .showSaveDialog({
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
        const directory = result.filePath!.substring(0, result.filePath!.lastIndexOf('\\'));
        shell.openPath(directory);
      }
    })
    .catch(err => {
      console.log(err);
    });
});

ipcMain.on('select-config', (event, data) => {
  dialog
    .showOpenDialog({
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
          }
        });
      } else {
        console.log('取消选择===>', res);
      }
    })
    .catch(err => {
      // 选择文件出错的处理
      console.log(err);
    });
});

ipcMain.on('export-jpg', (event, data) => {
  dialog
    .showSaveDialog({
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
