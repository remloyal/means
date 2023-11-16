'use strict';

import {
  SIGN,
  FONT_SIZE_TITLE,
  DELTA_Y_LABEL_LINE,
  FONT_SIZE_SMALL,
  DEFAULT_FONT_COLOR,
  PAGE_RIGHT_POS,
  FONT_SIZE_LOGO,
  NOVALUE,
  PDF_A4_WIDTH,
  PAGE_LEFT_POS,
} from '../../constants';
import { text } from '../../../gloable/language';
import { drawLine, getBoLangHao, checkContainChinese, getFont } from '../../pdfutil';
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
import * as _util from '../../../unitl';
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
    headDataSignConfigs: {
      logoTextFontSize: FONT_SIZE_LOGO - 3,
      calcuteStepFontSize: FONT_SIZE_LOGO,
    },
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
    printLoggingLessThree: printLoggingLessThreeSummay,
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

const printOrderInfo = (pdf, { deviceInfo, pdfInfo, globalInfo }) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  const {
    pdfLogoColor,
    layoutParams: { labelRightStartX, valueRightStartX },
    paddingTop: { TOP_POS_ORDER },
    row_delta: { FIRST_ROW_DELTA, ROW_DELTA },
  } = pdfInfo || {};
  const {
    companyName,
    shipmentId,
    startRecordTime,
    endRecordTime,
    from = '',
    to = '',
  } = deviceInfo || {};
  let posY = TOP_POS_ORDER;
  pdf
    .fontSize(FONT_SIZE_TITLE)
    .fillColor(pdfLogoColor)
    .text(text('PDF_ORDER_INFO', LANGUAGE), labelRightStartX, posY);
  // 画线
  posY += DELTA_Y_LABEL_LINE;
  drawLine(pdf, [labelRightStartX, posY], [PAGE_RIGHT_POS(), posY]);

  posY += FIRST_ROW_DELTA;
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_COMPANY_NAME', LANGUAGE), labelRightStartX, posY);
  if (checkContainChinese(companyName)) {
    pdf.font(getFont('zh')).text(companyName, valueRightStartX, posY);
  } else {
    pdf.text(companyName, valueRightStartX, posY);
  }

  posY += ROW_DELTA;
  pdf
    .font(getFont(LANGUAGE))
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_SHIPMENT_ID', LANGUAGE), labelRightStartX, posY);
  if (checkContainChinese(shipmentId)) {
    pdf.font(getFont('zh')).text(shipmentId, valueRightStartX, posY);
  } else {
    pdf.text(shipmentId, valueRightStartX, posY, {
      width: PDF_A4_WIDTH - valueRightStartX - PAGE_LEFT_POS(),
      lineBreak: false,
      lineGap: -2.5,
      // height: ROW_DELTA,
      ellipsis: true,
    });
  }

  posY += ROW_DELTA;
  pdf.font(getFont(LANGUAGE)).text(text('PDF_START_TIME', LANGUAGE), labelRightStartX, posY);
  // from to 长度有256，最长的时候，我们肯定是放不下的，所以我们限定一个长度来绘制from to
  const longer =
    (from && to && (from.length >= to.length ? from.length : to.length)) ||
    (from && from.length) ||
    (to && to.length) ||
    0;
  let ratio = 1 / 2;
  if (longer === 0) {
    ratio = 0; // 都没有值，不再保留from to的位置
  }
  if (LANGUAGE === 'en') {
  } else if (LANGUAGE === 'zh') {
  }
  const fromToWidth = (PAGE_RIGHT_POS() - valueRightStartX) * ratio;

  if (longer > 0) {
    if (checkContainChinese(from)) {
      pdf.font(getFont('zh')).text(from, valueRightStartX, posY, {
        width: fromToWidth,
        height: 30,
        lineGap: -2,
        ellipsis: true,
      });
    } else {
      pdf.text(from, valueRightStartX, posY, {
        width: fromToWidth,
        height: 30,
        lineGap: -2,
        ellipsis: true,
      });
    }
  }
  pdf.font(getFont(LANGUAGE)).text(startRecordTime, valueRightStartX + fromToWidth, posY, {
    lineBreak: false,
  });

  posY += ROW_DELTA;
  pdf.text(text('PDF_END_TIME', LANGUAGE), labelRightStartX, posY);
  if (longer > 0) {
    if (checkContainChinese(to)) {
      pdf.font(getFont('zh')).text(to, valueRightStartX, posY, {
        width: fromToWidth,
        height: 30,
        lineGap: -2,
        ellipsis: true,
      });
    } else {
      pdf.text(to, valueRightStartX, posY, {
        width: fromToWidth,
        height: 30,
        lineGap: -2,
        ellipsis: true,
      });
    }
  }
  pdf.font(getFont(LANGUAGE)).text(endRecordTime, valueRightStartX + fromToWidth, posY, {
    lineBreak: false,
  });
};

/**
 * 巴西客户特有的两sensor样式
 * @param {*} pdf
 * @param {*} param1
 */
