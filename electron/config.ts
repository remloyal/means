import { app } from 'electron';
import path from 'path';
import dayjs from 'dayjs';
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
  language: 'en',
};

export const LANGUAGE = {
  'zh-CN': 'zh_CN',
  'en-US': 'en_US',
};

export const LANGUAGE_PDF = {
  'zh-CN': 'zh',
  'en-US': 'en',
  default: 'en',
};
export const PING_TIMEOUT = 2000;
export const PING_URL_LIST = [
  'https://www.friggatech.com/',
  'https://www.google.com/',
  'https://www.baidu.com/',
  'https://www.bing.com/',
];

// 系统
export const SYSTEM = {
  IS_WIN: process.platform === 'win32',
  IS_MAC: process.platform === 'darwin',
  IS_LINUX: process.platform === 'linux',
  IS_DEV: !app.isPackaged,
};

// 更新
export const UPDATE_PARAM = {
  // version: '1.0.0',
  // update_url: 'http://172.16.18.206:3004/',
  // update_time: '2020-07-01 12:00:00',
  // update_desc: '1.0.0',
  INSPECTION_TIME: 3600000,
};

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
export const CACHE_PATH = 'Property';

// 路径
export const PATH_PARAM = {
  APP_PATH: path.resolve(process.cwd()),
  RESOURCES: path.join(process.cwd(), RESOURCES_NAME),
  THREAD: SYSTEM.IS_DEV
    ? path.join(process.cwd(), './public/thread.js')
    : path.join(process.cwd(), RESOURCES_NAME, './app.asar/dist/thread.js'),
  CACHE_PATH: path.join(process.cwd(), CACHE_PATH, 'cache'),
  STATIC_PATH: path.join(process.cwd(), RESOURCES_NAME, 'static'),
};

// 数据库
export const DB_PARAM = {
  DB_PATH: path.join(process.cwd(), CACHE_PATH, 'database/frigga.db'),
  DB_USER_PATH: path.join(process.cwd(), CACHE_PATH, 'database/friggaUser.db'),
  DB_PASSWORD: 'frigga',
};

export const DATE = dayjs().format('YYYY-MM-DD').split('-');
// 日志
export const LOG_PARAM = {
  LOG_PATH: path.join(process.cwd(), CACHE_PATH, `logs/${DATE[0]}/${DATE[1]}/work`),
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
