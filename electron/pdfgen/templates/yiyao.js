/* eslint-disable */
'use strict';

import {
  PDF_A4_WIDTH,
  PDF_LOGO_HEIG,
  PDF_LOGO_WIDTH,
  PADDING_TOP_HEAD,
  PAGE_LEFT_POS,
  PAGE_RIGHT_POS,
  FONT_SIZE_SMALL,
  PDF_A4_HEIGHT,
  PADDING_BOTTOM_FOOT,
  FONT_SIZE_TITLE,
  ALARM_COLOR,
  DEFAULT_FONT_COLOR,
  DELTA_Y_LABEL_LINE,
  PADDING_TOP_DATA_SUMMARY,
  PADDING_TOP_LOGGING_SUMMARY,
  SIGN,
  PADDING_LEFT_CHART_FROM_LEFT_POS,
  CHART_Y_PARTS,
  CHART_Y_PARTS_YIYAO_HUMI,
  CHART_INNER_HEIG,
  CHART_X_PARTS,
  PADDING_TOP_CHART,
  FONT_SIZE_LARGE,
  DASH,
  CHART_COLORS,
  FONT_SIZE_SMALLER,
  NOVALUE,
} from '../templates/constants';
import * as _common from '../gloable/common';
import {
  initGlobalInfo,
  initSensorInfo,
  initDeviceInfo,
  initChartXValues,
  initPdfInfo,
  initDataTableParams,
  initApiInfo,
  initBtPrintInfo,
  initEndorsementInfo,
  drawHeadLogo,
  drawHeadFileCreatedDate,
  drawHeadDataReportSign,
  drawHeadNoteSign,
  drawAlertSign,
  printDeviceInfo,
  printOrderInfo,
  printDataTable,
  printTableTitle,
  printTableData,
  printEndorsement,
} from './index';
import { SENSORS, PDF_LOGO } from '../gloable/gloable';
import {
  calcuteYiyaoSummary,
  textBreak,
  drawLine,
  getPos,
  stepLength,
  footPageNumberDeltaX,
  getFont,
  needTransSensorValue,
} from '../templates/pdfutil';
import { text } from '../gloable/language';
import * as _util from '../unitl';
import _log from '../../unitls/log';
import { transFahr } from '../unitl';

