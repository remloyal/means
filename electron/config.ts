import { app } from 'electron';
import path from 'path';

const UrlList = {
  test_url: 'http://172.16.18.206:3004/',
  intranet: 'http://172.16.22.82:3004/',
  preService: 'http://pre.friggatech.com/',
  externalNetwork: 'https://cms.dw.ifrigga.com:7665/',
};

export const BASE_URL = UrlList['intranet'];

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
  CACHE_PATH: path.join(process.cwd(), RESOURCES_NAME, 'cache'),
  STATIC_PATH: path.join(process.cwd(), RESOURCES_NAME, 'static'),
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

// UTC 对应时区
export const UTC_PARAM = {
  'UTC-12:00': 'Etc/GMT+12',
  'UTC-11:00': 'Pacific/Midway',
  'UTC-10:00': 'Pacific/Honolulu',
  'UTC-09:30': 'Pacific/Marquesas',
  'UTC-09:00': 'America/Anchorage',
  'UTC-08:00': 'America/Los_Angeles',
  'UTC-07:00': 'America/Denver',
  'UTC-06:00': 'America/Chicago',
  'UTC-05:00': 'America/New_York',
  'UTC-04:00': 'America/Puerto_Rico',
  'UTC-03:00': 'America/Argentina/Buenos_Aires',
  'UTC-02:00': 'Atlantic/South_Georgia',
  'UTC-01:00': 'Atlantic/Cape_Verde',
  'UTC-00:00': 'Europe/London',
  'UTC00:00': 'Europe/London',
  'UTC+00:00': 'Europe/London',
  'UTC+01:00': 'Europe/Paris',
  'UTC+02:00': 'Europe/Istanbul',
  'UTC+03:00': 'Europe/Moscow',
  'UTC+04:00': 'Asia/Dubai',
  'UTC+05:00': 'Asia/Yekaterinburg',
  'UTC+06:00': 'Asia/Dhaka',
  'UTC+07:00': 'Asia/Bangkok',
  'UTC+08:00': 'Asia/Shanghai',
  'UTC+09:00': 'Asia/Tokyo',
  'UTC+10:00': 'Australia/Sydney',
  'UTC+11:00': 'Pacific/Guadalcanal',
  'UTC+12:00': 'Pacific/Auckland',
  'UTC+13:00': 'Pacific/Tongatapu',
  'UTC+14:00': 'Pacific/Kiritimati',
};
