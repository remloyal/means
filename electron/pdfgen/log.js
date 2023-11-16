import log4js from 'log4js';
import path from 'path';

const levels = {
  trace: log4js.levels.TRACE,
  debug: log4js.levels.DEBUG,
  info: log4js.levels.INFO,
  warn: log4js.levels.WARN,
  error: log4js.levels.ERROR,
  fatal: log4js.levels.FATAL,
};

const logSize = 10485760; //10m

log4js.configure({
  appenders: {
    console: { type: 'console' },
    info: {
      type: 'dateFile',
      filename: path.join('resources/logs/', 'info/info'),
      encoding: 'utf-8',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      maxLogSize: logSize,
      backups: 100,
    },
    error: {
      type: 'dateFile',
      filename: path.join('resources/logs/', 'error/error'),
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true, // 设置文件名称为 filename + pattern
      maxLogSize: logSize,
      backups: 100,
    },
    database: {
      type: 'dateFile',
      filename: path.join('resources/logs/', 'database/db'),
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true, // 设置文件名称为 filename + pattern
      maxLogSize: logSize,
      backups: 100,
    },
    application: {
      type: 'dateFile',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      encoding: 'utf-8',
      filename: path.join('resources/logs/', 'application/application'),
      maxLogSize: logSize,
      backups: 100,
    },
    // 响应日志
    response: {
      type: 'dateFile',
      // category:'resLogger',
      filename: path.join('resources/logs/', 'responses/response'),
      pattern: 'yyyy-MM-dd.log', //日志输出模式
      alwaysIncludePattern: true,
      maxLogSize: logSize,
      encoding: 'utf-8',
      backups: 100,
    },
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'debug',
    },
    info: {
      appenders: ['info', 'console'],
      level: 'info',
    },
    error: {
      appenders: ['error', 'console'],
      level: 'error',
    },
    database: {
      appenders: ['database'],
      level: 'info',
    },
    response: {
      appenders: ['response', 'console'],
      level: 'info',
    },
    application: {
      appenders: ['application'],
      level: 'all',
    },
  },
});

/**
 * 日志输出 level为bug
 * @param { string } content
 */
const debug = content => {
  let logger = log4js.getLogger('debug');
  logger.level = levels.debug;
  logger.debug(content);
};

/**
 * 日志输出 level为info
 * @param { any } content
 */
const info = (...content) => {
  let logger = log4js.getLogger('info');
  logger.level = levels.info;
  logger.info(content);
};

/**
 * 日志输出 数据库
 * @param { string } content
 */
const db = content => {
  let logger = log4js.getLogger('database');
  logger.level = levels.info;
  logger.info(content);
};

/**
 * 日志输出 level为error
 * @param { string } content
 */
const error = (...content) => {
  let logger = log4js.getLogger('error');
  logger.level = levels.error;
  logger.error(content);
};

const formatError = (ctx, err) => {
  // const { method, url } = ctx;
  // let body = ctx.request.body;
  // const user = ctx.state.user;

  return { ctx, err };
};

let errorLogger = log4js.getLogger('error');
let resLogger = log4js.getLogger('response');

const loggers = {
  // 封装错误日志
  errLogger: (ctx, error) => {
    if (ctx && error) {
      errorLogger.error(formatError(ctx, error));
    }
  },
  // 封装响应日志
  resLogger: (ctx, resTime) => {
    if (ctx) {
      resLogger.info(ctx, resTime);
    }
  },
};

export default {
  debug,
  info,
  db,
  error,
  loggers,
};
