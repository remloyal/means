import { app } from 'electron';
import path from 'path';
import dayjs from 'dayjs';
import { UTC_PARAM as UTC } from '../config.public';
const UrlList = {
  // 本地测试
  test_url: 'http://172.16.18.206:3004',
  // 内网
  intranet: 'http://172.16.22.82:3004',
  // 内网外部测试
  intranet_test: 'http://test.api.m.friggatech.com:30001',
  // 预服务器
  preService: 'http://pre.friggatech.com',
  // 外网
  externalNetwork: 'https://cms.dw.ifrigga.com:7665',
};

export const BASE_URL = UrlList['intranet_test'];

export const DYNAMIC_CONFIG = {
  ver: '1.0.0',
  lan: 1,
  env: 1,
  language: 'en',
  type: 1, // 1 为win, 2为mac
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
export const CACHE_PATH = SYSTEM.IS_MAC ? '.Frigga' : 'Property';
// win 下为应用程序目录，mac下为 ~/.Frigga
const FATHER_PATH = SYSTEM.IS_DEV
  ? process.cwd()
  : SYSTEM.IS_MAC
    ? app.getPath('home')
    : process.cwd();
// app.asar 路径
export const APP_PATH = app.getAppPath();

// 路径
export const PATH_PARAM = {
  APP_PATH: path.resolve(process.cwd()),
  RESOURCES: SYSTEM.IS_DEV
    ? path.join(process.cwd(), RESOURCES_NAME)
    : SYSTEM.IS_MAC
      ? path.join(APP_PATH.replace('app.asar', ''))
      : path.join(process.cwd(), RESOURCES_NAME),
  THREAD: SYSTEM.IS_DEV
    ? path.join(process.cwd(), './public/thread.js')
    : SYSTEM.IS_MAC
      ? path.join(APP_PATH, './dist/thread.js')
      : path.join(process.cwd(), RESOURCES_NAME, './app.asar/dist/thread.js'),
  CACHE_PATH: path.join(FATHER_PATH, CACHE_PATH, 'cache'),
  PDF_PATH: path.join(FATHER_PATH, CACHE_PATH, 'cache/pdf'),
  STATIC_PATH: SYSTEM.IS_DEV
    ? path.join(process.cwd(), RESOURCES_NAME, 'static')
    : SYSTEM.IS_MAC
      ? path.join(APP_PATH.replace('app.asar', ''), './static')
      : path.join(process.cwd(), RESOURCES_NAME, 'static'),
};

// 数据库
export const DB_PARAM = {
  DB_PATH: path.join(FATHER_PATH, CACHE_PATH, 'database/frigga.db'),
  DB_USER_PATH: path.join(FATHER_PATH, CACHE_PATH, 'database/friggaInfo.db'),
  DB_PASSWORD: 'frigga',
};

export const DATE = dayjs().format('YYYY-MM-DD').split('-');
// 日志
export const LOG_PARAM = {
  LOG_PATH: path.join(FATHER_PATH, CACHE_PATH, `logs/${DATE[0]}/${DATE[1]}/work`),
};

// UTC 对应时区
export const UTC_PARAM = UTC;

export const HID_PARAM = {
  // hid 延迟读取key
  DELAY_LIST: [
    'shipmentId',
    'setShipmentId',
    'shipment1',
    'setShipment1',
    'shipment2',
    'setShipment2',
    'shipment3',
    'setShipment3',
    'shipment4',
    'setShipment4',
    'shipment5',
    'setShipment5',
    'shipment6',
    'setShipment6',
    'shipment7',
    'setShipment7',
  ],
  DELAY_TIME: 120,
  // hid 延迟读取时间  macos下需要等磁盘完全生成才可识别，约为 5s
  DELAY_HID_TIME: SYSTEM.IS_MAC ? 5000 : 1000,
};
