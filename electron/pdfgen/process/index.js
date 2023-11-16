const PDFDocument = require('pdfkit');
import fs from 'fs';
import getStream from 'get-stream';
import path from 'path';

import {
  ALERT_STRATEGY_TYPE,
  ALERT_STRATEGY,
  PDF_TEMPLATE,
  PDF_DIR,
  SENSORS,
  PDF_NAME_TYPE,
  PDF_TEMPLATE_NAME,
  PDF_LOGO,
  PDF_CONFIG,
  EXPORT_TYPE,
  RESPONSE_CODES,
} from '../gloable/gloable';
import * as constants from '../templates/constants';
import _config from '../gloable/config';
import * as _util from '../unitl';
import * as _common from '../gloable/common';
import _log from '../log';
import { templateRouter } from './routePath';
const { CODES_COMMON } = RESPONSE_CODES;

const savePdfToFile = (pdf, fileName) => {
  return new Promise((resolve, reject) => {
    // To determine when the PDF has finished being written successfully
    // we need to confirm the following 2 conditions:
    //
    //   1. The write stream has been closed
    //   2. PDFDocument.end() was called syncronously without an error being thrown

    let pendingStepCount = 2;

    const stepFinished = err => {
      if (--pendingStepCount == 0) {
        resolve();
      }
    };

    const writeStream = fs.createWriteStream(fileName);
    writeStream.on('close', stepFinished);
    pdf.pipe(writeStream);

    pdf.end();

    stepFinished();
  });
};

export const buildPdf = async function (info, monitors) {
  const { filter } = info || {};
  const {
    generateType = PDF_CONFIG.GENERATE_TYPE.BLOB,
    archiveFolder = _common.formatDate(new Date(), 8, PDF_CONFIG.PDF_ARCHIVE_FORMAT),
    needInfo = false,
    needBtPrintnfo = false,
    needFilePath = false,
    downloadHost = null, // web端传来自身下载的host地址，供pdf下载路径组装
  } = filter || {};
  // !首先判断文件系统是否正常init file system
  const { worked = false, error } = initFileSystem(archiveFolder);
  if (!worked) {
    return {
      ...CODES_COMMON.INTERNAL_ERROR,
      message: `filesystem created error:${error}`,
      data: {},
    };
  }
  const pdfName = getPdfName(info, monitors);
  _log.info('PDF name :', pdfName);
  // !create a document the same way as above
  const pdf = new PDFDocument({
    size: constants.PDF_INFO.SIZE,
    // ownerPassword: constants.PDF_INFO.OWNER_PASSWORD,
    permissions: {
      modifying: false,
      documentAssembly: true, // whether assembling document is allowed. Specify true to allow document assembly
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      printing: 'highResolution',
    },
    pdfVersion: constants.PDF_INFO.VERSION,
    // font: pdfLanguage !== 'zh' ? 'Helvetica' : path.join(__dirname, '../font/simsun.ttf'),
    info: {
      Title: pdfName,
      Author: getPdfAuthor(info),
      Subject: constants.PDF_INFO.SUBJECT,
    },
  });
  // !1、 pipe the document to a blob
  const file = path.resolve(PDF_DIR, archiveFolder, pdfName);
  _log.info('file path :', file);
  let pdfApiInfo = {};
  let pdfBtPrintInfo = {};
  try {
    const { apiInfo, btInfo } = drawPdf(pdf, info, monitors);
    pdfApiInfo = apiInfo;
    pdfBtPrintInfo = btInfo;
  } catch (error) {
    _log.error('drawPdf error = ', error);
    return {
      ...CODES_COMMON.INTERNAL_ERROR,
      message: error.message,
      data: null,
    };
  }

  await savePdfToFile(pdf, file);
  _log.info('savePdfToFile success');
  // !get a blob when you're done
  let blob = null;
  let downloadLink = '';
  if (generateType === PDF_CONFIG.GENERATE_TYPE.BLOB) {
    const stream = fs.createReadStream(file);
    blob = await getStream.buffer(stream, { encoding: 'base64' });

    // 删除原文件,还不能删除源文件，会将自动生成的删除掉
    // fs.unlinkSync(file);
    _log.info('generate type : blob ,  no downloadLink');
  } else {
    downloadLink = _util.getDownloadUrl(EXPORT_TYPE.PDF, archiveFolder, pdfName, downloadHost);
    _log.info('downloadLink :', downloadLink);
  }

  return {
    ...CODES_COMMON.SUCCESS,
    data: Object.assign(
      generateType === PDF_CONFIG.GENERATE_TYPE.BLOB
        ? {
            result: { data: blob },
            fileName: pdfName,
          }
        : {
            result: { data: blob },
            fileName: pdfName,
            downloadLink,
          },
      needInfo ? { pdfApiInfo: pdfApiInfo || {} } : {},
      needBtPrintnfo ? { pdfBtPrintInfo: pdfBtPrintInfo || {} } : {},
      needFilePath ? { file } : {}
    ),
  };
};

