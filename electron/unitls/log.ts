import { LOG_PARAM, SYSTEM } from '../config';
import log4js from 'log4js';
const isDev = SYSTEM.IS_DEV;
const logSize = 10485760; //10m
// const logSize = 5120; //10m
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
      maxLogSize: logSize,
      backups: 30,
      compress: true,
      // layout: { type: 'json', separator: ',' },
    },
    collect: {
      type: 'file',
      filename: `${LOG_PARAM.COLLECT_PATH}`,
      encoding: 'utf-8',
      maxLogSize: logSize,
      backups: 30,
      compress: true,
      layout: { type: 'json', separator: ',' },
    },
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'debug',
    },
    work: { appenders: ['work', 'console'], level: 'info' },
    collect: { appenders: ['collect', 'console'], level: 'info' },
  },
});
const logger = log4js.getLogger('work');
const collect = log4js.getLogger('collect');

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
  collect: (...text) => {
    LOG_PARAM.COLLECT_STATE && collect.info(text.toString());
  },
};