const printLoggingLessThreeSummay = (
  pdf,
  { sensorInfo, globalInfo, pdfInfo, summaryInfo, deviceInfo, posY }
) => {
  const { LANGUAGE = 'en', UNIT } = globalInfo || {};
  const { sensors = [], thresholds = {} } = sensorInfo || {};
  const {
    layoutParams: { labelLeftStartX, valueLeftStartX, labelRightStartX, valueRightStartX },
    row_delta: { ROW_DELTA },
  } = pdfInfo || {};
  const { highests, lowests, averages, mkts, averageDeviations, showMkt } = summaryInfo || {};
  const { report, read, startDelayTime } = deviceInfo || {};

  const existTemp = sensors.includes(SENSORS.TEMP);
  const existHumi = sensors.includes(SENSORS.HUMI);
  const existSubTemp = sensors.includes(SENSORS.SUB_TEMP);
  const bothTemp = existTemp && existSubTemp;

  let thresh1Label = '';
  let thresh1Value = '';
  const { min: minTemp, max: maxTemp } = thresholds[SENSORS.TEMP] || {};
  const { min: minTemp2, max: maxTemp2 } = thresholds[SENSORS.SUB_TEMP] || {};
  const unitTemp = SIGN.UNIT(SENSORS.TEMP, LANGUAGE, { unit: UNIT });
  const { min: minHumi, max: maxHumi } = thresholds[SENSORS.HUMI] || {};
  const unitHumi = SIGN.UNIT(SENSORS.HUMI, LANGUAGE);

  // 温-湿
  if (existTemp && existHumi) {
    thresh1Label = text('PDF_TEMP_HUMI_THRESH', LANGUAGE);
    thresh1Value = `${_util.formatSensorValue(SENSORS.TEMP)(minTemp, 1)}${unitTemp}${getBoLangHao(
      LANGUAGE
    )}${_util.formatSensorValue(SENSORS.TEMP)(maxTemp, 1)}${unitTemp}/${_util.formatSensorValue(
      SENSORS.HUMI
    )(minHumi, 1)}${unitHumi}${getBoLangHao(LANGUAGE)}${_util.formatSensorValue(SENSORS.HUMI)(
      maxHumi,
      1
    )}${unitHumi}`;
  } else if (existTemp && existSubTemp) {
    // 温-温
    thresh1Label = text('PDF_BOTH_TEMPS_THRESH', LANGUAGE);
    thresh1Value = `${_util.formatSensorValue(SENSORS.TEMP)(minTemp, 1)}${unitTemp}${getBoLangHao(
      LANGUAGE
    )}${_util.formatSensorValue(SENSORS.TEMP)(maxTemp, 1)}${unitTemp}/${_util.formatSensorValue(
      SENSORS.SUB_TEMP
    )(minTemp2, 1)}${unitTemp}${getBoLangHao(LANGUAGE)}${_util.formatSensorValue(SENSORS.SUB_TEMP)(
      maxTemp2,
      1
    )}${unitTemp}`;
  } else if (existTemp && !existHumi) {
    // 单温
    thresh1Label = text('PDF_TEMP_THRESH', LANGUAGE);
    thresh1Value = `${_util.formatSensorValue(SENSORS.TEMP)(minTemp, 1)}${unitTemp}${getBoLangHao(
      LANGUAGE
    )}${_util.formatSensorValue(SENSORS.TEMP)(maxTemp, 1)}${unitTemp}`;
  }

  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(thresh1Label, labelLeftStartX, posY);
  pdf.text(thresh1Value, valueLeftStartX, posY);
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_START_DELAY', LANGUAGE), labelRightStartX, posY, {
      width: valueRightStartX - labelRightStartX,
      lineGap: -2,
    });
  pdf.text(startDelayTime, valueRightStartX, posY);

  // 一组（一行）数据
  posY += ROW_DELTA;
  pdf.text(
    text(bothTemp ? 'PDF_HIGHEST_TEMP1' : 'PDF_HIGHEST_TEMP', LANGUAGE),
    labelLeftStartX,
    posY
  );
  pdf.text(
    highests[SENSORS.TEMP].value === NOVALUE
      ? NOVALUE
      : `${_util.formatSensorValue(SENSORS.TEMP)(highests[SENSORS.TEMP].value, 1)}${unitTemp} (${
          highests[SENSORS.TEMP].time
        })`,
    valueLeftStartX,
    posY
  );
  pdf.text(
    text(bothTemp ? 'PDF_LOWEST_TEMP1' : 'PDF_LOWEST_TEMP', LANGUAGE),
    labelRightStartX,
    posY
  );
  pdf.text(
    lowests[SENSORS.TEMP].value === NOVALUE
      ? NOVALUE
      : `${_util.formatSensorValue(SENSORS.TEMP)(lowests[SENSORS.TEMP].value, 1)}${unitTemp} (${
          lowests[SENSORS.TEMP].time
        })`,
    valueRightStartX,
    posY,
    { lineBreak: false }
  );

  // 一组（一行）数据
  if (showMkt) {
    posY += ROW_DELTA;
    pdf.text(
      text(bothTemp ? 'PDF_TEMP1_AVERATE_STANDARD' : 'PDF_TEMP_AVERATE_STANDARD', LANGUAGE),
      labelLeftStartX,
      posY
    );
    pdf.text(
      averages[SENSORS.TEMP] === NOVALUE
        ? NOVALUE
        : `${_util.formatSensorValue(SENSORS.TEMP)(averages[SENSORS.TEMP], 1)}${unitTemp}/${
            averageDeviations[SENSORS.TEMP]
          }${unitTemp}`,
      valueLeftStartX,
      posY
    );
    pdf.text(text(bothTemp ? 'PDF_MKT1' : 'PDF_MKT', LANGUAGE), labelRightStartX, posY, {
      width: valueRightStartX - labelRightStartX,
      lineGap: -2,
    });
    pdf.text(
      mkts[SENSORS.TEMP] === NOVALUE
        ? NOVALUE
        : `${_util.formatSensorValue(SENSORS.TEMP)(mkts[SENSORS.TEMP], 1)}${unitTemp}`,
      valueRightStartX,
      posY
    );
  }
  // 一组（一行）数据
  if (existHumi) {
    posY += ROW_DELTA;
    pdf.text(text('PDF_HIGHEST_HUMI', LANGUAGE), labelLeftStartX, posY);
    pdf.text(
      highests[SENSORS.HUMI].value === NOVALUE
        ? NOVALUE
        : `${_util.formatSensorValue(SENSORS.HUMI)(highests[SENSORS.HUMI].value, 1)}${unitHumi} (${
            highests[SENSORS.HUMI].time
          })`,
      valueLeftStartX,
      posY
    );
    pdf.text(text('PDF_LOWEST_HUMI', LANGUAGE), labelRightStartX, posY);
    pdf.text(
      lowests[SENSORS.HUMI].value === NOVALUE
        ? NOVALUE
        : `${_util.formatSensorValue(SENSORS.HUMI)(lowests[SENSORS.HUMI].value, 1)}${unitHumi} (${
            lowests[SENSORS.HUMI].time
          })`,
      valueRightStartX,
      posY,
      { lineBreak: false }
    );
  }

  // 一组（一行）数据
  if (existSubTemp) {
    posY += ROW_DELTA;
    pdf.text(text('PDF_HIGHEST_TEMP2', LANGUAGE), labelLeftStartX, posY);
    pdf.text(
      highests[SENSORS.SUB_TEMP].value === NOVALUE
        ? NOVALUE
        : `${_util.formatSensorValue(SENSORS.SUB_TEMP)(
            highests[SENSORS.SUB_TEMP].value,
            1
          )}${unitTemp} (${highests[SENSORS.SUB_TEMP].time})`,
      valueLeftStartX,
      posY
    );
    pdf.text(text('PDF_LOWEST_TEMP2', LANGUAGE), labelRightStartX, posY);
    pdf.text(
      lowests[SENSORS.SUB_TEMP].value === NOVALUE
        ? NOVALUE
        : `${_util.formatSensorValue(SENSORS.SUB_TEMP)(
            lowests[SENSORS.SUB_TEMP].value,
            1
          )}${unitTemp} (${lowests[SENSORS.SUB_TEMP].time})`,
      valueRightStartX,
      posY,
      { lineBreak: false }
    );
    if (showMkt) {
      posY += ROW_DELTA;
      pdf.text(text('PDF_TEMP2_AVERATE_STANDARD', LANGUAGE), labelLeftStartX, posY);
      pdf.text(
        averages[SENSORS.SUB_TEMP] === NOVALUE
          ? NOVALUE
          : `${_util.formatSensorValue(SENSORS.SUB_TEMP)(
              averages[SENSORS.SUB_TEMP],
              1
            )}${unitTemp}/${averageDeviations[SENSORS.SUB_TEMP]}${unitTemp}`,
        valueLeftStartX,
        posY
      );
      pdf.text(text('PDF_MKT2', LANGUAGE), labelRightStartX, posY, {
        width: valueRightStartX - labelRightStartX,
        lineGap: -2,
      });
      pdf.text(
        mkts[SENSORS.SUB_TEMP] === NOVALUE
          ? NOVALUE
          : `${_util.formatSensorValue(SENSORS.SUB_TEMP)(mkts[SENSORS.SUB_TEMP], 1)}${unitTemp}`,
        valueRightStartX,
        posY
      );
    }
  }

  // 一组（一行）数据
  posY += ROW_DELTA;
  pdf.text(text('PDF_REPORT_INTERVAL', LANGUAGE), labelLeftStartX, posY);
  pdf.text(report, valueLeftStartX, posY);
  pdf.text(text('PDF_RECORD_INTERVAL', LANGUAGE), labelRightStartX, posY);
  pdf.text(read, valueRightStartX, posY);
};

export default drawPdf;
