'use strict';

import {
  FONT_SIZE_TITLE,
  DELTA_Y_LABEL_LINE,
  PAGE_RIGHT_POS,
  FONT_SIZE_SMALL,
  DEFAULT_FONT_COLOR,
} from '../../constants';
import { text } from '../../../gloable/language';
import { drawLine } from '../../pdfutil';
import {
  init,
  printHeadInfo,
  printDeviceInfo,
  printLoggingSummary,
  printDataSummary,
  printChart,
  printFoot,
  printDataTable,
  printEndorsement,
} from '../../guoshu';
import { SENSORS } from '../../../gloable/gloable';
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
  _log.info('====【1】==== init ok');
  //* 画logo、title、notes 等顶部头信息
  printHeadInfo(pdf, {
    deviceInfo,
    summaryInfo,
    pdfInfo,
    sensorInfo,
    globalInfo,
  });
  _log.info('====【2】==== printHeadInfo ok');
  //* 画Device Configuration
  printDeviceInfo(pdf, { deviceInfo, pdfInfo, globalInfo });
  _log.info('====【3】==== printDeviceInfo ok');
  //* 画Order Information
  printOrderInfo(pdf, { deviceInfo, pdfInfo, globalInfo });
  _log.info('====【4】==== printOrderInfo ok');
  //* 画Logging Summary
  printLoggingSummary(pdf, {
    sensorInfo,
    summaryInfo,
    deviceInfo,
    pdfInfo,
    globalInfo,
  });
  _log.info('====【5】==== printLoggingSummary ok');
  //* 画Data Summary
  printDataSummary(pdf, {
    pdfInfo,
    summaryInfo,
    sensorInfo,
    globalInfo,
    showSensors: [SENSORS.TEMP, SENSORS.HUMI, SENSORS.SUB_TEMP],
  });
  _log.info('====【6】==== printDataSummary ok');
  //*画chart
  printChart(pdf, { sensorInfo, pdfInfo, deviceInfo, globalInfo });
  _log.info('====【7】==== printChart ok');
  //* 首页画页脚
  printFoot(pdf, { pdfInfo, ...deviceInfo, pageIndex: 1, globalInfo });
  _log.info('====【8】==== printFoot ok');
  //* 画data Table
  printDataTable(pdf, { sensorInfo, pdfInfo, deviceInfo, pageStartIndex: 2, globalInfo });
  _log.info('====【9】==== printDataTable ok ');
  //* 画签名
  printEndorsement(pdf, { endorsementInfo, footPrint: printFoot, pdfInfo, globalInfo, deviceInfo });
  _log.info('====【10】==== printEndorsement ok ===== 结束~~~');
  return { apiInfo, btInfo };
};

/**
 //* 绘制 Order Information
 * @param {pdfKit} pdf 
 * @param {object} deviceInfo 
 */
const printOrderInfo = (pdf, { deviceInfo, pdfInfo, globalInfo }) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  const {
    pdfLogoColor,
    layoutParams: { labelRightStartX, valueRightStartX },
    paddingTop: { TOP_POS_ORDER },
    row_delta: { FIRST_ROW_DELTA, ROW_DELTA },
  } = pdfInfo || {};
  const { startRecordTime, endRecordTime } = deviceInfo || {};
  let posY = TOP_POS_ORDER;
  pdf
    .fontSize(FONT_SIZE_TITLE)
    .fillColor(pdfLogoColor)
    .text(text('PDF_ORDER_INFO', LANGUAGE), labelRightStartX, posY);
  // 画线
  posY += DELTA_Y_LABEL_LINE;
  drawLine(pdf, [labelRightStartX, posY], [PAGE_RIGHT_POS(), posY]);

  posY += FIRST_ROW_DELTA;
  // pdf
  //   .fontSize(FONT_SIZE_SMALL)
  //   .fillColor(DEFAULT_FONT_COLOR)
  //   .text(text('PDF_COMPANY_NAME', LANGUAGE), labelRightStartX, posY);
  // pdf.text(companyName, valueRightStartX, posY);

  posY += ROW_DELTA;
  // pdf.text(text('PDF_SHIPMENT_ID', LANGUAGE), labelRightStartX, posY);
  // pdf.text(shipmentId, valueRightStartX, posY);

  posY += ROW_DELTA;
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_START_TIME', LANGUAGE), labelRightStartX, posY);
  pdf.text(startRecordTime, valueRightStartX, posY);

  posY += ROW_DELTA;
  pdf.text(text('PDF_END_TIME', LANGUAGE), labelRightStartX, posY);
  pdf.text(endRecordTime, valueRightStartX, posY);
};

export default drawPdf;