const paintYiyao = (pdf, info, monitors) => {
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
  printDataSummary(pdf, { pdfInfo, summaryInfo, sensorInfo, globalInfo });
  _log.info('====【6】==== printDataSummary ok');
  //*画chart
  const { pages = 1 } = printChart(pdf, {
    sensorInfo,
    pdfInfo,
    deviceInfo,
    globalInfo,
    printFoot,
  });
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

const init = (info, monitors) => {
  const { filter } = info || {};
  const { needInfo = false, needBtPrintnfo = false } = filter || {};

  const globalInfo = initGlobalInfo(info);

  //* 初始化sensor相关信息
  let sensorInfo = initSensorInfo(globalInfo, info, monitors);

  // 医药的threshold有些不同，所以，这里重新做threshold的初始化
  const thresholds = refineThresholds(sensorInfo, globalInfo);

  //* 初始化deviceInfo
  const deviceInfo = initDeviceInfo(globalInfo, info, sensorInfo);

  //* 初始化summaryInfo
  const summaryInfo = initSummaryInfo(globalInfo, info, sensorInfo);

  // chart params需要refined过的thresholds
  sensorInfo = { ...sensorInfo, thresholds };

  //* 初始化pdf信息
  const pdfInfoOrigin = initPdfInfo(
    globalInfo,
    info,
    { deviceInfo, sensorInfo, summaryInfo },
    { initChart: initChartParams }
  );
  const pdfInfo = {
    ...pdfInfoOrigin,
    ...initPaddingTop({ sensorInfo, pdfInfo: pdfInfoOrigin }),
  };

  const apiInfo = needInfo ? initApiInfo(sensorInfo, deviceInfo, summaryInfo) : {};
  const btInfo = needBtPrintnfo ? initBtPrintInfo(sensorInfo, deviceInfo, summaryInfo) : {};
  const endorsementInfo = initEndorsementInfo(info);
  // 医药因为单独绘制图表，所以，会导致页码改变，所以这里需要做一个适配
  const {
    dataTableParams,
    chartParams: { params },
  } = pdfInfo;

  return {
    sensorInfo,
    deviceInfo,
    summaryInfo,
    pdfInfo: {
      ...pdfInfo,
      dataTableParams: {
        ...dataTableParams,
        basePages: 1 + Math.ceil((Object.keys(params).length - 1) / 2),
      },
    },
    globalInfo,
    apiInfo,
    btInfo,
    endorsementInfo,
  };
};

const initPaddingTop = ({ sensorInfo, pdfInfo }) => {
  const { paddingTop, row_delta } = pdfInfo || {};
  const { ROW_DELTA = 10 } = row_delta || {};
  const { sensorCnt = 1, alertSign = [], sensors } = sensorInfo || {};
  return { paddingTop };
  // TODO 待确认吧
  if (sensorCnt === 1) {
    return {
      paddingTop: {
        ...paddingTop,
        TOP_POS_DEVICE: paddingTop.TOP_POS_DEVICE + ROW_DELTA,
        TOP_POS_ORDER: paddingTop.TOP_POS_ORDER + ROW_DELTA,
      },
    };
  } else {
    return { paddingTop };
  }
};

/**
 * 因为医药的温度threshold有些特殊性，所以这里需要特殊处理下
 * @param {*} sensorInfo
 */
const refineThresholds = (sensorInfo, globalInfo) => {
  const { thresholds = {} } = sensorInfo || {};
  const { UNIT } = globalInfo;
  return Object.keys(thresholds).reduce((pre, type) => {
    /**
     * min:全部都按照 array的形式，统一形式去存储
     * minest,maxest才存放所有min最小的min，所有max最大的max，供他人使用
     */
    const thresh = { min: [], max: [], minest: 0, maxest: 0 };
    if (_util.supportYiyaoFormatParams(type)) {
      const needTransValue = needTransSensorValue(type, UNIT);
      const transValue = val => {
        return needTransValue ? transFahr(val) : val;
      };
      const { min1 = {}, max1 = {}, min2 = {}, max2 = {} } = thresholds[type];
      thresh.min.push({
        value: transValue(min1.value || 0),
        valueOrigin: min1.value || 0,
        label: 'L1',
        show: !!min1.alert,
      });
      thresh.min.push({
        value: transValue(min2.value || 0),
        valueOrigin: min2.value || 0,
        label: 'L2',
        show: !!min2.alert,
      });
      thresh.max.push({
        value: transValue(max1.value || 0),
        valueOrigin: max1.value || 0,
        label: 'H1',
        show: !!max1.alert,
      });
      thresh.max.push({
        value: transValue(max2.value || 0),
        valueOrigin: max2.value || 0,
        label: 'H2',
        show: !!max2.alert,
      });
      let threshMin = null;
      let threshMinOrigin = null;
      thresh.min.forEach(mi => {
        const { valueOrigin, value } = mi || {};
        if (valueOrigin !== undefined) {
          if (threshMinOrigin !== null) {
            if (threshMinOrigin > valueOrigin) {
              threshMinOrigin = valueOrigin;
              threshMin = value;
            }
          } else {
            threshMinOrigin = valueOrigin;
            threshMin = value;
          }
        }
      });
      thresh.minest = threshMin;
      thresh.minestOrigin = threshMinOrigin;

      let threshMax = null;
      let trheshMaxOrigin = null;
      thresh.max.forEach(ma => {
        const { valueOrigin, value } = ma || {};
        if (valueOrigin !== undefined) {
          if (trheshMaxOrigin !== null) {
            if (trheshMaxOrigin < valueOrigin) {
              trheshMaxOrigin = valueOrigin;
              threshMax = value;
            }
          } else {
            trheshMaxOrigin = valueOrigin;
            threshMax = value;
          }
        }
      });
      thresh.maxest = threshMax;
      thresh.maxestOrigin = trheshMaxOrigin;
    } else {
      const { min = 0, max = 0, alert } = thresholds[type];
      thresh.min.push({
        value: min,
        valueOrigin: min,
        label: 'L',
        show: !!alert,
      });
      thresh.max.push({
        value: max,
        valueOrigin: max,
        label: 'H',
        show: !!alert,
      });
      thresh.minest = min;
      thresh.minestOrigin = max;
      thresh.maxest = max;
      thresh.maxestOrigin = max;
    }
    return { ...pre, [type]: thresh };
  }, {});
};

const initSummaryInfo = (globalInfo, info, sensorInfo) => {
  const { order, product, timeZone } = info || {};
  const { summaryData = {} } = order || {};

  const { LANGUAGE = 'en', DATE_FORMAT = 'YY-MM-DD HH:MM:SS', UNIT } = globalInfo || {};
  const { sensors = [], thresholds = {}, datas = {} } = sensorInfo || {};
  const { pdfMktShow = false } = product || {};

  let isAlarm = false;
  const alarmCount = {};
  const highests = {};
  const lowests = {};
  const averages = {};
  const mkts = {};
  const averageDeviations = {};
  const sumPows = {};

  for (let index = 0; index < sensors.length; index++) {
    const type = sensors[index] || '';
    const data = datas[type] || [];
    if ([SENSORS.TEMP, SENSORS.HUMI, SENSORS.SUB_TEMP].includes(type)) {
      const { alarm, alarms, highest, lowest, average, mkt, averageDeviation, sumPow } =
        calcuteYiyaoSummary({
          data,
          threshold: thresholds[type] || {},
          type,
          summaryData,
          product,
          timeZone,
          language: LANGUAGE,
          mask: DATE_FORMAT,
          needTransSensorValue: needTransSensorValue(type, UNIT),
          unit: UNIT,
        });
      alarmCount[type] = alarms;
      highests[type] = highest;
      lowests[type] = lowest;
      averages[type] = average;
      mkts[type] = mkt;
      averageDeviations[type] = averageDeviation;
      sumPows[type] = sumPow;
      if (!isAlarm && alarm) isAlarm = alarm;
    }
  }

  //todo 获取如下结构数据
  return {
    isAlarm,
    alarmCount,
    highests,
    lowests,
    averages,
    mkts,
    averageDeviations,
    sumPows,
    showMkt: !!pdfMktShow,
  };
};

/*
//* record chart 参数初始化
  医药的chart是属于自己的样式
  因为是独立的每个表，所以，对比于果蔬的，就需要把果蔬的一个chartParams作为一组数据分别记录到各自sensor中
*/
const initChartParams = ({ sensorInfo, summaryInfo, globalInfo }) => {
  const { sensors = [], thresholds = {}, datas = {}, dataCount } = sensorInfo || {};
  const { highests = {}, lowests = {} } = summaryInfo || {};
  const { UNIT } = globalInfo;

  const chartWidth = PDF_A4_WIDTH - 2 * (PAGE_LEFT_POS() + PADDING_LEFT_CHART_FROM_LEFT_POS());

  // 左侧坐标轴 ：最高Y位置点映射的温度值（不一定是温度的最高值，需要综合阈值以及布局分布需要确定的值）
  let topPosYValue = undefined;
  // 左侧坐标轴 ：最低Y位置点映射的温度值（不一定是温度的最低值，需要综合阈值以及布局分布需要确定的值）
  let bottomPosYValue = undefined;
  // topPosYValue - bottomPosYValue 需要满足delta值能被CHART_Y_PARTS整除，这样下面的单位高度就是一个整数，尽量减少精度带来的偏差
  // 左侧坐标轴 ：单位sensor值对应的高度
  let heightYPerValue = 0;
  // 为了给Y轴每行轴线标记相应的坐标值
  let valueDeltaPerYPart = undefined;
  let heightDeltaPerYPart = undefined;
  let startYDelta = 0;

  // 通过以上，可以计算得出每个点的值 映射到pdf坐标系中的Y轴位置
  // valuePosY = chartStartY + heightYPerValue * ( topPosYValue - value )

  // X坐标轴： 单位时间对应的宽度
  let widthXPerValue = 0;
  // 左侧Y轴所有坐标点的值
  let YValues = [];

  const params = sensors.reduce((pre, type) => {
    return { ...pre, [type]: {} };
  }, {}); // 保存每个sensor对应的chartParams

  const getLengthPerValue = (topValue, bottomValue, innerHeight) => {
    return innerHeight / (topValue - bottomValue);
  };

  sensors.forEach(type => {
    YValues = [];
    // 医药导出，只支持temp、subTemp、humi，但是humi是固定的Y轴，所以这里只搞定两个会改变的sensor params就行了
    if ([SENSORS.TEMP, SENSORS.SUB_TEMP].includes(type)) {
      const needTransValue = needTransSensorValue(type, UNIT);
      const { minestOrigin: minest, maxestOrigin: maxest } = thresholds[type];
      const { valueOrigin: highest } = highests[type];
      const { valueOrigin: lowest } = lowests[type];

      heightDeltaPerYPart = CHART_INNER_HEIG() / CHART_Y_PARTS;
      // 先给两个默认值，因为阈值不会有异常值，所以，默认赋值阈值
      if (undefined === topPosYValue) {
        topPosYValue = maxest;
      }
      if (_util.isValidSensor(highest)) {
        topPosYValue = Math.max(maxest, highest, topPosYValue);
      } else {
        topPosYValue = Math.max(maxest, topPosYValue);
      }
      if (undefined === bottomPosYValue) {
        bottomPosYValue = minest;
      }
      if (_util.isValidSensor(lowest)) {
        bottomPosYValue = Math.min(minest, lowest, bottomPosYValue);
      } else {
        bottomPosYValue = Math.min(minest, bottomPosYValue);
      }

      let deltaMore = 0;
      // 设备端是*10来操作的，所以，这边为了同步，也进行*10来操作
      topPosYValue *= 10;
      bottomPosYValue *= 10;
      const maxMinDelta = topPosYValue - bottomPosYValue;
      if (Math.floor(maxMinDelta / CHART_Y_PARTS) > 0) {
        deltaMore = Math.floor(maxMinDelta / CHART_Y_PARTS);
      } else {
        deltaMore = 1;
      }

      //确定最高温度与最低温度后，多画一部分,也就是坐标最高点比温度数据最高温度多一点
      topPosYValue += deltaMore;
      bottomPosYValue -= deltaMore;

      const reminder = (topPosYValue - bottomPosYValue) % CHART_Y_PARTS;
      //如果不能整除,要去凑整数,max与min都相应增加与减少，这样分布更均匀
      if (reminder != 0) {
        topPosYValue += Math.floor((CHART_Y_PARTS - reminder) / 2); //为了保证下面能整除
        bottomPosYValue -=
          Math.floor((CHART_Y_PARTS - reminder) / 2) + ((CHART_Y_PARTS - reminder) % 2);
      }

      // 重新去10操作
      topPosYValue = topPosYValue / 10;
      bottomPosYValue = bottomPosYValue / 10;

      heightYPerValue = getLengthPerValue(topPosYValue, bottomPosYValue, CHART_INNER_HEIG());
      if (needTransValue) {
        heightYPerValue = getLengthPerValue(
          transFahr(topPosYValue),
          transFahr(bottomPosYValue),
          CHART_INNER_HEIG()
        );
      }
      valueDeltaPerYPart = ((topPosYValue - bottomPosYValue) * 10) / CHART_Y_PARTS / 10;

      for (let i = 0; i < CHART_Y_PARTS + 1; i++) {
        if (i === CHART_Y_PARTS) {
          // 保险起见，最后一个点的值，直接用计算得到的bottom赋值
          YValues.push(bottomPosYValue);
        } else {
          YValues.push(topPosYValue - i * valueDeltaPerYPart);
        }
      }

      if (needTransValue) {
        YValues = YValues.map(y => transFahr(y));
        topPosYValue = transFahr(topPosYValue);
        bottomPosYValue = transFahr(bottomPosYValue);
        valueDeltaPerYPart = ((topPosYValue - bottomPosYValue) * 10) / CHART_Y_PARTS / 10;
      }
    } else if ([SENSORS.HUMI].includes(type)) {
      heightDeltaPerYPart = CHART_INNER_HEIG() / CHART_Y_PARTS_YIYAO_HUMI;
      // startYDelta = CHART_INNER_HEIG() / CHART_Y_PARTS_YIYAO_HUMI; // 因为绘制的最高坐标少一个空格
      startYDelta = 0;
      topPosYValue = 100;
      bottomPosYValue = 0;
      heightYPerValue = getLengthPerValue(topPosYValue, bottomPosYValue, CHART_INNER_HEIG());
      valueDeltaPerYPart = Math.floor((topPosYValue - bottomPosYValue) / CHART_Y_PARTS_YIYAO_HUMI);

      for (let i = 0; i < CHART_Y_PARTS_YIYAO_HUMI + 1; i++) {
        if (i === CHART_Y_PARTS_YIYAO_HUMI) {
          // 保险起见，最后一个点的值，直接用计算得到的bottom赋值
          YValues.push(bottomPosYValue);
        } else {
          YValues.push(topPosYValue - i * valueDeltaPerYPart);
        }
      }
      // for (let i = 0; i < CHART_Y_PARTS + 1; i++) {
      //   if (i === 0) {
      //     // 这里只是填充一个相同间隔的值，供绘制横线使用，但是，湿度是空最上面的位置的
      //     YValues.push(topPosYValue + valueDeltaPerYPart);
      //     YValues.push(topPosYValue - valueDeltaPerYPart * i);
      //   } else if (i !== CHART_Y_PARTS) {
      //     if (i === CHART_Y_PARTS - 1) {
      //       YValues.push(bottomPosYValue); // 保险起见,最后一个点是0
      //     } else {
      //       YValues.push(topPosYValue - valueDeltaPerYPart * i);
      //     }
      //   }
      // }
    }

    params[type] = {
      topPosYValue, // 左侧Y轴：最高Y位置点映射的温度值（不一定是温度的最高值，需要综合阈值以及布局分布需要确定的值）
      bottomPosYValue, // 左侧Y轴：最低Y位置点映射的温度值（不一定是温度的最低值，需要综合阈值以及布局分布需要确定的值）
      heightYPerValue, // 左侧Y轴：单位sensor值对应的高度
      valueDeltaPerYPart, // 为了给Y轴每行轴线标记相应的坐标值
      heightDeltaPerYPart, // Y轴向，每格多高
      YValues, // 左侧Y轴:所有坐标点的值
      startYDelta,
    };
  });

  // X轴向，每格多宽
  const widthDeltaPerXPart = chartWidth / CHART_X_PARTS;
  // X轴坐标点的值
  //* 这是一种理想的均分状态，但是x轴移动时，会有精度差的，如果按照这个绘制了X line，那么x轴上的点，不一定能正好绘制到轴线上
  const tempData = datas[SENSORS.TEMP] || [];
  const XValues = initChartXValues(tempData, CHART_X_PARTS);
  //TODO X轴坐标点的index，用于绘制X轴线，这样能保证轴线上的点能绘制到轴线上
  const XIndexs = [];
  widthXPerValue = getLengthPerValue(
    tempData.length - 1,
    0,
    // X轴整体分布需要根据X轴坐标点分布来确定,不一定是整个表的宽度，如果X轴不满CHART_X_PARTS个坐标点，那么折线分布，不会达到图表最右侧
    XValues.length - 1 >= CHART_X_PARTS
      ? chartWidth
      : (chartWidth / CHART_X_PARTS) * (XValues.length - 1)
  );

  return {
    chartWidth,
    params,

    //*X轴信息
    widthXPerValue, // X坐标轴： 单位时间对应的宽度
    widthDeltaPerXPart, // X轴向，每格多宽
    XValues, // X轴坐标点的值
    XIndexs,
  };
};

/**
 //* 绘制pdf头部信息 ：Logo、File Created Date、Note、Data Report...
 * @param {pdfKit} pdf 
 * @param {*} param1 
 */
const printHeadInfo = (
  pdf,
  { deviceInfo = {}, summaryInfo = {}, pdfInfo, sensorInfo, globalInfo, headDataSignConfigs = {} }
) => {
  const { showDataReport = true, logoText } = headDataSignConfigs || {};
  const { pdfLogoColor, pdfLogoText, dateFormat } = pdfInfo || {};
  const { fileCreatedTime, timeZone, stopMode } = deviceInfo || {};
  const { sensorCnt, alertSign = [] } = sensorInfo || {};
  const { isAlarm = false, alarmCount = {} } = summaryInfo || {};
  // 记录坐标x的位置,起始位置与最左边有一定padding
  let posX = PAGE_LEFT_POS();
  let posY = PADDING_TOP_HEAD();
  const logoWidth = PDF_LOGO_WIDTH();
  const logoHeight = PDF_LOGO_HEIG();
  //! #################################################################
  //* 1、画logo
  //! #################################################################
  drawHeadLogo(pdf, {
    globalInfo,
    startX: posX,
    startY: posY + 1,
    logoHeight,
    logoWidth,
    isAlarm,
  });

  //! #################################################################
  //* 2、File Created Date
  //! #################################################################
  posX += logoWidth + 8; // 往右移动logo的宽度，再稍稍有些距离
  drawHeadFileCreatedDate(pdf, {
    startX: posX,
    startY: posY,
    fileCreatedTime,
    globalInfo,
  });

  //! #################################################################
  //* 3、Frigga Ⓡ Data Report
  //! #################################################################
  // 拆成三部分
  // 1、logoText model中配置的客户名称
  // 2、Ⓡ符号
  // 3、Data Report字样
  posY += 15;
  drawHeadDataReportSign(pdf, {
    startX: posX,
    startY: posY,
    pdfLogoColor,
    pdfLogoText: logoText || pdfLogoText,
    globalInfo,
    showDataReport,
  });

  //! #################################################################
  //* 4、Note:All times shown are based on UTC+8:00。。。
  //! #################################################################
  posX = PAGE_LEFT_POS();
  const alertSignDelta = alertSign.length > 0 ? (sensorCnt < 3 ? 2 : 5) : 0;
  posY = PADDING_TOP_HEAD() + logoHeight + 21;
  drawHeadNoteSign(pdf, {
    startX: posX,
    startY: posY - 2 * alertSignDelta,
    timeZone,
    dateFormat,
    globalInfo,
  });

  //! #################################################################
  //* 5、stop mode
  //! #################################################################
  const { startX } = drawHeadDataSummay(pdf, {
    startX: PAGE_RIGHT_POS() - 30,
    startY: PADDING_TOP_HEAD() + 5,
    globalInfo,
    stopMode,
  });

  //! #################################################################
  //* 6、绘制alertSign,依赖dataSummay的起始位置，因为不能绘制超过其起始位置，所以需要确定一个最宽的距离
  //! #################################################################
  drawAlertSign(pdf, {
    startY: posY + 5 - alertSignDelta,
    width: startX - PAGE_LEFT_POS(),
    sensorInfo,
  });
};

const drawHeadDataSummay = (pdf, { startX, startY, stopMode, globalInfo }) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  pdf.font(getFont(LANGUAGE)).fillColor(DEFAULT_FONT_COLOR);
  const label = text('PDF_STOP_MODE', LANGUAGE);
  const posX = startX - stepLength(label, { fontSize: FONT_SIZE_SMALL, lan: LANGUAGE }) - 5;
  // 就以startX 为原点，label部分，往左腾一部分空间绘制，value部分，往右直接绘制
  textBreak(pdf, label, posX, startY);
  textBreak(pdf, stopMode, startX + 7, startY);
  return { startX: posX };
};

