'use strict';

import {
  PDF_A4_HEIGHT,
  PADDING_BOTTOM_FOOT,
  DASH,
  PAGE_LEFT_POS,
  FONT_SIZE_TITLE,
  DELTA_Y_LABEL_LINE,
  FONT_SIZE_SMALL,
  DEFAULT_FONT_COLOR,
  PAGE_RIGHT_POS,
  CHART_Y_PARTS_SHENGSHENG,
  CHART_X_PARTS,
  CHART_INNER_HEIG,
  PDF_A4_WIDTH,
  PADDING_LEFT_CHART_FROM_LEFT_POS,
} from '../../constants';
import { text } from '../../../gloable/language';
import {
  drawLine,
  checkContainChinese,
  getFont,
  footPageNumberDeltaX,
  needTransSensorValue,
} from '../../pdfutil';
import {
  initGlobalInfo,
  initSensorInfo,
  initDeviceInfo,
  initSummaryInfo,
  initChartXValues,
  initPdfInfo,
  initApiInfo,
  initBtPrintInfo,
  initEndorsementInfo,
  printHeadInfo,
  printDeviceInfo,
  printLoggingSummary,
  printDataSummary,
  printChart,
  printDataTable,
  printEndorsement,
} from '../../guoshu';
import { SENSORS, PDF_CONFIG } from '../../../gloable/gloable';
import * as _util from '../../../unitl';
import { transFahr } from '../../../unitl';
import _log from '../../../log';

const { POP_INTERVAL } = PDF_CONFIG.POP;

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
  const { LANGUAGE = 'en' } = globalInfo || {};

  //* 画logo、title、notes 等顶部头信息
  printHeadInfo(pdf, {
    deviceInfo,
    summaryInfo,
    pdfInfo,
    sensorInfo,
    globalInfo,
    headDataSignConfigs: {
      showLogoText: LANGUAGE !== 'zh', // 生生中文不显示logotext
      logoText: 'Frigga',
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
    loggingSummaryConfigs: {
      threshold1Label: text('PDF_TEMP_THRESH', LANGUAGE),
    },
  });
  _log.info('====【5】==== printLoggingSummary ok');
  //* 画Data Summary
  printDataSummary(pdf, { pdfInfo, summaryInfo, sensorInfo, globalInfo });
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
    globalInfo,
    dataTableConfigs: {
      showTableHead: false,
    },
    footPrint: printFoot,
  });
  _log.info('====【9】==== printDataTable ok ');
  //* 画签名
  printEndorsement(pdf, { endorsementInfo, footPrint: printFoot, pdfInfo, globalInfo, deviceInfo });
  _log.info('====【10】==== printEndorsement ok ===== 结束~~~');
  return { apiInfo, btInfo };
};

/**
 //* 初始化一些必要数据,先把数据准备好，之后便慢慢画
 * @param {*} info
 * @param {*} monitors
 */
const init = (info, monitors) => {
  const { filter } = info || {};
  const { needInfo = false, needBtPrintnfo = false } = filter || {};

  const globalInfo = initGlobalInfo(info);

  //* 初始化sensor相关信息
  const sensorInfo = initSensorInfo(globalInfo, info, monitors);

  //* 初始化deviceInfo
  const deviceInfo = initDeviceInfo(globalInfo, info, sensorInfo);

  //* 初始化summaryInfo
  const summaryInfo = initSummaryInfo(globalInfo, info, sensorInfo);

  //* 初始化pdf信息
  const pdfInfo = initPdfInfo(
    globalInfo,
    info,
    { deviceInfo, sensorInfo, summaryInfo },
    { initChart: initChartParams }
  );

  const apiInfo = needInfo ? initApiInfo(sensorInfo, deviceInfo, summaryInfo) : {};
  const btInfo = needBtPrintnfo ? initBtPrintInfo(sensorInfo, deviceInfo, summaryInfo) : {};
  const endorsementInfo = initEndorsementInfo(info);
  return {
    sensorInfo,
    deviceInfo,
    summaryInfo,
    pdfInfo,
    globalInfo,
    apiInfo,
    btInfo,
    endorsementInfo,
  };
};