const getPdfAuthor = info => {
  const { product } = info || {};
  const { pdfLogoText = PDF_LOGO.LOGO_TEXT } = product || {};
  return pdfLogoText || PDF_LOGO.LOGO_TEXT;
};

/**
 * 主要判断保存pdf的路径是否存在，如果不存在，尝试创建路径
 * @returns boolean true：路径没问题，可以生成pdf
 *                  false: 路径搞不定，无法生成pdf
 */
const initFileSystem = archiveFolder => {
  let worked = true;
  let error = null;
  const pdfDir = path.resolve(PDF_DIR, archiveFolder);
  if (!fs.existsSync(pdfDir)) {
    try {
      _util.mkdirsSync(pdfDir);
    } catch (e) {
      worked = false;
      _log.error('pdf initFileSystem mkdirSync  error =', e);
      error = e;
    }
  }
  return { worked, error };
};

/**
 * 动态获取 drawPdf 方法的路径，用于require返回响应的方法
 * @param {*} pdfTemplateId model中配置的pdf模板id
 * @param {*} alertStrategy model中配置的果蔬还是医药，生成策略
 * @param {*} pdfLanguage  设置如果设置了PDFLanguage，用设置中的，如果没有用model配置的默认值
 * @returns  drawPdf方法的路径
 * ./frigga/guoshu/en
 * ./frigga/yiyao/zh
 * ......
 */
const getPdfRequirePath = (
  pdfTemplateId = 0,
  alertStrategy = ALERT_STRATEGY_TYPE.GUOSHU,
  pdfLanguage = _config.language
) => {
  const firstStage = PDF_TEMPLATE[pdfTemplateId];
  const secondStage = ALERT_STRATEGY[alertStrategy];
  const thirdStage = pdfLanguage;
  _log.info('pdf template require path :', `${firstStage}/${secondStage}/${thirdStage}`);
  let defaultMthod = templateRouter.frigga.guoshu.en;
  const mthodPath =
    templateRouter[firstStage || 'frigga'][secondStage || 'guoshu'][thirdStage || 'en'] || null;
  console.log('mthodPath', mthodPath);
  if (mthodPath != null) {
    defaultMthod = mthodPath;
  }
  // cause the params differ between yiyao and guoshu ,we make sure alertStrategy is correct
  // let pdfPath = `../templates/frigga/${ALERT_STRATEGY[alertStrategy]}/en`;
  // // judge the fixed path exsits or not
  // const fixedTemplatePath = `../templates/${PDF_TEMPLATE[pdfTemplateId]}/${ALERT_STRATEGY[alertStrategy]}/${pdfLanguage}`;
  // if (fs.existsSync(path.join(__dirname, `${fixedTemplatePath}.js`))) {
  //   pdfPath = fixedTemplatePath;
  // }

  return defaultMthod;
};

const getPdfLanguage = info => {
  const { product, device, filter } = info || {};
  const { params } = device || {};
  const { pdfLanguage: pdfLanguageSet } = params || {};
  const { pdfLanguage: pdfLanguageSelected } = filter || {};
  const { pdfLanguage: pdfLanguageConfig = _config.language } = product || {};

  return _util.getPdfLanguage(pdfLanguageConfig, pdfLanguageSelected || pdfLanguageSet);
};

/**
 * 这部分就是操作pdfKit api 来画pdf
 * @param {*} doc  pdfKit对象
 * @param {*} info
 * @param {*} monitors
 */
const drawPdf = (doc, info, monitors) => {
  const { product } = info || {};
  const {
    alertStrategy = ALERT_STRATEGY_TYPE.GUOSHU,
    pdfTemplateId = 0, // pdf模板id号
  } = product || {};

  const pdfLanguage = getPdfLanguage(info);
  const createPdf = getPdfRequirePath(pdfTemplateId, alertStrategy, pdfLanguage);
  try {
    return createPdf(doc, { ...info, pdfLanguage }, monitors);
  } catch (error) {
    _log.error('pdf  error =', error);
    return error
  }
};