/**
 //* 绘制 Order Information
 * @param {pdfKit} pdf 
 * @param {object} deviceInfo 
 */
const printLoggingSummary = (pdf, { sensorInfo, summaryInfo, deviceInfo, pdfInfo, globalInfo }) => {
  const { LANGUAGE = 'en', UNIT } = globalInfo || {};
  const { dataCount, sensors = [] } = sensorInfo || {};
  const {
    pdfLogoColor,
    layoutParams: { labelLeftStartX, valueLeftStartX, labelRightStartX, valueRightStartX },
  } = pdfInfo || {};
  const { highests, lowests, averages, mkts } = summaryInfo || {};
  const { report, read, startDelayTime } = deviceInfo || {};

  const existHumi = sensors.includes(SENSORS.HUMI);

  let posY = PADDING_TOP_LOGGING_SUMMARY();
  pdf
    .fontSize(FONT_SIZE_TITLE)
    .fillColor(pdfLogoColor)
    .text(text('PDF_LOGGING_SUMMARY', LANGUAGE), labelLeftStartX, posY);
  // 画线
  posY += DELTA_Y_LABEL_LINE;
  drawLine(pdf, [labelLeftStartX, posY], [PAGE_RIGHT_POS(), posY]);

  posY += 15;

  const unitTemp = SIGN.UNIT(SENSORS.TEMP, LANGUAGE, { unit: UNIT });
  const unitHumi = SIGN.UNIT(SENSORS.HUMI, LANGUAGE);
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_DATA_POINTS', LANGUAGE), labelLeftStartX, posY);
  pdf.text(dataCount, valueLeftStartX, posY);
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_START_DELAY', LANGUAGE), labelRightStartX, posY);
  pdf.text(startDelayTime, valueRightStartX, posY);

  // 一组（一行）数据
  posY += 20;
  pdf.text(text('PDF_HIGHEST_TEMP', LANGUAGE), labelLeftStartX, posY);
  pdf.text(
    highests[SENSORS.TEMP].value === NOVALUE
      ? NOVALUE
      : `${_util.formatSensorValue(SENSORS.TEMP)(highests[SENSORS.TEMP].value, 1)}${unitTemp} (${
          highests[SENSORS.TEMP].time
        })`,
    valueLeftStartX,
    posY
  );
  pdf.text(text('PDF_LOWEST_TEMP', LANGUAGE), labelRightStartX, posY);
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
  posY += 20;
  pdf.text(text('PDF_AVERAGE', LANGUAGE), labelLeftStartX, posY);
  pdf.text(
    averages[SENSORS.TEMP] === NOVALUE
      ? NOVALUE
      : `${_util.formatSensorValue(SENSORS.TEMP)(averages[SENSORS.TEMP], 1)}${unitTemp}`,
    valueLeftStartX,
    posY
  );
  pdf.text(text('PDF_MKT', LANGUAGE), labelRightStartX, posY);
  pdf.text(
    mkts[SENSORS.TEMP] === NOVALUE
      ? NOVALUE
      : `${_util.formatSensorValue(SENSORS.TEMP)(mkts[SENSORS.TEMP], 1)}${unitTemp}`,
    valueRightStartX,
    posY
  );

  // 一组（一行）数据
  if (existHumi) {
    posY += 20;
    pdf.text(text('PDF_HIGHEST_HUMI', LANGUAGE), labelLeftStartX, posY);
    pdf.text(
      highests[SENSORS.HUMI].value === NOVALUE
        ? NOVALUE
        : `${highests[SENSORS.HUMI].value}${unitHumi} (${highests[SENSORS.HUMI].time})`,
      valueLeftStartX,
      posY
    );
    pdf.text(text('PDF_LOWEST_HUMI', LANGUAGE), labelRightStartX, posY);
    pdf.text(
      lowests[SENSORS.HUMI].value === NOVALUE
        ? NOVALUE
        : `${lowests[SENSORS.HUMI].value}${unitHumi} (${lowests[SENSORS.HUMI].time})`,
      valueRightStartX,
      posY,
      { lineBreak: false }
    );
  }

  // 一组（一行）数据
  posY += 20;
  pdf.text(text('PDF_REPORT_INTERVAL', LANGUAGE), labelLeftStartX, posY);
  pdf.text(report, valueLeftStartX, posY);
  pdf.text(text('PDF_RECORD_INTERVAL', LANGUAGE), labelRightStartX, posY);
  pdf.text(read, valueRightStartX, posY);
};

