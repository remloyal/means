import { ipcMain } from 'electron';
import { LOG_PARAM, SYSTEM } from '../config';
import log4js from 'log4js';
const isDev = SYSTEM.IS_DEV;
const logSize = 10485760; //10m
log4js.addLayout('json', config => {
  return function (logEvent) {
    return JSON.stringify(logEvent) + config.separator;
  };
});
log4js.configure({
  appenders: {
    console: { type: 'stdout' },
    work: {
      type: 'file',
      filename: `${LOG_PARAM.LOG_PATH}`,
      encoding: 'utf-8',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      maxLogSize: logSize,
      backups: 3,
      compress: true,
      // layout: { type: 'json', separator: ',' },
    },
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'debug',
    },
    work: { appenders: ['work', 'console'], level: 'info' },
  },
});
const logger = log4js.getLogger('work');
const LogCollection = {
  debug: (...text) => {
    isDev && logger.debug(text.toString());
  },
  info: (...text) => {
    isDev && logger.info(text.toString());
  },
  db: (...text) => {
    isDev && logger.info(text.toString());
  },
  error: (...text) => {
    logger.error(text.toString());
  },
};
export default {
  debug: (...text) => {
    isDev && logger.debug(text.toString());
  },
  info: (...text) => {
    isDev && logger.info(text.toString());
  },
  db: (...text) => {
    isDev && logger.info(text.toString());
  },
  error: (...text) => {
    logger.error(text.toString());
  },
};

ipcMain.handle('setLog', (event, res) => {
  const { type, data } = res;
  const logSet = LogCollection[type || 'error'];
  logSet(data);
});
