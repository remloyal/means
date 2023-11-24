import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';
import { deviceInit } from './device';
import '../service/router';
import './renew';
import { CheckForUpdates, quitRenew, mainWindow } from './renew';
import { dynamicConfig } from '../config';
import { IsOnlineService, isOnline } from '../unitls/request';
import log from '../pdfgen/log';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
dynamicConfig.ver = app.getVersion();
// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
const WIDTH = 1440;
const HEIGHT = 900;
// Here, you can also use other preload
export const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

export async function createWindow() {
  win = new BrowserWindow({
    autoHideMenuBar: true,
    title: '鼎为数据中心',
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    width: WIDTH,
    height: HEIGHT,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setMenuBarVisibility(false); // 隐藏头部菜单栏

  if (url) {
    win.loadURL(url);
    win.webContents.openDevTools(); // 开发环境下打开调试工具
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
    win?.webContents.send('deviceOnload', new Date().toLocaleString());
    // CheckForUpdates();
  });
  win.on('resize', () => {
    let sizeData = win?.getContentBounds();
    win?.webContents.send('resizeEvent', sizeData);
  });
  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.once('ready-to-show', () => {
    // 限制窗口最小尺寸（int整形）, 无边框模式下，不考虑标题栏高度
    win!.setMinimumSize(WIDTH, HEIGHT);
    win!.show();
  });
  win.setAspectRatio(1.6);
  win.webContents.on('did-fail-load', data => {
    console.log('----fail----', data);
    win?.reload();
  });
  win.webContents.on('render-process-gone', async (e, killed) => {
    console.log('----crashed----', e, killed, arguments);
    let result = await dialog.showMessageBox({
      type: 'error',
      title: '应用程序崩溃',
      message: '当前程序发生异常，是否要重新加载应用程序?',
      buttons: ['是', '否'],
    });
    if (result.response == 0) {
      win!.webContents.reload();
    } else {
      app.quit();
      console.log('系统奔溃，可在此进行日志收集，将奔溃原因写入日志文件');
    }
  });

  win.on('close', () => {
    // 在窗口对象被关闭时，取消订阅所有与该窗口相关的事件
    win?.removeAllListeners();
    win = null;
  });

  // Apply electron-updater
  deviceInit(win);
  CheckForUpdates(win);
  // downLoad();
}

app.whenReady().then(async () => {
  const state = await isOnline();
  if (state) {
    createWindow();
  } else {
    dialog.showErrorBox(
      'Network connection failed',
      'Please check your network connection or try again later!'
    );
    log.error('Network connection failed');
    app.quit();
  }
  const online = new IsOnlineService();
  online.on('status', res => {
    console.log(res);
    if (res == false) {
      win?.close();
      mainWindow?.close();
      log.error('Network connection failed');
      dialog.showErrorBox(
        'Network connection failed',
        'Please check your network connection or try again later!'
      );
      app.quit();
    }
  });
});

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

// 应用重启
ipcMain.on('window-reset', function () {
  if (url) {
    win?.webContents.reload();
  } else {
    app.relaunch();
    app.exit();
  }
});

ipcMain.handle('restartNow', () => {
  quitRenew();
});

ipcMain.handle('lang', (_, data) => {
  const lang = {
    en_US: 1,
    zh_CN: 2,
  };
  dynamicConfig.lan = lang[data] || 1;
});