/**
 //*画dataSummary 
 * @param {pdfKit} pdf 
 * @param {*} summaryInfo 
 */
const printDataSummary = (pdf, { pdfInfo, summaryInfo, globalInfo }) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  const { alarmCount = {} } = summaryInfo || {};
  const { pdfLogoColor } = pdfInfo || {};

  const onePartWidth = (PDF_A4_WIDTH - PAGE_LEFT_POS() * 2) / 5;
  let posX = PAGE_LEFT_POS();
  let posY = PADDING_TOP_DATA_SUMMARY();
  pdf
    .fontSize(FONT_SIZE_TITLE)
    .fillColor(pdfLogoColor)
    .text(text('PDF_DATA_SUMMARY', LANGUAGE), posX, posY);
  // 画线
  posY += DELTA_Y_LABEL_LINE;
  drawLine(pdf, [posX, posY], [PAGE_RIGHT_POS(), posY]);

  posY += 13;
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_ALARM_ZONE', LANGUAGE), posX, posY, {
      width: onePartWidth,
      align: 'left',
    });

  const lengthBetween1st2nd = onePartWidth - 10;
  posX += lengthBetween1st2nd;
  pdf.text(text('PDF_ALARM_TYPE', LANGUAGE), posX, posY, {
    width: onePartWidth,
    align: 'center',
  });

  posX += onePartWidth;
  pdf.text(text('PDF_ALLOW_TIME', LANGUAGE), posX, posY, {
    width: onePartWidth,
    align: 'center',
  });

  posX += onePartWidth;
  pdf.text(text('PDF_TOTAL_TIME', LANGUAGE), posX, posY, {
    width: onePartWidth,
    align: 'center',
  });

  posX += onePartWidth;
  pdf.text(text('PDF_STATUS', LANGUAGE), posX, posY, {
    width: onePartWidth,
    align: 'center',
  });

  const drawData = (
    posX,
    posY,
    { show, zone, alarmType, allowTime, totalTime, status, isAlert = false }
  ) => {
    pdf
      .fillColor(DEFAULT_FONT_COLOR)
      .fontSize(FONT_SIZE_SMALL)
      .text(show ? zone : NOVALUE, posX, posY, {
        width: onePartWidth,
        align: 'left',
      });
    posX += lengthBetween1st2nd;
    pdf.text(show ? alarmType : NOVALUE, posX, posY, {
      width: onePartWidth,
      align: 'center',
    });
    posX += onePartWidth;
    pdf.text(show ? allowTime : NOVALUE, posX, posY, {
      width: onePartWidth,
      align: 'center',
    });
    posX += onePartWidth;
    pdf.text(show ? totalTime : NOVALUE, posX, posY, {
      width: onePartWidth,
      align: 'center',
    });
    posX += onePartWidth;
    pdf
      .fillColor(isAlert ? ALARM_COLOR : DEFAULT_FONT_COLOR)
      .text(show ? status : NOVALUE, posX, posY, {
        width: onePartWidth,
        align: 'center',
      });
  };

  alarmCount[SENSORS.TEMP].forEach(alarm => {
    posX = PAGE_LEFT_POS(); // 重新回到最左边绘制
    posY += 20;
    drawData(posX, posY, alarm);
  });

  // 画线
  posX = PAGE_LEFT_POS();
  posY += 15;
  drawLine(pdf, [posX, posY], [PAGE_RIGHT_POS(), posY]);
};

