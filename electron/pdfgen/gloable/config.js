'use strict';

import _cfg from './config.json';
const path = require('path');
const config = {
  pdftemplate: {
    pdfLang: _cfg.frigga.pdf.pdfLang,
  },
  smsLang: _cfg.frigga.smsLang,
  language: _cfg.frigga.language,
  pdfLine: _cfg.frigga.pdf.pdfLine,
  pdfUrlPrefix: _cfg.frigga.pdf.pdfUrlPrefix || '',
  excelUrlPrefix: (_cfg.frigga.excel && _cfg.frigga.excel.urlPrefix) || '',
  downloadUrlPrefix: (_cfg.frigga.csv && _cfg.frigga.csv.downloadUrlPrefix) || ''
};
export default config;
