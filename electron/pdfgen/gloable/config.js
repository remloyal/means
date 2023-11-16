'use strict';

import _cfg from './config.json';
const path = require('path');
const config = {
  isLocal: _cfg.isLocal,
  isMac: _cfg.isMac || false,
  pdftemplate: {
    pdfLang: _cfg.frigga.pdf.pdfLang,
  },
  smsLang: _cfg.frigga.smsLang,
  language: _cfg.frigga.language,
  pdfLine: _cfg.frigga.pdf.pdfLine,
  pdfUrlPrefix: _cfg.frigga.pdf.pdfUrlPrefix || '',
  excelUrlPrefix: (_cfg.frigga.excel && _cfg.frigga.excel.urlPrefix) || '',
  downloadUrlPrefix: (_cfg.frigga.csv && _cfg.frigga.csv.downloadUrlPrefix) || '',
  logConfig: {
    appenders: {
      xcLogFile: {
        type: _cfg.log.appenders.xcLogFile.type,
        filename: path.join(_cfg.log.appenders.xcLogFile.filename, 'response'),
        alwaysIncludePattern: _cfg.log.appenders.xcLogFile.alwaysIncludePattern,
        pattern: _cfg.log.appenders.xcLogFile.pattern,
        encoding: _cfg.log.appenders.xcLogFile.encoding,
        maxLogSize: _cfg.log.appenders.xcLogFile.maxLogSize,
        compress: _cfg.log.appenders.xcLogFile.compress,
        backups: _cfg.log.appenders.xcLogFile.backups,
        keepFileExt: _cfg.log.appenders.xcLogFile.keepFileExt,
        numBackups: _cfg.log.appenders.xcLogFile.daysToKeep,
      },
      xcLogConsole: {
        type: _cfg.log.appenders.xcLogConsole.type,
      },
    },
    pm2: true,
    replaceConsole: true,
    categories: {
      default: {
        appenders: _cfg.log.categories.default.appenders,
        level: _cfg.log.categories.default.level,
      },
      xcLogFile: {
        appenders: _cfg.log.categories.xcLogFile.appenders,
        level: _cfg.log.categories.xcLogFile.level,
      },
      xcLogConsole: {
        appenders: _cfg.log.categories.xcLogConsole.appenders,
        level: _cfg.log.categories.xcLogConsole.level,
      },
    },
  },
};
export default config;