/**
 //* 画chart
 * @param {*} pdf 
 * @param {*} param1 
 */
const printChart = (pdf, { sensorInfo, pdfInfo, deviceInfo, globalInfo, printFoot }) => {
  const { LANGUAGE = 'en', UNIT } = globalInfo || {};
  const {
    pdfLogoColor,
    chartParams: { params },
  } = pdfInfo || {};
  let pages = 1;

  let posX = PAGE_LEFT_POS();
  let posY = PADDING_TOP_CHART();
  pdf
    .fontSize(FONT_SIZE_TITLE)
    .fillColor(pdfLogoColor)
    .text(text('PDF_RECORD_CHART', LANGUAGE), posX, posY);

  Object.keys(params).forEach((type, index) => {
    posX = PAGE_LEFT_POS();
    if (index === 0) {
      posY = PADDING_TOP_CHART();
      printFoot(pdf, { pdfInfo, ...deviceInfo, pageIndex: 1 });
    } else {
      if ((index + 1) % 2 === 0) {
        pages += 1;
        // 两个表一页
        pdf.addPage();
        printFoot(pdf, { pdfInfo, ...deviceInfo, pageIndex: 2 });
        posY = PADDING_TOP_HEAD() + 40;
      } else {
        posY = PADDING_TOP_CHART() - 20;
      }
    }
    // 离标题一定距离
    posY += 35;
    const chartStartY = posY;
    const chartStartX = PAGE_LEFT_POS() + PADDING_LEFT_CHART_FROM_LEFT_POS();

    //* 绘制Y轴的横线与Y坐标轴线的label分布
    printChartYLineAndLabel(pdf, {
      pdfInfo,
      startX: chartStartX,
      startY: chartStartY,
      type,
    });

    //* 绘制阈值线
    printChartThreshLine(pdf, {
      pdfInfo,
      startX: chartStartX,
      startY: chartStartY,
      sensorInfo,
      type,
    });

    //* 绘制X轴的竖线与X坐标轴线的label分布
    printChartXLineAndLabel(pdf, {
      globalInfo,
      pdfInfo,
      deviceInfo,
      startX: chartStartX,
      startY: chartStartY,
      type,
    });

    //* 画Y轴label :Temperature( ℃)
    posY -= 15; // 往上绘制一点
    let yLabel = text('PDF_TEMP_Y_LABEL', LANGUAGE);
    switch (type) {
      case SENSORS.TEMP:
        yLabel = text('PDF_TEMP_Y_LABEL', LANGUAGE);
        break;
      case SENSORS.HUMI:
        yLabel = text('PDF_HUMI_Y_LABEL', LANGUAGE);
        break;
      case SENSORS.SUB_TEMP:
        yLabel = text('PDF_TEMP2_Y_LABEL', LANGUAGE);
        break;
    }
    pdf
      .fontSize(FONT_SIZE_SMALL)
      .fillColor(DEFAULT_FONT_COLOR)
      .text(`[${SIGN.UNIT(type, LANGUAGE, { unit: UNIT })}]`, 0, posY, {
        width: chartStartX - 4, // 与下面坐标值右侧对齐
        align: 'right',
      });
    pdf
      .fontSize(FONT_SIZE_LARGE)
      .fillColor(DEFAULT_FONT_COLOR)
      .text(yLabel, 0, posY - 5, {
        width: PDF_A4_WIDTH,
        align: 'center',
      });

    //* 绘制sensor数据
    printDataLine(pdf, {
      pdfInfo,
      sensorInfo,
      startX: chartStartX,
      startY: chartStartY,
      type,
      globalInfo,
    });
  });
  return { pages };
};

