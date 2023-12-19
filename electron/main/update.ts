import { app, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from '../unitls/log';
import path from 'path';
// 开发模式调试
if (!app.isPackaged) {
  Object.defineProperty(app, 'isPackaged', {
    get() {
      return true;
    },
  });
  // 开发测试文件更新路径
  autoUpdater.updateConfigPath = path.join(process.cwd(), '/resources/app-update.yml');
}
let win: Electron.BrowserWindow | null;
/**
 * 初始化更新模块
 * @param {*} mainWindow
 */
export const listenUpdater = (mainWindow: Electron.BrowserWindow, data) => {
  win = mainWindow;
  const url = data.downloadUrl || 'http://localhost:3000/files'; //更改为版本库地址,测试时可以在本地跑一个web服务
  autoUpdater.setFeedURL(url); // 更新包的地址
  autoUpdater.checkForUpdates();
};
autoUpdater.autoDownload = false; // 手动指定下载
autoUpdater.disableWebInstaller = false;
//异常捕获回调
autoUpdater.on('error', (error: Error, message) => {
  log.error('autoUpdater error==>', error);
  win?.webContents.send('automaticUpdateFail', JSON.stringify(error));
});

// 检查更新中
autoUpdater.on('checking-for-update', () => {
  //event.sender.send("msgUpdater", '检查更新中')
  log.info('msgUpdater', '检查更新中');
});

// 检测到有新版本更新
autoUpdater.on('update-available', info => {
  log.info(JSON.stringify(info));
  autoUpdater.downloadUpdate();
  win?.webContents.send('update-available', JSON.stringify(info));
});

// 暂无新版本可更新
autoUpdater.on('update-not-available', info => {
  log.error(JSON.stringify(info));
  setTimeout(() => {
    win?.webContents.send('update-not-available', info);
  }, 1500);
});

// 更新下载进度事件
autoUpdater.on('download-progress', progressObj => {
  log.info('download-progress', JSON.stringify(progressObj));
  win?.webContents.send('updateProgressing', Math.ceil(progressObj.percent));
});

// 下载完成,退出且重新安装
autoUpdater.on('update-downloaded', () => {
  log.info('下载完成,正在重新安装');
  win?.webContents.send('updateDownloaded');
});

autoUpdater.on('login', () => {
  log.info('login ==>');
  // win.webContents.send('updateDownloaded');
});
// Install now
ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall(); //退出且重新安装
  // autoUpdater.quitAndInstall(false, true);
});