/**
 ** 检查并更新文件名路径中的不符合文件名的字符
 * @param {*} str
 */
const pathPartCheckAndRefine = str => {
  const reg = /["'\\/?*:|<>\r\n;()&!`]/gim;
  let refinedStr = str;
  if (reg.test(str)) {
    // 说明存在特殊字符,那我们就需要替换特殊字符
    refinedStr = str.replace(reg, '');
    _log.error('文件路径包含特殊字符:', str, '  替换成：', refinedStr);
  }
  return refinedStr;
};

/**
 * 获取pdf的文件名
 * @param {*} info
 * @param {*} monitors
 * * 一定要注意校验文件名的合法性
 */
const getPdfName = (info, monitors) => {
  const { filter = {}, order = {}, product = {}, device = {} } = info || {};
  const { bounded, unbounded } = order || {};
  const NOVALUE = '\u2610';
  const { usage = 0, terNo, params = {} } = device || {};
  const { timeZone, tripId, from, to } = params || {};
  const { pdfNameType = PDF_NAME_TYPE.FRIGGA.type, pdfTemplateId = 0 } = product || {};

  // 这部分是前端传来的，用户筛选的部分
  const {
    forRenewReport = false, // 是否以用户传来的time作为pdf的start，end
    startTime: startTimeFromWeb,
    endTime: endTimeFromWeb,
  } = filter;

  const monitor = (monitors || {})[SENSORS.TEMP] || [];
  const startTime = _util.pdfApiStartEndTime(
    monitor.length > 0 ? new Date(monitor[0].timestamp) : bounded,
    startTimeFromWeb,
    forRenewReport,
    bounded
  );
  const endTime = _util.pdfApiStartEndTime(
    unbounded
      ? unbounded
      : monitor.length > 0
      ? new Date(monitor[monitor.length - 1].timestamp)
      : null, // 没有解绑时间时用数据的最后一点的时间，没有数据时，就不填了,
    endTimeFromWeb,
    forRenewReport,
    unbounded
  );

  const defaultName = _util.stringFormat([
    PDF_NAME_TYPE.FRIGGA.format,
    terNo,
    _common.formatDate(_util.isNumber(startTime) ? startTime : null, timeZone, 'YYYYMMDDHHmmss'),
    _common.formatDate(_util.isNumber(endTime) ? endTime : null, timeZone, 'YYYYMMDDHHmmss'),
  ]);
  let name = defaultName;
  const shengshengName = _util.stringFormat([
    PDF_NAME_TYPE.SHENGSHENG.format,
    (tripId && pathPartCheckAndRefine(tripId)) || NOVALUE,
    (from && pathPartCheckAndRefine(from)) || NOVALUE,
    (to && pathPartCheckAndRefine(to)) || NOVALUE,
    _common.formatDate(_util.isNumber(endTime) ? endTime : null, timeZone, 'YYYYMMDDHHmm'),
    terNo,
  ]);
  // 生生pdf文件名固化
  if (PDF_TEMPLATE[pdfTemplateId] === PDF_TEMPLATE_NAME.SHENGSHENG) {
    name = shengshengName;
  } else {
    switch (pdfNameType) {
      case PDF_NAME_TYPE.FRIGGA.type:
        name = defaultName;
        break;
      case PDF_NAME_TYPE.USAGE.type:
        name = _util.stringFormat([
          PDF_NAME_TYPE.USAGE.format,
          terNo,
          usage < 10 ? `0${usage}` : usage,
          _common.formatDate(
            _util.isNumber(startTime) ? startTime : null,
            timeZone,
            'YYYYMMDDHHmmss'
          ),
          _common.formatDate(_util.isNumber(endTime) ? endTime : null, timeZone, 'YYYYMMDDHHmmss'),
        ]);
        break;
      case PDF_NAME_TYPE.SHENGSHENG.type:
        name = shengshengName;
        break;
      default:
    }
  }
  const ext = '.pdf';
  const fileName = name.slice(0, 0 - ext.length); // 获取实际文件名（去掉扩展名
  // windows：232  linux:255
  const maxNameLen = 255 - ext.length;
  if (fileName.length > maxNameLen) {
    _log.error('PDF文件名过长:', name);
    name = fileName.slice(0, maxNameLen) + ext;
    _log.warn('只保留最长长度：', name);
  }
  return name;
};
