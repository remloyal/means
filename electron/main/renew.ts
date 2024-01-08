import path from 'path';
import fs from 'fs';
import axios from 'axios';
import electron, { app, BrowserWindow, dialog, ipcMain } from 'electron';
import log from '../unitls/log';
import { createWindow, preload, setUpdateState } from './index';
import { exec, spawn } from 'child_process';
import { deleteDir, filePath, getUrl, judgingSpaces } from '../unitls/unitls';
import { listenUpdater } from './update';
import { isNetworkState } from '../unitls/request';
import { DYNAMIC_CONFIG, UPDATE_PARAM } from '../config';
import { text } from '../pdfgen/gloable/language';

const baseUrl = `${path.resolve('./')}/resources/`;
const AdmZip = require('adm-zip');
export let mainWindow: BrowserWindow | null = null;
let win: BrowserWindow | null = null;
// 缓存名称
const cachePath = `${baseUrl}app_old.asar`;
// 更新解压缩路径
const updatePath = `${baseUrl}update`;
let renewtimer: NodeJS.Timeout | null = null;
const createTimer = () => {
  renewtimer = setInterval(async () => {
    const state = await isNetworkState();
    if (state) {
      CheckForUpdates(win);
      // 如果网络连接状态不正常，则显示错误提示框，并退出应用
    } else {
      log.error('Network connection failed');
      dialog.showErrorBox(
        text('NETWORK_CONNECTION_FAILED', DYNAMIC_CONFIG.language),
        text('NETWORK_PROMPT', DYNAMIC_CONFIG.language)
      );
      const state = await isNetworkState();
      if (!state) {
        app.exit();
      }
    }
    // clearInterval(renewtimer!);
  }, UPDATE_PARAM.INSPECTION_TIME);
};
createTimer();

/**
 * 检测
 */
export const CheckForUpdates = (winData: Electron.BrowserWindow | null) => {
  win = winData;
  return new Promise(async (resolve, reject) => {
    let remoteConfiguration;
    // 获取远程配置
    try {
      const url = getUrl();
      // let url = 'http://localhost:3000/upload';
      remoteConfiguration = (await axios.get(url)).data;
      console.log(remoteConfiguration);
    } catch (error) {
      log.error('获取远程配置失败', error);
      return;
    }

    const { data } = remoteConfiguration;
    /**
     * app.getVersion() 返回开发中的 Electron 版本号
     */
    const localVersion = app.getVersion();
    const ment = compareVersions(data.version, localVersion);

    if (ment == -1 || ment == 0) {
      resolve(false);
    } else {
      if (mainWindow == null) {
        createRenew(data);
      }
      // 强制更新关闭主程序
      if (data.forceUpdate == 1) {
        setUpdateState(true);
        win?.show();
        setTimeout(() => {
          win && win?.close();
          win = null;
        }, 2000);
      }
      // if (fs.existsSync(baseUrl + 'app.asar')) {
      //   if (!fs.existsSync(baseUrl + 'app_old.asar')) {
      //   }
      //   备份数据
      //   await copyAsar(baseUrl + 'app.asar', cachePath);
      //   // 获取更新数据
      //   await downLoad();
      // }
    }
  });
};

/**
 * 下载更新
 */