/**
 //* 绘制Y轴的横线与Y坐标轴线的label分布 
 * @param {*} pdf 
 * @param {*} param1 
 */
const printChartYLineAndLabel = (pdf, { pdfInfo, startX, startY, type }) => {
  const {
    chartParams: { chartWidth, params },
  } = pdfInfo || {};
  const { heightDeltaPerYPart, YValues } = params[type];
  const posX = startX;
  let posY = startY;
  const endX = startX + chartWidth;
  const heightDeltaPerLine = heightDeltaPerYPart / 2;
  const labelDeltaY = 4;
  let labelDeltaX = 0;
  // label与Y轴线的距离
  const labelDeltaWithYLine = 4;
  // 从上往下绘制横线
  pdf.fontSize(FONT_SIZE_SMALL).fillColor(DEFAULT_FONT_COLOR);
  YValues.forEach((value, index) => {
    posY = startY + index * heightDeltaPerYPart;

    const label = SENSORS.HUMI === type ? value : value.toFixed(1);
    labelDeltaX = labelDeltaWithYLine + stepLength(label, { fontSize: FONT_SIZE_SMALL });
    // 首先Y轴的label 都是 右侧对齐的
    // 湿度最上面第一个label不绘制
    // if (SENSORS.HUMI !== type || index !== 0) {
    //   pdf.text(label, posX - labelDeltaX, posY - labelDeltaY);
    // }

    pdf.text(label, posX - labelDeltaX, posY - labelDeltaY);

    // 首尾横线都是直线，没有dash
    if (index === 0) {
      drawLine(pdf, [posX, posY], [endX, posY], {
        color: DEFAULT_FONT_COLOR,
        undash: true,
      });
    }
    // 除了绘制label对应的虚线，还有两个label之间还有一条虚线
    else {
      // 绘制两label之间的虚线
      drawLine(pdf, [posX, posY - heightDeltaPerLine], [endX, posY - heightDeltaPerLine], {
        dash: DASH.CHART,
        color: DEFAULT_FONT_COLOR,
      });
      // 首尾横线都是直线，没有dash
      if (index === YValues.length - 1) {
        drawLine(pdf, [posX, posY], [endX, posY], {
          color: DEFAULT_FONT_COLOR,
          undash: true,
        });
      } else {
        // 绘制label对应的虚线
        drawLine(pdf, [posX, posY], [endX, posY], {
          dash: DASH.CHART,
          color: DEFAULT_FONT_COLOR,
        });
      }
    }
  });
};

