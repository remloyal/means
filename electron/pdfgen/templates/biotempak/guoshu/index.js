'use strict';

import {
  init,
  printHeadInfo,
  printDeviceInfo,
  printOrderInfo,
  printLoggingSummary,
  printDataSummary,
  printChart,
  printDataTable,
  printFoot,
  printEndorsement,
} from '../../guoshu';
import _log from '../../../log';

/**
 //* 画pdf
 * @param {pdfKit} pdf pdf实例
 * @param {object} info 各种设备，运单数据
 * @param {object} monitors 各个sensor的数据
 */
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
  _log.info('====【1】==== init ok');
  //* 画logo、title、notes 等顶部头信息
  printHeadInfo(pdf, {
    deviceInfo,
    summaryInfo,
    pdfInfo,
    sensorInfo,
    globalInfo,
    paddingConfigs: {
      topDelta: 29,
    },
    headDataSignConfigs: {
      specialLogoTextForBio: true,
    },
  });
  _log.info('====【2】==== printHeadInfo ok');
  //* 画Device Configuration
  printDeviceInfo(pdf, {
    deviceInfo,
    pdfInfo,
    globalInfo,
    paddingConfigs: {
      topDelta: 29,
    },
  });
  _log.info('====【3】==== printDeviceInfo ok');
  //* 画Order Information
  printOrderInfo(pdf, {
    deviceInfo,
    pdfInfo,
    globalInfo,
    paddingConfigs: {
      topDelta: 29,
    },
  });
  _log.info('====【4】==== printOrderInfo ok');
  //* 画Logging Summary
  printLoggingSummary(pdf, {
    sensorInfo,
    summaryInfo,
    deviceInfo,
    pdfInfo,
    globalInfo,
    paddingConfigs: {
      topDelta: 27,
    },
  });
  _log.info('====【5】==== printLoggingSummary ok');
  //* 画Data Summary
  printDataSummary(pdf, {
    pdfInfo,
    summaryInfo,
    sensorInfo,
    globalInfo,
    paddingConfigs: {
      topDelta: 8,
    },
  });
  _log.info('====【6】==== printDataSummary ok');
  //*画chart
  printChart(pdf, { sensorInfo, pdfInfo, deviceInfo, globalInfo });
  _log.info('====【7】==== printChart ok');
  //* 首页画页脚
  printFoot(pdf, { pdfInfo, ...deviceInfo, pageIndex: 1, globalInfo });
  _log.info('====【8】==== printFoot ok');
  //* 画data Table
  printDataTable(pdf, {
    sensorInfo,
    pdfInfo,
    deviceInfo,
    pageStartIndex: 2,
    printFoot,
    globalInfo,
    dataTableConfigs: {
      oneDatePerMonth: true, // 每个月只展示一个日期年月日
      markAlert: true,
    },
  });
  _log.info('====【9】==== printDataTable ok ');
  //* 画签名
  printEndorsement(pdf, {
    endorsementInfo,
    footPrint: printFoot,
    pdfInfo,
    globalInfo,
    deviceInfo,
  });
  _log.info('====【10】==== printEndorsement ok ===== 结束~~~');
  return { apiInfo, btInfo };
};
export default drawPdf;
