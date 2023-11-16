'use strict';

import {
  init,
  printHeadInfo,
  printDeviceInfo,
  printOrderInfo,

  printLoggingSummary,
  printDataTable,
  printDataSummary,
  printChart,
  printFoot,
  printEndorsement,
} from '../../yiyao';
import _log from '../../../log';

const drawPdf = function (pdf, info, monitors) {
  //* 初始化工作
  const {
    sensorInfo,
    deviceInfo,
    summaryInfo,
    pdfInfo,
    globalInfo,
    apiInfo,
    btInfo,
    endorsementInfo,
  } = init(info, monitors);

  const { LANGUAGE = 'en' } = globalInfo || {};
  _log.info('====【1】==== init ok');
  //* 画logo、title、notes 等顶部头信息
  printHeadInfo(pdf, {
    deviceInfo,
    summaryInfo,
    pdfInfo,
    sensorInfo,
    globalInfo,
    headDataSignConfigs: { showDataReport: LANGUAGE !== 'ru' },
  });
  _log.info('====【2】==== printHeadInfo ok');
  //* 画Device Configuration
  printDeviceInfo(pdf, { deviceInfo, pdfInfo, globalInfo });
  _log.info('====【3】==== printDeviceInfo ok');
  //* 画Order Information
  printOrderInfo(pdf, { deviceInfo, pdfInfo, globalInfo });
  _log.info('====【4】==== printOrderInfo ok');
  //* 画Logging Summary
  printLoggingSummary(pdf, { sensorInfo, summaryInfo, deviceInfo, pdfInfo, globalInfo });
  _log.info('====【5】==== printLoggingSummary ok');
  //* 画Data Summary
  printDataSummary(pdf, { pdfInfo, summaryInfo, sensorInfo, globalInfo });
  _log.info('====【6】==== printDataSummary ok');
  //*画chart
  const { pages = 1 } = printChart(pdf, { sensorInfo, pdfInfo, deviceInfo, globalInfo, printFoot });
  _log.info('====【7】==== printChart ok');
  //* 画data Table
  printDataTable(pdf, {
    sensorInfo,
    pdfInfo,
    deviceInfo,
    pageStartIndex: pages + 1,
    footPrint: printFoot,
    globalInfo,
  });
  _log.info('====【9】==== printDataTable ok ');
  //* 画签名
  printEndorsement(pdf, { endorsementInfo, footPrint: printFoot, pdfInfo, globalInfo, deviceInfo });
  _log.info('====【10】==== printEndorsement ok ===== 结束~~~');
  return { apiInfo, btInfo };
};

export default drawPdf;