/**
 //* 绘制阈值线 
 * @param {*} pdf 
 * @param {*} param1 
 */
const printChartThreshLine = (
  pdf,
  { pdfInfo, startX: chartStartX, startY: chartStartY, sensorInfo, type }
) => {
  const { thresholds } = sensorInfo || {};
  const {
    chartParams: { chartWidth, params },
  } = pdfInfo || {};

  const { topPosYValue, heightYPerValue, startYDelta } = params[type];

  const chartEndX = chartStartX + chartWidth;
  let minPosY = chartStartY;
  let maxPosY = chartStartY;
  const { min = [], max = [] } = thresholds[type] || {};
  const DELTA_Y = 5;
  const DELTA_X = 5;
  const maxColor = CHART_COLORS.TEMP_THRESH_LINE_COLOR;
  const minColor = CHART_COLORS.TEMP_DATA_LINE_COLOR;
  switch (type) {
    case SENSORS.TEMP:
    case SENSORS.SUB_TEMP:
      min.forEach(({ value, label, show = false }) => {
        if (show) {
          minPosY = getPos(chartStartY, heightYPerValue, topPosYValue, value);
          drawLine(pdf, [chartStartX, minPosY], [chartEndX, minPosY], {
            color: minColor,
            dash: DASH.CHART,
          });
          // 然后绘制图例名称
          pdf
            .fillColor(minColor)
            .fontSize(FONT_SIZE_SMALL)
            .text(`${label}: ${value.toFixed(1)}`, chartEndX + DELTA_X, minPosY - DELTA_Y, {
              lineBreak: false,
            });
        }
      });
      max.forEach(({ value, label, show = false }) => {
        if (show) {
          maxPosY = getPos(chartStartY, heightYPerValue, topPosYValue, value);

          drawLine(pdf, [chartStartX, maxPosY], [chartEndX, maxPosY], {
            color: maxColor,
            dash: DASH.CHART,
          });
          // 然后绘制图例名称
          pdf
            .fillColor(maxColor)
            .fontSize(FONT_SIZE_SMALL)
            .text(`${label}: ${value.toFixed(1)}`, chartEndX + DELTA_X, maxPosY - DELTA_Y, {
              lineBreak: false,
            });
        }
      });

      break;
    case SENSORS.HUMI:
      min.forEach(({ value, label, show = false }) => {
        if (show) {
          minPosY = getPos(chartStartY + startYDelta, heightYPerValue, topPosYValue, value);
          drawLine(pdf, [chartStartX, minPosY], [chartEndX, minPosY], {
            color: minColor,
            dash: DASH.CHART,
          });
          // 然后绘制图例名称
          pdf
            .fillColor(minColor)
            .fontSize(FONT_SIZE_SMALL)
            .text(`${label}: ${value}`, chartEndX + DELTA_X, minPosY - DELTA_Y, {
              lineBreak: false,
            });
        }
      });
      max.forEach(({ value, label, show = false }) => {
        if (show) {
          maxPosY = getPos(chartStartY + startYDelta, heightYPerValue, topPosYValue, value);

          drawLine(pdf, [chartStartX, maxPosY], [chartEndX, maxPosY], {
            color: maxColor,
            dash: DASH.CHART,
          });
          // 然后绘制图例名称
          pdf
            .fillColor(maxColor)
            .fontSize(FONT_SIZE_SMALL)
            .text(`${label}: ${value}`, chartEndX + DELTA_X, maxPosY - DELTA_Y, {
              lineBreak: false,
            });
        }
      });

      break;
    default:
    // do nothing
  }
};

/**
 //* 绘制X轴的竖线与X坐标轴线的label分布 
 * @param {*} pdf 
 * @param {*} param1 
 */
