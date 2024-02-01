import { app, BrowserWindow, shell, ipcMain, dialog, Menu, Tray, screen } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';
import { deviceInit } from './device';
import '../service/router';
import './renew';
import { CheckForUpdates, quitRenew, mainWindow } from './renew';
import { DYNAMIC_CONFIG, LANGUAGE, LANGUAGE_PDF, SYSTEM, WINDOW_PARAM } from '../config';
import { IsOnlineService, isNetworkState } from '../unitls/request';
import log from '../unitls/log';
import { hidProcess, initGidThread } from '../service/deviceHid/deviceHid';
import { text } from '../pdfgen/gloable/language';

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
DYNAMIC_CONFIG.ver = app.getVersion();
// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export let win: BrowserWindow | null = null;
// Here, you can also use other preload
export const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

let tray;
let updateState = true;
export async function createWindow() {
  const windowDisplay = screen.getPrimaryDisplay();
  console.log(windowDisplay);
  let isScale = false;
  if (windowDisplay.workAreaSize.width < 1300) {
    WINDOW_PARAM.WIDTH = windowDisplay.workAreaSize.width;
    WINDOW_PARAM.HEIGHT = windowDisplay.workAreaSize.height;
    isScale = true;
  }
  // updateState = false;
  win = new BrowserWindow({
    autoHideMenuBar: true,
    title: WINDOW_PARAM.TITLE,
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    width: WINDOW_PARAM.WIDTH,
    height: WINDOW_PARAM.HEIGHT,
    // resizable: !isScale,
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
    // CheckForUpdates();
  });
  win.on('resize', () => {
    const sizeData = win?.getContentBounds();
    win?.webContents.send('resizeEvent', sizeData);
  });
  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.once('ready-to-show', () => {
    // 限制窗口最小尺寸（int整形）, 无边框模式下，不考虑标题栏高度
    if (isScale) {
      win!.setMinimumSize(WINDOW_PARAM.WIDTH, WINDOW_PARAM.HEIGHT);
      win!.setMaximumSize(WINDOW_PARAM.WIDTH, WINDOW_PARAM.HEIGHT);
    } else {
      win!.setMinimumSize(
        parseInt((WINDOW_PARAM.WIDTH / 1.1).toString()),
        parseInt((WINDOW_PARAM.HEIGHT / 1.1).toString())
      );
      win!.show();
    }
  });
  if (!isScale) {
    win.setAspectRatio(WINDOW_PARAM.RATIO);
    win!.setMaximumSize(windowDisplay.size.width, windowDisplay.size.height);
  } else {
    win!.setMinimumSize(WINDOW_PARAM.WIDTH, WINDOW_PARAM.HEIGHT);
    win!.setMaximumSize(WINDOW_PARAM.WIDTH, WINDOW_PARAM.HEIGHT);
  }
  // 监听屏幕分辨率变化事件
  screen.on('display-metrics-changed', (event, display, changedMetrics) => {
    if (SYSTEM.IS_WIN) {
      win?.center();
      app.relaunch();
      app.exit();
    }
    // const windowDisplay = screen.getPrimaryDisplay();
    // if (windowDisplay.workAreaSize.width < 1920) {
    //   WINDOW_PARAM.WIDTH = windowDisplay.workAreaSize.width;
    //   WINDOW_PARAM.HEIGHT = windowDisplay.workAreaSize.height;
    //   win!.setMinimumSize(WINDOW_PARAM.WIDTH, WINDOW_PARAM.HEIGHT);
    //   win!.setMaximumSize(WINDOW_PARAM.WIDTH, WINDOW_PARAM.HEIGHT);
    //   isScale = true;
    // } else {
    //   WINDOW_PARAM.WIDTH = windowDisplay.size.width;
    //   WINDOW_PARAM.HEIGHT = windowDisplay.size.height;
    //   win?.setAspectRatio(WINDOW_PARAM.RATIO);
    //   isScale = false;
    //   win!.setMinimumSize(
    //     parseInt((WINDOW_PARAM.WIDTH / 1.1).toString()),
    //     parseInt((WINDOW_PARAM.HEIGHT / 1.1).toString())
    //   );
    //   win!.setMaximumSize(windowDisplay.size.width, windowDisplay.size.height);
    // }
    // console.log(
    //   `分辨率发生了变化：${JSON.stringify(display.bounds)}, ${JSON.stringify(changedMetrics)}`
    // );
  });

  win.webContents.on('did-fail-load', data => {
    console.log('----fail----', data);
    win?.reload();
  });
  win.webContents.on('render-process-gone', async (e, killed) => {
    console.log('----crashed----', e, killed);
    const result = await dialog.showMessageBox(win!, {
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

  win.on('close', async e => {
    if (!updateState) {
      //   await hidProcess?.kill();
      //   // 在窗口对象被关闭时，取消订阅所有与该窗口相关的事件
      //   win?.removeAllListeners();
      //   win = null;
      // } else {
      e.preventDefault();
      win?.show();
      // win?.webContents.send('exitPrompt');
      dialog
        .showMessageBox(win! || null, {
          type: 'info',
          message: text('EXIT_PROMPT', DYNAMIC_CONFIG.language || 'en'),
          buttons: [
            text('MINIMIZE_TRAY', DYNAMIC_CONFIG.language || 'en'),
            text('EXIT_APP', DYNAMIC_CONFIG.language || 'en'),
          ],
          noLink: true,
          // defaultId: 0,
          cancelId: 8,
        })
        .then(async res => {
          if (res.response == 0) {
            win?.hide();
          }
          if (res.response == 1) {
            await hidProcess?.kill();
            win?.removeAllListeners();
            win = null;
            app.quit();
          }
        });
    }
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate([]));
  try {
    // 创建系统托盘
    if (SYSTEM.IS_WIN) {
      tray = new Tray(join(process.env.VITE_PUBLIC, 'favicon.ico'));
    }
    if (SYSTEM.IS_MAC) {
      tray = new Tray(join(process.env.VITE_PUBLIC, 'macLogoTemplate.png'));
    }
    tray &&
      tray.on('double-click', () => {
        win?.show();
        win?.center();
      });
  } catch (error) {
    log.error(error);
  }

  // Apply electron-updater
  deviceInit(win);
  CheckForUpdates(win);
  // downLoad();
  initGidThread(win);
}

// 当应用准备就绪时，执行下面的函数
app.whenReady().then(async () => {
  DYNAMIC_CONFIG.language = LANGUAGE_PDF[app.getLocale() || 'default'] || 'en';
  // 调用isOnline函数，获取网络连接状态
  const state = await isNetworkState();
  // 如果网络连接状态正常，则创建窗口
  if (state) {
    createWindow();
    // 如果网络连接状态不正常，则显示错误提示框，并退出应用
  } else {
    log.error('Network connection failed');
    dialog.showErrorBox(
      text('NETWORK_CONNECTION_FAILED', DYNAMIC_CONFIG.language),
      text('NETWORK_PROMPT', DYNAMIC_CONFIG.language)
    );
    app.exit();
  }
  // 创建一个IsOnlineService实例
  // const online = new IsOnlineService();
  // // 监听网络连接状态的变化
  // online.on('status', res => {
  //   console.log(res);
  //   // 如果网络连接状态不正常，则关闭窗口，并退出应用
  //   if (res == false) {
  //     win?.close();
  //     mainWindow?.close();
  //     log.error('Network connection failed');
  //     dialog.showMessageBoxSync(win!, {
  //       type: 'error',
  //       title: 'Network connection failed',
  //       message: 'Please check your network connection or try again later!',
  //     });
  //     app.exit();
  //   }
  // });
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
ipcMain.on('window-reset', () => {
  if (url) {
    win?.webContents.reload();
  } else {
    app.relaunch();
    app.exit();
  }
});

ipcMain.handle('lang', (_, data) => {
  if (updateState) {
    updateState = false;
  }
  const lang = {
    en: 1,
    zh: 2,
  };
  DYNAMIC_CONFIG.lan = lang[data] || 1;
  DYNAMIC_CONFIG.language = data;
  setTray(DYNAMIC_CONFIG.lan);
  return LANGUAGE_PDF[app.getLocale()];
});

// 处理获取版本号的事件
ipcMain.handle('getVersion', async (_, data) => {
  return await app.getVersion();
});

// 处理打开url的事件
ipcMain.handle('open-url', (event, url) => {
  console.log(url);
  shell.openExternal(url);
});

// 处理退出类型的事件
ipcMain.handle('exitType', (event, type) => {
  setTimeout(async () => {
    if (type == 1) {
      win?.hide();
    } else {
      await hidProcess?.kill();
      // 在窗口对象被关闭时，取消订阅所有与该窗口相关的事件
      win?.removeAllListeners();
      win = null;
      app.quit();
    }
  }, 1000);
});

// 设置托盘图标
const setTray = lan => {
  const menu = Menu.buildFromTemplate([
    {
      label: lan == 1 ? 'view' : '显示',
      click: () => {
        win?.show();
        win?.center();
      },
    },
    {
      label: lan == 1 ? 'quit' : '退出',
      click: () => {
        app.exit();
      },
    },
  ]);
  tray && tray.setToolTip(lan == 1 ? 'Frigga Data Center' : '鼎为数据中心');
  tray && tray.setContextMenu(menu);
};

// 设置更新状态
export const setUpdateState = state => {
  updateState = state;
};

// 获取缩放系数
ipcMain.handle('windowDisplay', (_, arg) => {
  const windowDisplay = screen.getPrimaryDisplay();
  const { width, height } = windowDisplay.size;
  return width / 1920;
});