export const downLoad = async deploy => {
  if (fs.existsSync(updatePath)) {
    await deleteDir(updatePath);
  }
  return new Promise(async (resolve, reject) => {
    if (!deploy.downloadUrl) {
      mainWindow?.webContents.send('updateFail');
      resolve(false);
      return;
    }

    /**
     * app.zip包含 update.asar 和 app-update.yml
     */
    // 创建一个可以写入的流，
    const url = deploy.downloadUrl || 'http://127.0.0.1:3000/files/app.zip';
    mainWindow?.webContents.downloadURL(url);
    mainWindow?.webContents.session.on('will-download', (e, item) => {
      const filePath = path.join(updatePath, item.getFilename());
      let value = 0;
      item.setSavePath(filePath); // 'C:\Users\kim\Downloads\第12次.zip'
      //监听下载过程，计算并设置进度条进度
      item.on('updated', (evt, state) => {
        if ('progressing' === state) {
          //此处  用接收到的字节数和总字节数求一个比例  就是进度百分比
          if (item.getReceivedBytes() && item.getTotalBytes()) {
            value = 100 * (item.getReceivedBytes() / item.getTotalBytes());
          }
          // 把百分比发给渲染进程进行展示
          mainWindow?.webContents.send('updateProgressing', value);
          // mac 程序坞、windows 任务栏显示进度
          mainWindow?.setProgressBar(value);
        }
      });
      //监听下载结束事件
      item.on('done', async (e, state) => {
        //如果窗口还在的话，去掉进度条
        if (!mainWindow?.isDestroyed()) {
          mainWindow?.setProgressBar(-1);
        }
        //下载被取消或中断了
        if (state === 'interrupted') {
          mainWindow?.webContents.send('updateFail');
        }
        // 下载成功后打开文件所在文件夹
        if (state === 'completed') {
          // 解压
          await _unzip(filePath, baseUrl);
          mainWindow?.webContents.send('updateProgressing', 100);
        }
      });
    });
  });
};
/**
 * 比较版本
 * @version1 新的
 * @version2 旧的
 * @return  1 | -1 | 0
 */
function compareVersions(version1, version2) {
  // 将版本号字符串分割成数字数组
  const ver1 = version1
    .replaceAll('-', '.')
    .split('.')
    .map(e => Number(e));
  const ver2 = version2
    .replaceAll('-', '.')
    .split('.')
    .map(e => Number(e));
  if (ver1.length == 3) {
    ver1.push(0);
  }
  if (ver2.length == 3) {
    ver2.push(0);
  }
  // 比较两个版本号数组的大小关系
  if (ver1.length > ver2.length) {
    return 1;
  } else if (ver1.length < ver2.length) {
    return -1;
  } else {
    for (let i = 0; i < ver1.length; i++) {
      if (ver1[i] > ver2[i]) {
        return 1;
      } else if (ver1[i] < ver2[i]) {
        return -1;
      }
    }
    return 0;
  }
}

// 备份
async function copyAsar(srcDir, outputPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const cmd = `copy ${srcDir.replaceAll('/', '\\')} ${outputPath.replaceAll('/', '\\')}`;
      exec(cmd, (error, stdout, stderr) => {
        // 获取命令执行的输出
        // console.log(error, stdout, stderr);
        if (!error) {
          resolve(true);
          // 成功
        } else {
          // 失败
          resolve(false);
        }
      });
    } catch (error) {
      log.error('asar 文件复制失败：', error);
      resolve(false);
    }
  });
}