const printChartXLineAndLabel = (pdf, { globalInfo, pdfInfo, startX, startY, deviceInfo }) => {
  const {
    chartParams: { widthDeltaPerXPart, XValues, timeFormat = 'HH:mm' },
  } = pdfInfo || {};
  const { timeZone } = deviceInfo || {};
  const { DATE_WITH_YEAR_FORMAT = 'YY.MM.DD', DATE_NO_YEAR_FORMAT = 'MM.DD' } = globalInfo || {};
  let posX = startX;
  const posY = startY;
  const endY = startY + CHART_INNER_HEIG();
  const labelDeltaY = 5;
  const lableDeltaX = 4;
  const X_LINE_CNT = CHART_X_PARTS + 1;

  pdf.fontSize(FONT_SIZE_SMALLER).fillColor(DEFAULT_FONT_COLOR);
  // 从左往右,从上往下 绘制竖线
  for (let index = 0; index < X_LINE_CNT; index++) {
    const value = XValues[index] || null;
    posX = startX + index * widthDeltaPerXPart;

    // 首尾横线都是直线，没有dash
    if (index === 0 || index === X_LINE_CNT - 1) {
      drawLine(pdf, [posX, posY], [posX, endY], {
        color: DEFAULT_FONT_COLOR,
        undash: true,
      });
    }
    // 除了绘制label对应的虚线
    else {
      // 绘制label对应的虚线
      drawLine(pdf, [posX, posY], [posX, endY], {
        dash: DASH.CHART,
        color: DEFAULT_FONT_COLOR,
      });
    }
    // 绘制X坐标值
    if (value) {
      // 首先X轴的label 都是 右侧对齐的
      // 第一行打印时间 HH:MM
      textBreak(
        pdf,
        _common.formatDate(value, timeZone, timeFormat),
        posX - lableDeltaX,
        endY + labelDeltaY
      );
      if (index === 0 || index === XValues.length - 1) {
        // 首尾第二行time值，都要打印年份
        textBreak(
          pdf,
          _common.formatDate(value, timeZone, DATE_WITH_YEAR_FORMAT),
          posX - 2 * lableDeltaX,
          endY + 3 * labelDeltaY
        );
      } else {
        // 非首尾第二行time值，不用打印年份
        textBreak(
          pdf,
          _common.formatDate(value, timeZone, DATE_NO_YEAR_FORMAT),
          posX - lableDeltaX,
          endY + 3 * labelDeltaY
        );
      }
    }
  }
};

/**
 //* 绘制数据折线 
 * @param {*} pdf 
 * @param {*} param1 
 */
const printDataLine = (pdf, { pdfInfo, sensorInfo, startX, startY, type, globalInfo }) => {
  const {
    chartParams: { widthXPerValue, params },
  } = pdfInfo || {};
  const { UNIT } = globalInfo;
  const { topPosYValue, heightYPerValue, startYDelta } = params[type];
  const { datas } = sensorInfo || {};

  let posX = undefined;
  let posY = undefined;

  // 防止之前有绘制dash的
  pdf.undash();
  posX = undefined;
  posY = undefined;
  const sensorDatas = datas[type] || [];
  pdf.lineWidth(1.5).strokeColor(CHART_COLORS.TEMP_DATA_LINE_COLOR);
  let startYPos = startY;

  switch (type) {
    case SENSORS.TEMP:
    case SENSORS.SUB_TEMP:
      startYPos = startY;
      // if (type === SENSORS.TEMP) {
      //   pdf.strokeColor(CHART_COLORS.TEMP_DATA_LINE_COLOR);
      // } else {
      //   pdf.strokeColor(CHART_COLORS.SUB_TEMP_DATA_LINE_COLOR);
      // }

      break;
    case SENSORS.HUMI:
      // pdf.strokeColor(CHART_COLORS.HUMI_DATA_LINE_COLOR);
      startYPos = startY + startYDelta;
      break;
    default:
    // do nothing
  }

  sensorDatas.forEach((data, index) => {
    const { val: sensorVal } = data;
    let val = sensorVal;
    if (needTransSensorValue(type, UNIT)) {
      val = transFahr(sensorVal);
    }
    if (_util.isValidSensor(val)) {
      if (posX && posY) {
        // 移动到上次valid的 posX，posY
        pdf.moveTo(posX, posY);

        // 计算本次value的posX，posY，然后连线
        posX = getPos(startX, widthXPerValue, index, 0);
        posY = getPos(startYPos, heightYPerValue, topPosYValue, val);
        if (posX && posY) pdf.lineTo(posX, posY).stroke();
      } else {
        // 仅仅记录异常值变为正常值时的posX，posY，
        // 下一次如果val是valid的，那么上面就直接moveTo到此次记录的posX，posY
        posX = getPos(startX, widthXPerValue, index, 0);
        posY = getPos(startYPos, heightYPerValue, topPosYValue, val);
      }
    } else {
      posX = undefined;
      posY = undefined;
    }
  });
};

/**
 //* 绘制页脚
 * @param {*} pdf 
 * @param {*} param1 
 */
const printFoot = (pdf, { pdfInfo, pageIndex = 1 }) => {
  const { totalPage, pdfWebsite = '' } = pdfInfo || {};
  let posX = PAGE_LEFT_POS();
  let posY = PDF_A4_HEIGHT - PADDING_BOTTOM_FOOT();

  drawLine(pdf, [posX, posY], [PAGE_RIGHT_POS(), posY], {
    color: DEFAULT_FONT_COLOR,
    dash: DASH.FOOT,
  });
  const deltaX = footPageNumberDeltaX(pageIndex, totalPage);
  // 页码放右侧
  posX = PAGE_RIGHT_POS() - 10 - deltaX;
  posY = posY + 5;
  pdf
    .fillColor(DEFAULT_FONT_COLOR)
    .fontSize(FONT_SIZE_SMALL)
    .text(`${pageIndex}/${totalPage}`, posX, posY, { lineBreak: false });

  // device id 除了第一页，其他页都放右下角
  posX = PAGE_LEFT_POS();
  pdf.text(pdfWebsite, posX, posY, { lineBreak: false });
};
const paint = paintYiyao;
export {
  paint,
  init,
  initGlobalInfo,
  initSensorInfo,
  initDeviceInfo,
  initSummaryInfo,
  initPdfInfo,
  initChartParams,
  initDataTableParams,

  /**绘制head，拆分出一块一块的 */
  printHeadInfo,
  drawHeadLogo,
  drawHeadFileCreatedDate,
  drawHeadDataReportSign,
  drawHeadNoteSign,
  drawHeadDataSummay,
  drawAlertSign,
  printDeviceInfo,
  printOrderInfo,
  printLoggingSummary,
  printDataSummary,
  printChart,
  printChartYLineAndLabel,
  printChartThreshLine,
  printChartXLineAndLabel,
  printDataLine,
  printDataTable,
  printTableTitle,
  printTableData,
  printEndorsement,
  printFoot,
};