/*
//* record chart 参数初始化
  注： 生生有自己需要的chart Y轴排布方案
*/
const initChartParams = ({ sensorInfo, summaryInfo, globalInfo }) => {
  const { sensors = [], sensorCnt = 0, thresholds = {}, datas = {}, dataCount } = sensorInfo || {};
  const { highests = {}, lowests = {}, alarmCount = {} } = summaryInfo || {};
  const { UNIT } = globalInfo;
  const needTransValue = needTransSensorValue(SENSORS.TEMP, UNIT);

  const chartWidth = PDF_A4_WIDTH - 2 * (PAGE_LEFT_POS() + PADDING_LEFT_CHART_FROM_LEFT_POS());

  // 只有存在humi时，我们才画第二个Y轴
  const draw2ndSensor = sensorCnt > 1 && sensors.includes(SENSORS.HUMI);

  // 左侧坐标轴 ：最高Y位置点映射的温度值（不一定是温度的最高值，需要综合阈值以及布局分布需要确定的值）
  let topPosLeftYValue = undefined;
  // 左侧坐标轴 ：最低Y位置点映射的温度值（不一定是温度的最低值，需要综合阈值以及布局分布需要确定的值）
  let bottomPosLeftYValue = undefined;
  // topPosLeftYValue - bottomPosLeftYValue 需要满足delta值能被CHART_Y_PARTS_SHENGSHENG整除，这样下面的单位高度就是一个整数，尽量减少精度带来的偏差
  // 左侧坐标轴 ：单位sensor值对应的高度
  let heightLeftYPerValue = 0;

  // 右侧坐标轴 最高Y位置点映射的温度值（不一定是温度的最高值，需要综合阈值以及布局分布需要确定的值）
  const topPosRightYValue = 100;
  // 右侧坐标轴 最低Y位置点映射的温度值（不一定是温度的最低值，需要综合阈值以及布局分布需要确定的值）
  const bottomPosRightYValue = 0;
  // 右侧坐标轴 ：单位sensor值对应的高度
  let heightRightYPerValue = 0;
  // 通过以上，可以计算得出每个点的值 映射到pdf坐标系中的Y轴位置
  // valuePosY = chartStartY + heightLeftYPerValue * ( topPosLeftYValue - value )

  // X坐标轴： 单位时间对应的宽度
  let widthXPerValue = 0;

  const popConfig = {};

  sensors.forEach(type => {
    const { low, high } = alarmCount[type] || {};
    const { total: lowTotal = 0 } = low || {};
    const { total: highTotal = 0 } = high || {};
    // 未超温点的个数 比 X轴点的个数 多 一个抽点间隔，就初步满足抽点条件
    if (datas[type].length - lowTotal - highTotal - (CHART_X_PARTS + 1) > POP_INTERVAL) {
      popConfig[type] = { needPop: true };
    } else {
      popConfig[type] = { needPop: false };
    }

    // 左侧Y轴只会有temp与subTemp
    if ([SENSORS.TEMP, SENSORS.SUB_TEMP].includes(type)) {
      const { minOrigin: min, maxOrigin: max } = thresholds[type];
      const { valueOrigin: highest } = highests[type];
      const { valueOrigin: lowest } = lowests[type];
      // 先给两个默认值，因为阈值不会有异常值，所以，默认赋值阈值
      if (undefined === topPosLeftYValue) {
        topPosLeftYValue = max;
      }
      if (_util.isValidSensor(highest)) {
        topPosLeftYValue = Math.max(max, highest, topPosLeftYValue);
      } else {
        topPosLeftYValue = Math.max(max, topPosLeftYValue);
      }
      if (undefined === bottomPosLeftYValue) {
        bottomPosLeftYValue = min;
      }
      if (_util.isValidSensor(lowest)) {
        bottomPosLeftYValue = Math.min(min, lowest, bottomPosLeftYValue);
      } else {
        bottomPosLeftYValue = Math.min(min, bottomPosLeftYValue);
      }
    }
  });

  // TODO: 看不懂这是做什么，直接从设备端拿来的算法，为了跟设备端一致@{
  const get_abs = (max, min) => {
    const delta = max - min;
    if (delta < 0) {
      return -delta;
    } else {
      return delta;
    }
  };
  /*
   * 找到和data数接近的n_times倍数的数字
   * up为0 则返回小于data的n_times倍数的数
   * up为1,则返回大于data的n_times倍数的数字
   * 因为data是实际温度x10之后的数值,所以这个倍数n_times要乘以10
   */
  const find_next_n_times_data = (data, up, n_times) => {
    let res_data = Math.floor(data);

    for (let i = 0; i < 60; i++) {
      if (up == 1) {
        res_data += 1;
      } else if (up == 0) {
        res_data -= 1;
      } else {
        //do nothing
        return 0;
      }

      if (res_data % n_times == 0) return res_data;
    }

    return 0;
  };

  // 确定最高温度与最低温度后，多画一部分，也就是坐标最高点比温度数据最高温度多一点
  let gap_value = 0;
  let y_parts = CHART_Y_PARTS_SHENGSHENG;
  const delta = get_abs(topPosLeftYValue, bottomPosLeftYValue);

  /**
   *  * shengsheng
   * 温度跨度在10°之内    1°
   * 温度跨度在10~50°之间 5°
   * 温度跨度在50~100°之间 10°
   * 温度跨度在100~200°之间 20°
   * 温度跨度在200°以上 50°
   */
  if (delta < 10) {
    gap_value = 1;
  } else if (get_abs(topPosLeftYValue, bottomPosLeftYValue) < 50) {
    gap_value = 5;
  } else if (get_abs(topPosLeftYValue, bottomPosLeftYValue) < 100) {
    gap_value = 10;
  } else if (get_abs(topPosLeftYValue, bottomPosLeftYValue) < 200) {
    gap_value = 20;
  } else {
    gap_value = 50;
  }
  topPosLeftYValue = find_next_n_times_data(topPosLeftYValue, 1, gap_value);
  bottomPosLeftYValue = find_next_n_times_data(bottomPosLeftYValue, 0, gap_value);
  y_parts = get_abs(topPosLeftYValue, bottomPosLeftYValue) / gap_value;

  let miss_parts = 0;
  if (y_parts < CHART_Y_PARTS_SHENGSHENG) {
    miss_parts = CHART_Y_PARTS_SHENGSHENG - y_parts;
    y_parts = CHART_Y_PARTS_SHENGSHENG;
    topPosLeftYValue += miss_parts * gap_value;
  }
  // TODO: }@ 看不懂这是做什么，直接从设备端拿来的算法，为了跟设备端一致

  const getLengthPerValue = (topValue, bottomValue, innerHeight) => {
    return innerHeight / (topValue - bottomValue);
  };

  heightLeftYPerValue = getLengthPerValue(
    topPosLeftYValue,
    bottomPosLeftYValue,
    CHART_INNER_HEIG()
  );
  if (needTransValue) {
    heightLeftYPerValue = getLengthPerValue(
      transFahr(topPosLeftYValue),
      transFahr(bottomPosLeftYValue),
      CHART_INNER_HEIG()
    );
  }
  heightRightYPerValue = getLengthPerValue(
    topPosRightYValue,
    bottomPosRightYValue,
    CHART_INNER_HEIG()
  );
  // 为了给Y轴每行轴线标记相应的坐标值
  let valueDeltaPerYPart = Math.floor((topPosLeftYValue - bottomPosLeftYValue) / y_parts);
  // 左侧Y轴所有坐标点的值
  const Y1stValues = [];
  // 右侧Y轴所有坐标点的值
  const Y2ndValues = [];
  const valueDeltaPerY2Part = Math.floor(topPosRightYValue / y_parts);
  for (let i = 0; i < y_parts + 1; i++) {
    if (i === y_parts) {
      // 保险起见，最后一个点的值，直接用计算得到的bottom赋值
      Y1stValues.push(bottomPosLeftYValue);
      if (draw2ndSensor) {
        Y2ndValues.push(bottomPosRightYValue); // 保险起见,最后一个点是0
      }
    } else {
      Y1stValues.push(topPosLeftYValue - i * valueDeltaPerYPart);
      if (draw2ndSensor) {
        Y2ndValues.push(topPosRightYValue - i * valueDeltaPerY2Part);
      }
    }
  }
  if (needTransValue) {
    valueDeltaPerYPart = Math.floor(
      (transFahr(topPosLeftYValue) - transFahr(bottomPosLeftYValue)) / y_parts
    );
  }
  // Y轴向，每格多高
  const heightDeltaPerYPart = CHART_INNER_HEIG() / y_parts;
  // X轴向，每格多宽
  //* 这是一种理想的均分状态，但是x轴移动时，会有精度差的，如果按照这个绘制了X line，那么x轴上的点，不一定能正好绘制到轴线上
  const widthDeltaPerXPart = chartWidth / CHART_X_PARTS;
  const tempData = datas[SENSORS.TEMP] || [];
  // X轴坐标点的值
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
    draw2ndSensor,
    fullDraw2ndSensor: true,
    popConfig,
    //*Y轴信息
    topPosLeftYValue: needTransValue ? transFahr(topPosLeftYValue) : topPosLeftYValue, // 左侧Y轴：最高Y位置点映射的温度值（不一定是温度的最高值，需要综合阈值以及布局分布需要确定的值）
    bottomPosLeftYValue: needTransValue ? transFahr(bottomPosLeftYValue) : bottomPosLeftYValue, // 左侧Y轴：最低Y位置点映射的温度值（不一定是温度的最低值，需要综合阈值以及布局分布需要确定的值）
    heightLeftYPerValue, // 左侧Y轴：单位sensor值对应的高度

    topPosRightYValue, // 右侧Y轴：最高Y位置点映射的温度值（不一定是温度的最高值，需要综合阈值以及布局分布需要确定的值）
    bottomPosRightYValue, // 右侧Y轴：最低Y位置点映射的温度值（不一定是温度的最低值，需要综合阈值以及布局分布需要确定的值）
    heightRightYPerValue, // 右侧Y轴：单位sensor值对应的高度
    startYRightDelta: 0, // 此处humi绘制完整

    valueDeltaPerYPart, // 为了给Y轴每行轴线标记相应的坐标值
    heightDeltaPerYPart, // Y轴向，每格多高
    Y1stValues: needTransValue ? Y1stValues.map(y => transFahr(y)) : Y1stValues, // 左侧Y轴:所有坐标点的值
    Y2ndValues, // 右侧Y轴所有坐标点的值
    withFixed: false, //  是否保留小数位

    //*X轴信息
    widthXPerValue, // X坐标轴： 单位时间对应的宽度
    widthDeltaPerXPart, // X轴向，每格多宽
    XValues, // X轴坐标点的值
    XIndexs,
    timeFormat: 'HH:mm',
  };
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
    projectId,
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
  pdf.font(getFont(LANGUAGE)).text(text('PDF_START', LANGUAGE), labelRightStartX, posY);
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
  pdf.text(text('PDF_END', LANGUAGE), labelRightStartX, posY);
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

  posY += ROW_DELTA;
  pdf.text(text('PDF_PROJECT_ID', LANGUAGE), labelRightStartX, posY);
  if (checkContainChinese(projectId)) {
    pdf.font(getFont('zh')).text(projectId, valueRightStartX, posY, {
      width: PAGE_RIGHT_POS() - valueRightStartX,
      height: 40,
      ellipsis: true,
    });
  } else {
    pdf.text(projectId, valueRightStartX, posY, {
      width: PAGE_RIGHT_POS() - valueRightStartX,
      height: 40,
      ellipsis: true,
    });
  }
  pdf.font(getFont(LANGUAGE));
};

/**
 //* 绘制页脚
 * @param {*} pdf 
 * @param {*} param1 
 */
const printFoot = (pdf, { pdfInfo, pageIndex = 1, terNo = '', globalInfo }) => {
  const { totalPage } = pdfInfo || {};
  const { LANGUAGE = 'en' } = globalInfo || {};

  let posX = PAGE_LEFT_POS();
  let posY = PDF_A4_HEIGHT - PADDING_BOTTOM_FOOT();

  drawLine(pdf, [posX, posY], [PAGE_RIGHT_POS(), posY], {
    color: DEFAULT_FONT_COLOR,
    dash: DASH.FOOT,
  });

  // 保持原始位置不动的情况下，随着totalPage与pageIndex的增加，动态调整
  const deltaX = footPageNumberDeltaX(pageIndex, totalPage);
  // 页码放右边
  posX = PAGE_RIGHT_POS() - 15 - deltaX;
  posY = posY + 5;
  pdf
    .fillColor(DEFAULT_FONT_COLOR)
    .fontSize(FONT_SIZE_SMALL)
    .text(`${pageIndex}/${totalPage}`, posX, posY, { lineBreak: false });
};

export default drawPdf;