const isExist = path => {
  // 判断文件夹是否存在, 不存在创建一个
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const copyFile = (sourcePath, targetPath) => {
  const sourceFile = fs.readdirSync(sourcePath, { withFileTypes: true });
  sourceFile.forEach(file => {
    const newSourcePath = path.resolve(sourcePath, file.name);
    const newTargetPath = path.resolve(targetPath, file.name);
    if (file.isDirectory()) {
      isExist(newTargetPath);
      copyFile(newSourcePath, newTargetPath);
    }
    if (file.name.endsWith('.mp4')) {
      // 需要复制其他的格式的文件修改 .mp4 既可
      fs.copyFileSync(newSourcePath, newTargetPath);
    }
  });
};

// del  /s D:\project\electron\tools_m\resources\update\app.asar
// 解壓zip
async function _unzip(zipPath, topath?) {
  return new Promise(async (resolve, reject) => {
    try {
      const admzip = new AdmZip(zipPath);
      admzip.extractAllTo(topath || updatePath);

      resolve(true);
    } catch (error) {
      log.error('解压zip文件时出错：', error);
      resolve(false);
    }
  });
}

const createRenew = (data?, callback?) => {
  if (mainWindow) return;
  const width = 720;
  const height = 450;
  let newWindow: BrowserWindow | null = new BrowserWindow({
    width,
    height,
    autoHideMenuBar: true,
    // backgroundColor:"#F9B882",
    // titleBarStyle:"hidden",
    // title: '鼎为数据中心',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    alwaysOnTop: true,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  newWindow.title = text('APP_UPDATE', DYNAMIC_CONFIG.language);
  newWindow.setMenuBarVisibility(false);
  if (process.env.VITE_DEV_SERVER_URL) {
    newWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}renewIndex.html`);
    newWindow.webContents.openDevTools(); // 开发环境下打开调试工具
  } else {
    const indexHtml = path.join(process.env.DIST, 'renewIndex.html');
    newWindow.loadFile(indexHtml);
  }
  mainWindow = newWindow;
  newWindow.setSize(width, height);
  newWindow.setMaximumSize(width, height);
  newWindow.setMinimumSize(width, height);
  newWindow.setAlwaysOnTop(true, 'status');
  // 监听窗口退出
  newWindow.on('closed', () => {
    newWindow?.destroy();
    mainWindow = null;
    newWindow = null;
    log.info('更新窗口退出');
  });
  if (callback) {
    callback(mainWindow);
  }

  ipcMain.handle('versionData', (event, params) => {
    return {
      new: data.version,
      old: app.getVersion(),
      data,
    };
  });

  ipcMain.handle('startUpdate', (event, params) => {
    try {
      if (data.updateType == 1) {
        setUpdateState(true);
        listenUpdater(mainWindow!, data);
        setTimeout(() => {
          win?.close();
        }, 5000);
        // 强制更新，全量升级
      } else {
        downLoad(data);
      }
    } catch (error) {
      log.error(error);
    }
  });

  ipcMain.on('openMain', () => {
    createWindow();
  });

  ipcMain.handle('cancelUpdate', () => {
    newWindow?.close();
    newWindow = null;
  });
};

export const quitRenew = async () => {
  if (fs.existsSync(`${baseUrl}update.asar`)) {
    await _unzip(filePath, updatePath);
    if (!fs.existsSync(cachePath)) {
      // 备份
      copyAsar(`${baseUrl}app.asar`, cachePath);
    }
    // 判断是win还是mac
    if (process.platform === 'win32') {
      try {
        const updateExe = filePath('./static/update.exe');
        const directoryPath = process.cwd();
        const backup_file = judgingSpaces(`${directoryPath}/resources/app_old.asar`);
        const update_file = judgingSpaces(`${directoryPath}/resources/update.asar`);
        const target_file = judgingSpaces(`${directoryPath}/resources/app.asar`);
        const app_path = judgingSpaces(`${directoryPath}/Frigga Data Center.exe`);
        log.info('backup_file====>', backup_file);
        log.info('update_file====>', update_file);
        log.info('target_file====>', target_file);
        log.info('app_path====>', app_path);

        const child = spawn(
          `"${updateExe}"`,
          [`${backup_file}`, `${update_file}`, `${target_file}`, `${app_path}`],
          {
            detached: true,
            shell: true,
            stdio: ['ignore'],
          }
        );
        child.unref();
        log.info('win 增量更新中');
      } catch (error) {
        log.error('win 增量更新失败', error);
        fs.copyFileSync(cachePath, `${baseUrl}app.asar`);
      }
    }
    // 判断是否为mac
    if (process.platform === 'darwin') {
      renewMac();
    }
  }
};

const renewMac = () => {
  try {
    // 删除zip
    fs.unlinkSync(`${updatePath}app.zip`);
    // 复制置换 app-update.yml
    fs.copyFileSync(`${updatePath}/app.asar`, `${baseUrl}app.asar`);
    if (!fs.existsSync(`${updatePath}/app-update.yml`)) {
      fs.copyFileSync(`${updatePath}/app-update.yml`, `${baseUrl}app-update.yml`);
    }
    log.info('mac 增量更新成功');
    if (!app.isPackaged) {
      win?.webContents.reload();
      mainWindow?.destroy();
      mainWindow = null;
    } else {
      app.relaunch();
      app.exit();
    }
  } catch (error) {
    fs.copyFileSync(cachePath, `${baseUrl}app.asar`);
    log.error('mac 增量更新失败', error);
  }
};

ipcMain.handle('language', (_, arg) => {
  mainWindow?.webContents.send('language', arg);
});

ipcMain.handle('restartNow', () => {
  quitRenew();
});
