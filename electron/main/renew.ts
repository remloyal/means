import path from 'path';
import fs from 'fs';
import axios from 'axios';
import electron, { app, BrowserWindow, ipcMain } from 'electron';
import log from '../pdfgen/log';
import { createWindow, preload } from './index';
import { exec, spawn } from 'child_process';
import { deleteDir, filePath, getUrl } from '../unitls/unitls';

const baseUrl = path.resolve('./') + '/resources/';
var AdmZip = require('adm-zip');
let mainWindow: BrowserWindow | null = null;

// 缓存名称
const cachePath = baseUrl + 'app_old.asar';
// 更新解压缩路径
const updatePath = baseUrl + 'update';
let renewtimer: NodeJS.Timeout | null = null;
const createTimer = () => {
  renewtimer = setInterval(function () {
    CheckForUpdates();
    // clearInterval(renewtimer!);
  }, 1800000);
};
createTimer();

/**
 * 检测
 */
export const CheckForUpdates = () => {
  return new Promise(async (resolve, reject) => {
    // 判断是否开发环境
    // if (!app.isPackaged) {
    //   resolve(false);
    //   return;
    // }

    // 获取远程配置
    const remoteConfiguration = (await axios.get(getUrl())).data;
    const { data } = remoteConfiguration;
    /**
     * app.getVersion() 返回开发中的 Electron 版本号
     */
    const localVersion = app.getVersion();
    const ment = compareVersions(data.version, localVersion);
    if (ment == -1) {
      resolve(false);
    } else {
      createRenew(data);
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
export const downLoad = async (deploy?) => {
  if (fs.existsSync(updatePath)) {
    await deleteDir(updatePath);
  }
  return new Promise(async (resolve, reject) => {
    if (!deploy.downloadurl) {
      mainWindow?.webContents.send('updateFail');
      resolve(false);
      return;
    }
    
    /**
     * app.zip包含 update.asar 和 app-update.yml
     */

    // 创建一个可以写入的流，
    mainWindow?.webContents.downloadURL(
      deploy.downloadurl || 'http://127.0.0.1:3000/files/app.zip'
    );
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
          electron.dialog.showErrorBox(
            '下载失败',
            `文件 ${item.getFilename()} 因为某些原因被中断下载`
          );
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
 * @return  1 | -1
 */
function compareVersions(version1, version2) {
  // 将版本号字符串分割成数字数组
  const ver1 = version1.split('.').map(Number);
  const ver2 = version2.split('.').map(Number);

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
      var cmd = `copy ${srcDir.replaceAll('/', '\\')} ${outputPath.replaceAll('/', '\\')}`;
      exec(cmd, function (error, stdout, stderr) {
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

const createRenew = (data?) => {
  if (mainWindow) return;
  const width = 400;
  const height = 350;
  let newWindow: BrowserWindow | null = new BrowserWindow({
    width: width,
    height: height,
    autoHideMenuBar: true,
    // backgroundColor:"#F9B882",
    // titleBarStyle:"hidden",
    title: '鼎为数据中心',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    alwaysOnTop: true,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  newWindow.setMenuBarVisibility(false);
  if (process.env.VITE_DEV_SERVER_URL) {
    newWindow.loadURL(process.env.VITE_DEV_SERVER_URL + 'renewIndex.html');
    newWindow.webContents.openDevTools(); // 开发环境下打开调试工具
  } else {
    const indexHtml = path.join(process.env.DIST, 'renewIndex.html');
    newWindow.loadFile(indexHtml);
  }
  mainWindow = newWindow;
  newWindow.setSize(width, height);
  newWindow.setMaximumSize(width, height);
  newWindow.setMinimumSize(width, height);
  newWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      newWindow?.webContents.send('version', {
        new: data.version,
        old: app.getVersion(),
        data,
      });
    }, 1000);
  });
  newWindow.setAlwaysOnTop(true);
  // 监听窗口退出
  newWindow.on('closed', () => {
    newWindow?.destroy();
    mainWindow = null;
    newWindow = null;
    log.info('更新窗口退出');
  });
  ipcMain.handle('startUpdate', (event, params) => {
    downLoad(data);
  });

  ipcMain.on('openMain', function () {
    createWindow();
  });
};

export const quitRenew = async () => {
  if (fs.existsSync(updatePath) && fs.existsSync(updatePath + '\\app.zip')) {
    await _unzip(filePath, updatePath);
    if (!fs.existsSync(cachePath)) {
      // 备份
      copyAsar(baseUrl + 'app.asar', cachePath);
    }
    // 判断是win还是mac
    if (process.platform === 'win32') {
      try {
        const updateExe = filePath('./static/update.exe');
        const child = spawn(`"${updateExe}"`, [`${process.cwd()}`], {
          detached: true,
          shell: true,
          stdio: ['ignore'],
        });
        child.unref();
        log.info('win 增量更新中');
      } catch (error) {
        log.error('win 增量更新失败', error);
        fs.copyFileSync(cachePath, baseUrl + 'app.asar');
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
    fs.unlinkSync(updatePath + 'app.zip');
    // 复制置换 app-update.yml
    fs.copyFileSync(updatePath + '/app.asar', baseUrl + 'app.asar');
    if (!fs.existsSync(updatePath + '/app-update.yml')) {
      fs.copyFileSync(updatePath + '/app-update.yml', baseUrl + 'app-update.yml');
    }
    log.info('mac 增量更新成功');
  } catch (error) {
    fs.copyFileSync(cachePath, baseUrl + 'app.asar');
    log.error('mac 增量更新失败', error);
  }
};
