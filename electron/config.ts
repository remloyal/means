import { app } from 'electron';
import path from 'path';

const UrlList = {
  test_url: 'http://172.16.18.206:3004/',
  intranet: 'http://172.16.22.82:3004/',
  preService: 'http://pre.friggatech.com/',
  externalNetwork: 'https://cms.dw.ifrigga.com:7665/',
};

export const BASE_URL = UrlList['test_url'];

export const DYNAMIC_CONFIG = {
  ver: '1.0.0',
  lan: 1,
  env: 1,
};

export const LANGUAGE = {
  'zh-CN': 'zh_CN',
  'en-US': 'en_US',
};

export const PING_URL = 'https://www.friggatech.com/';
export const PING_TIMEOUT = 5000;

// 系统
export const SYSTEM = {
  IS_WIN: process.platform === 'win32',
  IS_MAC: process.platform === 'darwin',
  IS_LINUX: process.platform === 'linux',
  IS_DEV: !app.isPackaged,
};

// 更新
// export const UPDATE_PARAM = {
//   version: '1.0.0',
//   update_url: 'http://172.16.18.206:3004/',
//   update_time: '2020-07-01 12:00:00',
//   update_desc: '1.0.0',
// };

// 窗口
export const WINDOW_PARAM = {
  TITLE: app.name,
  WIDTH: 1440,
  HEIGHT: 900,
  // 比例
  RATIO: 1.6,
};

// resources 名称
export const RESOURCES_NAME = SYSTEM.IS_WIN
  ? 'resources'
  : SYSTEM.IS_MAC
    ? 'Resources'
    : 'resources';

// 路径
export const PATH_PARAM = {
  APP_PATH: path.resolve(process.cwd()),
  RESOURCES: path.join(process.cwd(), RESOURCES_NAME),
  THREAD: SYSTEM.IS_DEV
    ? path.join(process.cwd(), './public/thread.js')
    : path.join(process.cwd(), RESOURCES_NAME, './app.asar/dist/thread.js'),
};

// 数据库
export const DB_PARAM = {
  DB_PATH: path.join(process.cwd(), RESOURCES_NAME, 'database.db'),
  DB_PASSWORD: 'frigga',
};

// 日志
export const LOG_PARAM = {
  INFO_PATH: path.join(process.cwd(), RESOURCES_NAME, 'logs/info/info'),
  ERROR_PATH: path.join(process.cwd(), RESOURCES_NAME, 'logs/error/error'),
  DATABASE_PATH: path.join(process.cwd(), RESOURCES_NAME, 'logs/database/db'),
  APPLICATION_PATH: path.join(process.cwd(), RESOURCES_NAME, 'logs/application/application'),
  RESPONSES_PATH: path.join(process.cwd(), RESOURCES_NAME, 'logs/responses/responses'),
};
