'use strict';
// eslint-disable-next-line
import {
  PDF_A4_WIDTH,
  PDF_A4_HEIGHT,
  TABLE_TITLE_HEIGHT,
  PADDING_BOTTOM_FOOT,
  TABLE_EACH_LINE_HEIGHT,
  PDF_LOGO_HEIG,
  PDF_LOGO_WIDTH,
  PADDING_TOP_HEAD,
  PADDING_TOP_HEAD_SUMMARY,
  PADDING_TOP_DEVICE,
  TEMPS_PARTS_MAX,
  NOVALUE,
  PAGE_LEFT_POS,
  FONT_SIZE_LARGE,
  FONT_SIZE_NORMAL,
  FONT_SIZE_SMALL,
  FONT_SIZE_SMALLER,
  FONT_SIZE_LOGO,
  FONT_SIZE_TITLE,
  DEFAULT_FONT_COLOR,
  PAGE_RIGHT_POS,
  PADDING_TOP_LOGGING_SUMMARY,
  SIGN,
  PADDING_TOP_DATA_SUMMARY,
  PADDING_TOP_CHART,
  DELTA_Y_LABEL_LINE,
  PADDING_LEFT_CHART_FROM_LEFT_POS,
  CHART_INNER_HEIG,
  CHART_COLORS,
  DASH,
  CHART_Y_PARTS,
  CHART_X_PARTS,
  PADDING_TOP_DATA_TABLE,
  DATA_TABLE_HEIGHT,
  ALARM_COLOR,
  THREE_SENSOR_DELTAY_DEVICE_INFO,
  THREE_SENSOR_DELTAY_HEAD_SUMMARY,
  THREE_SENSOR_DELTAY_LOGGING_SUMMARY,
  THREE_SENSOR_DELTAY_DATA_SUMMARY,
  THREE_SENSOR_DELTAY_NOTE,
  ROWS_DELTAY,
  ROW_FIRST_DELTA,
  ENDORSEMENT_HEIGHT,
  ENDORSEMENT_TITLE_HEIGHT,
  ENDORSEMENT_EACH_LINE_HEIGHT,
  PADDING_TOP_ENDORSEMENT,
  CHART_Y_PARTS_SHENGSHENG,
} from '../templates/constants';
import {
  PDF_CHART_TYPE,
  SENSORS,
  PDF_LOGO,
  DEFAULT_START_DELAY_TIME,
  UNBIND_TYPE,
  UNBIND_TYPE_MAP_NAME,
  SENSOR_LABEL,
  ALERT_STRATEGY_TYPE,
  PDF_TEMPLATE,
  PDF_TEMPLATE_NAME,
  TEMP_UNIT,
  PDF_CONFIG,
} from '../gloable/gloable';
import * as _common from '../gloable/common';
import * as _util from '../unitl';
import {
  drawYesOrNoLogo,
  drawLogo,
  textBreak,
  drawLine,
  getPos,
  calcuteSummary,
  getFont,
  getBoLangHao,
  stepLength,
  checkContainChinese,
  footPageNumberDeltaX,
  needTransSensorValue,
} from '../templates/pdfutil';
import { text } from '../gloable/language';
import _log from '../../unitls/log';
import { transFahr } from '../unitl';

const { POP_INTERVAL, NEED_POP } = PDF_CONFIG.POP;
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
  });
  _log.info('====【2】==== printHeadInfo ok');
  //* 画Device Information
  printDeviceInfo(pdf, { deviceInfo, pdfInfo, globalInfo });
  _log.info('====【3】==== printDeviceInfo ok');
  //* 画Device Configuration
  printOrderInfo(pdf, { deviceInfo, pdfInfo, globalInfo });
  _log.info('====【4】==== printDeviceConfiguration ok');
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

/**
 //* 初始化一些必要数据,先把数据准备好，之后便慢慢画
 * @param {*} info
 * @param {*} monitors
 */
const init = (info, monitors) => {
  const { filter, markList = [] } = info || {};
  const { needInfo = false, needBtPrintnfo = false } = filter || {};

  const globalInfo = initGlobalInfo(info);
  _log.info('====【1.1】==== initGlobalInfo ok');
  //* 初始化sensor相关信息
  const sensorInfo = initSensorInfo(globalInfo, info, monitors);
  _log.info('====【1.2】==== initSensorInfo ok');
  //* 初始化deviceInfo
  const deviceInfo = initDeviceInfo(globalInfo, info, sensorInfo);
  _log.info('====【1.3】==== initDeviceInfo ok');
  //* 初始化summaryInfo
  const summaryInfo = initSummaryInfo(globalInfo, info, sensorInfo);
  _log.info('====【1.4】==== initSummaryInfo ok');
  //* 初始化pdf信息
  const pdfInfo = initPdfInfo(
    globalInfo,
    info,
    { deviceInfo, sensorInfo, summaryInfo },
    { initChart: initChartParams }
  );
  _log.info('====【1.5】==== initPdfInfo ok');
  const apiInfo = needInfo ? initApiInfo(sensorInfo, deviceInfo, summaryInfo) : {};
  _log.info('====【1.6】==== initApiInfo ok');
  const btInfo = needBtPrintnfo ? initBtPrintInfo(sensorInfo, deviceInfo, summaryInfo) : {};
  _log.info('====【1.7】==== initBtPrintInfo ok');
  const endorsementInfo = initEndorsementInfo(info);
  _log.info('====【1.8】==== initEndorsementInfo ok');
  sensorInfo.markList = markList;
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

const initGlobalInfo = info => {
  // pdfLanguage 在drawPdf时，初始化到info里了，实际在device的params里
  const { product, filter, pdfLanguage = 'en' } = info || {};
  const { unit } = filter || {};
  const {
    pdfTemplateId = 0, // pdf模板id号
  } = product || {};
  const templateName = PDF_TEMPLATE[pdfTemplateId];
  let dateFormat = 'DD-MM-YY HH:mm:ss'; // 整体时间格式
  // chart x轴坐标值
  let dateWithYearFormat = 'YY.MM.DD';
  let dateNoYearFormat = 'MM.DD';
  if (templateName === PDF_TEMPLATE_NAME.RUSSIA_TKMK) {
    dateFormat = 'DD-MM-YY HH:mm:ss';
    dateWithYearFormat = 'DD.MM.YY';
    dateNoYearFormat = 'DD.MM';
  }
  return {
    UNIT: unit,
    LANGUAGE: pdfLanguage,
    DATE_FORMAT: dateFormat,
    DATE_WITH_YEAR_FORMAT: dateWithYearFormat,
    DATE_NO_YEAR_FORMAT: dateNoYearFormat,
    TEMPLATE_ID: pdfTemplateId,
    TEMPLATE_NAME: templateName,
  };
};
/**
 //* 初始化sensors相关：多少sensor，各个sensor阈值多少
 * @param {object} info
 * sensors
 * sensorCnt
 * thresholds
 * datas
 */
const initSensorInfo = (globalInfo, info, monitors) => {
  const { LANGUAGE, UNIT } = globalInfo;
  const { product, filter, device } = info || {};
  const { params } = device || {};
  const { alerts = [] } = params || {};
  //*可能不同的导出途径：web、手机、api，所以，这个选项不一定存在，所以不存在时，就以配置为准，总之两者综合
  const { sensors: sensorsSelected = [] } = filter || {};
  const {
    pdfChartType = PDF_CHART_TYPE.TEMP_HUMI,
    alerts: alertsProduct = [],
    alertStrategy = ALERT_STRATEGY_TYPE.GUOSHU,
  } = product || {};
  let sensorCnt = 0;
  let sensors = [];
  let thresholds = {};
  let datas = {};
  //*最后pdf中展示多少sensor，不仅需要根据配置来，而且还要根据用户选择的sensor来判断
  //!用户会自己在页面选择要导出的sensors列表，这样就需要综合判断了
  //!但是至少有一个
  switch (sensorsSelected.length) {
    case 1:
    case 2:
      // 必须有一个温度类型的sensor，不管是temp还是subTemp
      if (sensorsSelected.includes(SENSORS.TEMP)) {
        sensorCnt += 1;
        sensors.push(SENSORS.TEMP);
      }
      if (sensorsSelected.includes(SENSORS.SUB_TEMP)) {
        sensorCnt += 1;
        sensors.push(SENSORS.SUB_TEMP);
      }
      if (sensorsSelected.includes(SENSORS.HUMI)) {
        sensorCnt += 1;
        sensors.push(SENSORS.HUMI);
      }
      break;
    default:
      // * 全选或者全不选的情况，我们走配置+用户设置的参数的情况
      switch (pdfChartType) {
        case PDF_CHART_TYPE.TEMP_HUMI:
          sensorCnt = 2;
          sensors.push(SENSORS.TEMP, SENSORS.HUMI); //! temp、humi
          break;
        case PDF_CHART_TYPE.TEMP_SUBTEMP:
          sensorCnt = 2;
          sensors.push(SENSORS.TEMP, SENSORS.SUB_TEMP); //! temp、subTemp
          break;
        case PDF_CHART_TYPE.TEMP_SUBTEMP_HUMI:
          sensorCnt = 3;
          sensors.push(SENSORS.TEMP, SENSORS.SUB_TEMP, SENSORS.HUMI); //! temp、subTemp、humi
          break;
        default:
          sensorCnt = 1;
          sensors.push(SENSORS.TEMP);
      }
  }
  //! 上面筛选完以后，再根据支持的alerts再筛选一遍,如果上述走default，导致根据pdfChartType走，但是设备实际又没有支持那么多sensor，所以这里再根据支持的sensor过滤一遍
  sensors = sensors.filter(
    type =>
      alerts.filter(alert => {
        const { min, max } = alert || {};
        const showInfo = alert.type === type;
        // sensor为humi时，阈值(0,0),不绘制任何相关信息,仅限果蔬
        // if (
        //   // pdf (0,0)不绘制相关信息
        //   // TEMPLATE_NAME === PDF_TEMPLATE_NAME.SHENGSHENG &&
        //   alertStrategy === ALERT_STRATEGY_TYPE.GUOSHU &&
        //   min !== undefined &&
        //   max !== undefined &&
        //   type === SENSORS.HUMI &&
        //   alert.type === SENSORS.HUMI
        // ) {
        //   showInfo = !(min === max && min === 0);
        // }
        return showInfo;
      }).length > 0
  );
  sensorCnt = sensors.length;

  // 获取sensors的各个阈值
  const getThresh = type => {
    if (!type) return null;
    return alerts.filter(a => a.type === type)[0];
  };
  // 此thresholds与sensors中的sensor一一对应
  thresholds = sensors.reduce((pre, type) => {
    const thresh = getThresh(type);
    const { min, max } = thresh;
    if (needTransSensorValue(type, UNIT)) {
      if (min !== undefined) {
        thresh.min = transFahr(min);
      }
      if (max !== undefined) {
        thresh.max = transFahr(max);
      }
    }
    return { ...pre, [type]: { ...thresh, minOrigin: min, maxOrigin: max } };
  }, {});

  // 获取sensors的各个monitor数据
  datas = sensors.reduce(
    (pre, type) => ({
      ...pre,
      [type]: (monitors || {})[type] || [],
    }),
    {}
  );

  //! 数据total数
  const sensorOneData = datas[sensors[0]] || [];
  const dataCount = sensorOneData.length || 0;
  const bothTemp = sensors.includes(SENSORS.TEMP) && sensors.includes(SENSORS.SUB_TEMP);
  //! sensor别名
  const alertSign = alertsProduct.reduce((obj, alert) => {
    const refinedAlert = {};
    if (alert) {
      const { type, labelIndex } = alert;
      if (labelIndex && sensors.includes(type) && Object.keys(SENSOR_LABEL).includes(type)) {
        refinedAlert.key = SENSOR_LABEL[type](LANGUAGE, bothTemp);
        refinedAlert.value = _util.getAlertLabelSign(type, labelIndex, LANGUAGE);
      }
    }
    return Object.keys(refinedAlert).length > 0 ? obj.concat([refinedAlert]) : obj;
  }, []);
  return {
    dataCount,
    sensorCnt, // 3
    sensors, // ['temp','subTemp','humi']
    thresholds, // {temp:{min,max,unit},humi:{},subTemp:{}}
    datas, //{temp:[],humi:[],subTemp:[]}
    alertSign,
  };
};

/**
 //* 初始化 device configure以及order information的简单数据
 * @param {object} info
 */
const initDeviceInfo = (globalInfo, info, sensorInfo) => {
  const { LANGUAGE = 'en', DATE_FORMAT = 'YY-MM-DD HH:MM:SS' } = globalInfo || {};
  const { customer, product, device, order, filter } = info || {};
  const { dataCount, sensors, datas } = sensorInfo || {};
  const { unbounded, bounded, unbindType = UNBIND_TYPE.UNKOWN, stopMode } = order || {};
  const {
    forRenewReport = false,
    startTime: startTimeFromWeb,
    endTime: endTimeFromWeb,
  } = filter || {};
  const {
    hardwareVersion,
    referenceModel, // 如果有这个别名，那么pdf就用这个配置展示给用户
  } = product || {};
  const { terNo = '', model, firmwareVersion, params } = device || {};
  const {
    timeZone,
    tripId = '',
    projectId = '',
    from = '',
    to = '',
    startDelayTime = DEFAULT_START_DELAY_TIME,
    report = 0,
    read = 0,
  } = params || {};
  const { name } = customer || {};

  let companyName = name;
  if (companyName && _common.getStrLength(companyName) > 40) {
    companyName = `${_common.subString(companyName, 40, true)}...`;
  }
  const sensorOneData = datas[sensors[0]] || [];
  return {
    terNo,
    model: referenceModel || model,
    firmwareVersion,
    hardwareVersion: hardwareVersion || 'DW_V02',
    companyName,
    fileCreatedTime: _util.pdfShowTime(
      _common.formatDate(unbounded || new Date(), timeZone, DATE_FORMAT),
      endTimeFromWeb,
      timeZone,
      forRenewReport,
      unbounded || new Date(),
      DATE_FORMAT
    ),
    shipmentId: tripId,
    projectId,
    from,
    to,
    startRecordTime: _util.pdfShowTime(
      _common.formatDate(
        dataCount > 0 ? sensorOneData[0].timestamp : bounded,
        timeZone,
        DATE_FORMAT
      ),
      startTimeFromWeb,
      timeZone,
      forRenewReport,
      bounded,
      DATE_FORMAT
    ),
    startRecordTimeStamp: _util.pdfApiStartEndTime(
      dataCount > 0 ? new Date(sensorOneData[0].timestamp) : bounded,
      startTimeFromWeb,
      forRenewReport,
      bounded
    ),
    endRecordTime: _util.pdfShowTime(
      _common.formatDate(
        unbounded
          ? unbounded
          : dataCount > 0
            ? sensorOneData[sensorOneData.length - 1].timestamp
            : null, // 没有解绑时间时用数据的最后一点的时间，没有数据时，就不填了
        timeZone,
        DATE_FORMAT
      ),
      endTimeFromWeb,
      timeZone,
      forRenewReport,
      unbounded,
      DATE_FORMAT
    ),
    endRecordTimeStamp: _util.pdfApiStartEndTime(
      unbounded
        ? unbounded
        : dataCount > 0
          ? new Date(sensorOneData[sensorOneData.length - 1].timestamp)
          : null,
      endTimeFromWeb,
      forRenewReport,
      unbounded
    ),
    timeZone,
    startDelayTime:
      startDelayTime !== 0
        ? `${startDelayTime} ${text('PDF_MINS', LANGUAGE)}`
        : `${0} ${text('PDF_MINS', LANGUAGE)}`,
    report: `${report} ${text('PDF_MINS', LANGUAGE)}`,
    reportVal: report,
    read: `${read} ${text('PDF_MINS', LANGUAGE)}`,
    readVal: read,
    stopMode: UNBIND_TYPE_MAP_NAME[unbindType](LANGUAGE),
    deviceStopMode: stopMode,
  };
};

const initSummaryInfo = (globalInfo, info, sensorInfo) => {
  const { DATE_FORMAT = 'YY-MM-DD HH:MM:SS', UNIT } = globalInfo || {};
  const { sensors = [], thresholds = {}, datas = {} } = sensorInfo || {};
  const { product, device } = info || {};
  const { params } = device || {};
  const { timeZone } = params || {};
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
        calcuteSummary({
          data,
          threshold: thresholds[type] || {},
          type,
          product,
          timeZone,
          mask: DATE_FORMAT,
          needTransSensorValue: needTransSensorValue(type, UNIT),
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

/**
 //* 初始化绘制pdf所需要的各种参数
 * @param {*} info 
 * @param {*} param1 
 */
const initPdfInfo = (
  globalInfo,
  info,
  { deviceInfo, sensorInfo, summaryInfo },
  { initChart = initChartParams }
) => {
  const { LANGUAGE = 'en', DATE_FORMAT = 'YY-MM-DD HH:mm:ss' } = globalInfo || {};
  const { product, filter } = info || {};
  const {
    pdfLogoText = PDF_LOGO.LOGO_TEXT,
    pdfLogoColor = PDF_LOGO.LOGO_COLOR,
    mailWebsite = '',
    pdfWebsite,
  } = product || {};
  const { estChecked = false } = filter || {};
  const { sensorCnt = 1, alertSign = [], sensors } = sensorInfo || {};
  const { showMkt } = summaryInfo || {};
  const rowDelta = sensorCnt < 3 ? ROWS_DELTAY : ROWS_DELTAY - 3;

  const paddingTop = {
    // 打算alertSign的展示做成两列，那么一行就是两个，超过两行就要网上移动note的位置
    // 尽管是3sensor，那如果sign只有一列或者两列，那么我们不需要动空间也能绘制完毕
    TOP_POS_HEAD_SUMMARY:
      sensorCnt < 3
        ? PADDING_TOP_HEAD_SUMMARY()
        : PADDING_TOP_HEAD_SUMMARY(PADDING_TOP_HEAD_SUMMARY() - THREE_SENSOR_DELTAY_HEAD_SUMMARY),
    TOP_POS_NOTE:
      sensorCnt < 3 || (sensorCnt === 3 && alertSign.length <= 2) ? 21 : THREE_SENSOR_DELTAY_NOTE,
    TOP_POS_DEVICE:
      sensorCnt < 3
        ? PADDING_TOP_DEVICE()
        : PADDING_TOP_DEVICE(PADDING_TOP_DEVICE() - THREE_SENSOR_DELTAY_DEVICE_INFO),
    TOP_POS_ORDER:
      sensorCnt < 3
        ? PADDING_TOP_DEVICE()
        : PADDING_TOP_DEVICE(PADDING_TOP_DEVICE() - THREE_SENSOR_DELTAY_DEVICE_INFO),
    TOP_POS_LOGGING:
      sensorCnt < 3
        ? PADDING_TOP_LOGGING_SUMMARY()
        : PADDING_TOP_LOGGING_SUMMARY(
            PADDING_TOP_LOGGING_SUMMARY() - THREE_SENSOR_DELTAY_LOGGING_SUMMARY
          ), // logging中展示mkt，由于可能展示，也可能不展示，所以，这一部分就需要上下浮动均匀
    TOP_POS_DATA_SUMMARY:
      sensorCnt < 3
        ? PADDING_TOP_DATA_SUMMARY()
        : PADDING_TOP_DATA_SUMMARY(PADDING_TOP_DATA_SUMMARY() - THREE_SENSOR_DELTAY_DATA_SUMMARY), // summay就是往上挪动1/3，这样不会与上面的logging有太大的距离，显得更均匀
  };

  // 动态调整一下,只需要调整Device，logging summary，data summay
  // alertSign只会在sansor的时候分两行展示，可能会影响到布局
  if (showMkt) {
    switch (sensorCnt) {
      case 3:
        // 不必调整
        break;
      case 2: //两个sensor，不必考虑alertSign的问题
        if (sensors.includes(SENSORS.TEMP) && sensors.includes(SENSORS.SUB_TEMP)) {
          // 双温会展示两个mtk与两个温度的最大最小值，所以也需要动态调整一下
          // Device 上调10
          paddingTop.TOP_POS_DEVICE -= rowDelta;
          paddingTop.TOP_POS_ORDER -= rowDelta;
          // Logging Summary 上调个rowDelta
          paddingTop.TOP_POS_LOGGING -= rowDelta;
        }
        break;
    }
  } else {
    switch (sensorCnt) {
      case 3:
        // 需要判断一下，有几个alertSign
        if (alertSign.length === 3) {
          // Device 下移一行
          paddingTop.TOP_POS_DEVICE += rowDelta;
          paddingTop.TOP_POS_ORDER += rowDelta;
          //Logging summary 下移三分之四行
          paddingTop.TOP_POS_LOGGING += (rowDelta * 4) / 3;
          // Data Summary上移三分之一行
          paddingTop.TOP_POS_DATA_SUMMARY -= rowDelta / 3;
        } else {
          // alert sign仅占用1行
          // Device 下移三分之二行
          paddingTop.TOP_POS_DEVICE += (rowDelta * 2) / 3;
          paddingTop.TOP_POS_ORDER += (rowDelta * 2) / 3;
          //Logging summary 下移一行
          paddingTop.TOP_POS_LOGGING += rowDelta;
          // Data Summary上移三分之二行
          paddingTop.TOP_POS_DATA_SUMMARY -= (rowDelta * 2) / 3;
        }
        break;
      case 2:
        // Logging summary 下移三分之一行
        paddingTop.TOP_POS_LOGGING += rowDelta / 3;
        // Data summary 上移三分之一行
        paddingTop.TOP_POS_DATA_SUMMARY -= rowDelta / 3;
        break;
      case 1:
        // Logging summary 下移一行
        paddingTop.TOP_POS_LOGGING += rowDelta;
        break;
    }
  }

  const chartParams = initChart({
    deviceInfo,
    sensorInfo,
    summaryInfo,
    globalInfo,
  });

  const dataTableParams = initDataTableParams({ sensorInfo, globalInfo, info });

  const endorsementParams = initEndorsementParams({ info, globalInfo });

  const { totalPages = 1, basePages = 1 } = dataTableParams;
  const { totalPagesEstNeed = 0 } = endorsementParams;
  const totalPage = totalPages + basePages + (estChecked ? totalPagesEstNeed : 0);

  return {
    totalPage,
    pdfLogoText: pdfLogoText || PDF_LOGO.LOGO_TEXT,
    pdfLogoColor: `#${pdfLogoColor || PDF_LOGO.LOGO_COLOR}`,
    dateFormat: text(DATE_FORMAT, LANGUAGE),
    pdfWebsite: pdfWebsite ? pdfWebsite : mailWebsite, // 兼容老数据
    //* 绘制图表chart时需要的数据
    chartParams,

    //* 绘制数据表格时需要的数据
    dataTableParams,

    //* 绘制签注时需要的参数
    endorsementParams,

    //* 绘制pdf需要的统一布局数据
    layoutParams: {
      //!____________left_____________________     _______________right___________________
      // Device Id:      TEST0001                  Compnay Name:        frigga
      //!布局相关 为了统一样式
      labelLeftStartX: PAGE_LEFT_POS(), // 左侧label起始位置，靠左半边的左边
      valueLeftStartX: PDF_A4_WIDTH / 4 - (sensorCnt < 3 ? 3 : -2), // 左半边的右侧value起始位置
      labelRightStartX: PDF_A4_WIDTH / 2 + (sensorCnt < 3 ? 10 : 6),
      valueRightStartX: (PDF_A4_WIDTH * 3) / 4 - (sensorCnt < 3 ? 43 : 38),
    },
    paddingTop,
    row_delta: {
      FIRST_ROW_DELTA: sensorCnt < 3 ? ROW_FIRST_DELTA : ROW_FIRST_DELTA - 5,
      ROW_DELTA: rowDelta,
    },
  };
};

/**
 *
 */
const initChartXValues = (data, xParts) => {
  const values = [];
  const dataCount = data.length;
  let valueNeeded = xParts + 1;
  if (dataCount < valueNeeded) {
    valueNeeded = dataCount; // 可能数据根本还不足X轴的轴线个数
  }
  const firstTimestamp = dataCount > 0 ? data[0].timestamp : 0;
  const lastTimestamp = dataCount > 0 ? data[dataCount - 1].timestamp : 0;
  const totalMilseconds = lastTimestamp - firstTimestamp;

  for (let i = 0; i < valueNeeded; i++) {
    if (dataCount > valueNeeded) {
      if (i === 0) {
        values.push(firstTimestamp);
      } else if (i < valueNeeded - 1) {
        // 中间值，我们需要通过计算得到
        values.push(firstTimestamp + Math.floor((totalMilseconds * i) / xParts));
      } else {
        // 最后一个点，就用最后一个温度点的时间填充
        values.push(lastTimestamp);
      }
    } else {
      // 不足坐标线个数的数据，直接取所有的温度点的时间
      values.push(data[i].timestamp);
    }
  }
  return values;
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
const initDataTableParams = ({ sensorInfo, globalInfo, info }) => {
  const { product } = info || {};
  // 配置中支持的展示sensor的类型
  const { pdfChartType = PDF_CHART_TYPE.TEMP_HUMI } = product || {};
  const { LANGUAGE = 'en', UNIT } = globalInfo || {};
  const { dataCount = 0, sensors = [] } = sensorInfo || {}; //原始数据页面，一列包含多少数据
  const oneColDataContains = Math.floor(
    (DATA_TABLE_HEIGHT() - TABLE_TITLE_HEIGHT()) / TABLE_EACH_LINE_HEIGHT()
  );
  // 型号配置的大方向，设备支持的PDF可绘制的sensor种类，集合是>=sensors的
  const sensorsPdfSupported = [];
  switch (pdfChartType) {
    case PDF_CHART_TYPE.TEMP_HUMI:
      sensorsPdfSupported.push(SENSORS.TEMP, SENSORS.HUMI); //! temp、humi
      break;
    case PDF_CHART_TYPE.TEMP_SUBTEMP:
      sensorsPdfSupported.push(SENSORS.TEMP, SENSORS.SUB_TEMP); //! temp、subTemp
      break;
    case PDF_CHART_TYPE.TEMP_SUBTEMP_HUMI:
      sensorsPdfSupported.push(SENSORS.TEMP, SENSORS.SUB_TEMP, SENSORS.HUMI); //! temp、subTemp、humi
      break;
    default:
      sensorsPdfSupported.push(SENSORS.TEMP);
  }
  const tableParts = TEMPS_PARTS_MAX(sensors, sensorsPdfSupported);
  //原始数据页面，一页多少数据
  const onePageDataContains = oneColDataContains * tableParts;
  //总共需要的页数_数据页
  let totalPages = 0;
  //看要分多少页
  if (dataCount >= onePageDataContains) {
    totalPages = Math.ceil(dataCount / onePageDataContains);
  } else if (dataCount != 0) {
    totalPages = 1;
  }
  let pageLeftPos = PAGE_LEFT_POS();
  let pageRightPos = PAGE_RIGHT_POS();
  // 三sensor 绘制表格，只能牺牲离左右的距离，尽量画宽些
  if (sensors.length === 3) {
    pageLeftPos = 1;
    pageRightPos = PDF_A4_WIDTH - 2;
  }
  const widthTable = pageRightPos - pageLeftPos;
  const oneColWidth = widthTable / tableParts;
  const tableTitleArr = [text('PDF_TABLE_DATE', LANGUAGE), text('PDF_TABLE_TIME', LANGUAGE)];
  sensors.forEach(type => {
    tableTitleArr.push(SIGN.UNIT(type, LANGUAGE, { unit: UNIT }));
  });

  // 定一个规则：
  //todo  Date、Time占 N 倍于sensor的宽度，这样只要判断有几个sensor，我们就可以按照均分算出每一项占的宽度
  // 倍数越小，sensor可显示的宽度就越大，2倍不行，sensor是-190.3的长度就显示不全了
  const TIME_WIDTH_PART = 1.5;
  const eachItemWidth = oneColWidth / (TIME_WIDTH_PART + TIME_WIDTH_PART + sensors.length);
  const everyDataWidths = [eachItemWidth * TIME_WIDTH_PART, eachItemWidth * TIME_WIDTH_PART];
  sensors.forEach(() => {
    everyDataWidths.push(eachItemWidth);
  });
  return {
    pageLeftPos, // 表格左侧离页面左侧的距离
    pageRightPos, // 表格右侧离页面右侧的距离
    onePageDataContains, // 一页包含多少数据
    totalPages, // table页多少页
    basePages: 1, // 第一页展示详情信息
    oneColDataContains, // 一列多少数据
    widthTable, // 表格的宽度
    tableParts, // 多少列
    oneColWidth, // 一列的宽度
    tableTitleArr, // 表头所需要展示列项
    everyDataWidths, // 每项数据的宽度
  };
};

const initEndorsementParams = ({ info, globalInfo }) => {
  const { endorsements = [], filter = {} } = info || {};
  const { LANGUAGE = 'en' } = globalInfo || {};
  const { estChecked = false } = filter || {};
  /*
  1、总是需要新增一页绘制签注
    因为数据页总是到底的
  2、一行签注需要的高度
  3、一页能绘制多少签注
  */
  const pageEstLeftPos = PAGE_LEFT_POS();
  const pageEstRightPos = PAGE_RIGHT_POS();
  const widthEst = pageEstRightPos - pageEstLeftPos;
  // 一页能绘制多少个签注
  const onePageEstContains = Math.floor(
    (ENDORSEMENT_HEIGHT() - ENDORSEMENT_TITLE_HEIGHT()) / ENDORSEMENT_EACH_LINE_HEIGHT()
  );
  // 总共需要多少页绘制所有的签注
  let totalPagesEstNeed = 0;
  if (endorsements && endorsements.length > 0) {
    totalPagesEstNeed = Math.ceil(endorsements.length / onePageEstContains);
  }

  const estTitleArr = [
    text('PDF_EST_INDEX', LANGUAGE),
    text('PDF_EST_CONTENT', LANGUAGE),
    text('PDF_EST_ER', LANGUAGE),
    text('PDF_EST_CREATED', LANGUAGE),
  ];
  // 整体按照10份分宽度
  const INDEX_WIDTH_PART = 1;
  const CONTENT_WIDTH_PART = 4;
  const ER_WIDTH_PART = 3;
  const CREATED_WIDTH_PART = 2;
  const eachItemWidth = widthEst / 10;
  const everyEstWidths = [
    INDEX_WIDTH_PART * eachItemWidth,
    CONTENT_WIDTH_PART * eachItemWidth,
    ER_WIDTH_PART * eachItemWidth,
    CREATED_WIDTH_PART * eachItemWidth,
  ];
  return {
    pageEstLeftPos,
    pageEstRightPos,
    onePageEstContains,
    totalPagesEstNeed,
    widthEst,
    estTitleArr,
    everyEstWidths,
    shouldDrawEst: estChecked,
  };
};

/**
 * api导出需要的一些信息
 */
const initApiInfo = (sensorInfo, deviceInfo, summaryInfo) => {
  const { dataCount = 0, thresholds = {} } = sensorInfo || {};
  const {
    reportVal: report = NOVALUE,
    readVal: read = NOVALUE,
    startRecordTimeStamp,
    endRecordTimeStamp,
    terNo = '',
    shipmentId = '',
    from = '',
    to = '',
    projectId = '',
  } = deviceInfo || {};
  const { isAlarm = false, highests, lowests } = summaryInfo || {};

  const summary = {};
  Object.keys(thresholds).forEach(type => {
    const { value: highest } = highests[type] || {};
    const { value: lowest } = lowests[type] || {};
    const { min, max } = thresholds[type] || {};
    switch (type) {
      case SENSORS.TEMP:
        summary.t1Max = highest;
        summary.t1Min = lowest;
        summary.t1High = max;
        summary.t1Low = min;
        break;
      case SENSORS.HUMI:
        summary.H1Max = highest;
        summary.H1Min = lowest;
        summary.H1High = max;
        summary.H1Low = min;
        break;
      case SENSORS.SUB_TEMP:
        summary.T2Max = highest;
        summary.T2Min = lowest;
        summary.T2High = max;
        summary.T2Low = min;
        break;
    }
  });

  return {
    ShipmentID: shipmentId,
    startCity: from,
    endCity: to,
    projectNum: projectId,
    deviceID: terNo,
    dataCount,
    report,
    read,
    startTime: startRecordTimeStamp || NOVALUE,
    endTime: endRecordTimeStamp || NOVALUE,
    isAlert: isAlarm,
    ...summary,
  };
};

const initBtPrintInfo = (sensorInfo, deviceInfo, summaryInfo) => {
  const { thresholds = {}, datas = {} } = sensorInfo || {};

  const {
    terNo = '',
    shipmentId = '',
    firmwareVersion = '',
    companyName = '',
    startRecordTimeStamp,
    endRecordTimeStamp,
  } = deviceInfo || {};
  const { highests, lowests } = summaryInfo || {};

  const sensorData = {};
  Object.keys(thresholds).forEach((type, index) => {
    // 暂时只支持两个sensor的打印
    if (index < 2) {
      const { value: highest, timestamp: highestTime } = highests[type] || {};
      const { value: lowest, timestamp: lowestTime } = lowests[type] || {};
      sensorData[type] = {
        data: datas[type] || [],
        highest: highest === NOVALUE ? null : highest,
        highestTime: highestTime === NOVALUE ? null : highestTime,
        lowest: lowest === NOVALUE ? null : lowest,
        lowestTime: lowestTime === NOVALUE ? null : lowestTime,
      };
    }
  });

  return {
    tripId: shipmentId,
    company: companyName,
    terNo,
    firmwareVersion,
    startTime: startRecordTimeStamp || null,
    endTime: endRecordTimeStamp || null,
    ...sensorData,
  };
};

const initEndorsementInfo = info => {
  const { endorsements = [] } = info || {};
  return { endorsements };
};

/**
 //* 绘制pdf头部信息 ：Logo、File Created Date、Note、Data Report...
 * @param {pdfKit} pdf 
 * @param {*} param1 
 */
const printHeadInfo = (
  pdf,
  {
    deviceInfo = {},
    summaryInfo = {},
    pdfInfo,
    sensorInfo,
    globalInfo,
    drawHeadDataSign = drawHeadDataReportSign,
    headDataSignConfigs,
    paddingConfigs,
  }
) => {
  const {
    pdfLogoColor,
    pdfLogoText,
    dateFormat,
    paddingTop: { TOP_POS_NOTE },
  } = pdfInfo || {};
  const { fileCreatedTime, timeZone, deviceStopMode } = deviceInfo || {};
  const { dataCount, sensors = [] } = sensorInfo || {};
  const { isAlarm = false, alarmCount = {} } = summaryInfo || {};
  const {
    showDataReport = true,
    showLogoText = true,
    logoText,
    logoTextFontSize = FONT_SIZE_LOGO, // 绘制logoText的 font size
    // 因为可能实际logoText用的size比标准FONT_SIZE_LOGO小，因为摆不下，但是计算长度却没有这个size标准
    calcuteStepFontSize = FONT_SIZE_LOGO, // 丈量logoText所占尺寸所用的fontSize的标准
    specialLogoTextForBio = false,
  } = headDataSignConfigs || {};
  const { topDelta = 0 } = paddingConfigs || {};

  const paddingTopHead = PADDING_TOP_HEAD() + topDelta;
  // 记录坐标x的位置,起始位置与最左边有一定padding
  let posX = PAGE_LEFT_POS();
  let posY = paddingTopHead;
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
  drawHeadDataSign(pdf, {
    startX: posX,
    startY: posY,
    pdfLogoColor,
    pdfLogoText: logoText || pdfLogoText,
    globalInfo,
    showDataReport,
    showLogoText,
    logoTextFontSize,
    calcuteStepFontSize,
    specialLogoTextForBio,
  });

  //! #################################################################
  //* 4、Note:All times shown are based on UTC+8:00。。。
  //! #################################################################
  posX = PAGE_LEFT_POS();
  posY = paddingTopHead + logoHeight + TOP_POS_NOTE;
  drawHeadNoteSign(pdf, {
    startX: posX,
    startY: posY,
    timeZone,
    dateFormat,
    globalInfo,
  });

  //! #################################################################
  //* 5、Temp Low/High Alarm、Humi Low/High Alarm、Data Points
  //! #################################################################
  const { startX } = drawHeadDataSummay(pdf, {
    sensors,
    dataCount,
    alarmCount,
    globalInfo,
    pdfInfo,
    paddingConfigs,
    deviceStopMode,
  });

  //! #################################################################
  //* 6、绘制alertSign,依赖dataSummay的起始位置，因为不能绘制超过其起始位置，所以需要确定一个最宽的距离
  //! #################################################################
  drawAlertSign(pdf, {
    startY: posY + 8 + topDelta,
    width: startX - PAGE_LEFT_POS(),
    sensorInfo,
    paddingConfigs,
  });
};

const drawHeadLogo = (pdf, { globalInfo, startX, startY, logoHeight, logoWidth, isAlarm }) => {
  const { TEMPLATE_NAME } = globalInfo || {};
  switch (TEMPLATE_NAME) {
    case PDF_TEMPLATE_NAME.FRIGGA:
    case PDF_TEMPLATE_NAME.SHENGSHENG:
    case PDF_TEMPLATE_NAME.TAIKUN:
    case PDF_TEMPLATE_NAME.BRAZIL:
      drawLogo(pdf, PDF_A4_WIDTH, startX, startY, logoHeight, logoWidth, isAlarm);
      break;
    case PDF_TEMPLATE_NAME.RUSSIA_TKMK:
      drawYesOrNoLogo(pdf, PDF_A4_WIDTH, startX, startY, logoHeight, logoWidth, isAlarm);
      break;
    default:
      drawLogo(pdf, PDF_A4_WIDTH, startX, startY, logoHeight, logoWidth, isAlarm);
  }
};

const drawHeadFileCreatedDate = (pdf, { startX, startY, fileCreatedTime, globalInfo }) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  pdf
    .font(getFont(LANGUAGE))
    .fillColor('black')
    .fontSize(FONT_SIZE_NORMAL)
    .text(`${text('PDF_FILE_CREATED', LANGUAGE)}${fileCreatedTime}`, startX, startY);
  return { endX: startX, endY: startY };
};

const drawHeadDataReportSign = (
  pdf,
  {
    startX,
    startY,
    pdfLogoColor,
    pdfLogoText,
    globalInfo,
    showLogoText = true,
    showDataReport = true, // russia模板，俄语不展示data report，英文展示
    logoTextFontSize = FONT_SIZE_LOGO, // 绘制logoText的 font size
    // 因为可能实际logoText用的size比标准FONT_SIZE_LOGO小，因为摆不下，但是计算长度却没有这个size标准
    calcuteStepFontSize = FONT_SIZE_LOGO, // 丈量logoText所占尺寸所用的fontSize的标准
    specialLogoTextForBio = false,
  }
) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  let posX = startX;
  let posY = startY;

  const constainChinese = checkContainChinese(pdfLogoText);

  if (showLogoText) {
    // 当前是所有中文都不显示logoText
    if (LANGUAGE !== 'zh') {
      const logoTextLen = pdfLogoText.length;
      // 绘制logoText前，先大致判断下，占的宽度，因为毕竟是用户配置，可长可短
      // 比如：Термо-Конт МК，这个是要中文格式才能显示，但是占用了80%的宽度，每个字之间的距离很大，就显得不协调，所以都做了characterSpaceing的压缩
      const deltaX =
        stepLength(pdfLogoText, {
          fontSize: calcuteStepFontSize,
          lan: constainChinese ? 'zh' : 'en',
        }) +
        (logoTextLen - 1) * (LANGUAGE === 'en' ? 1.4 : 1.5) - // 中文占的空间大一些，所以盈余1.5倍
        logoTextLen * (constainChinese ? 5 : 1); // 因为做了characterSpacing的压缩，所以这里要减去一定的delta值，也就是多少个字*5

      if (constainChinese) {
        pdf
          .font(getFont('zh'))
          .fontSize(logoTextFontSize)
          .fillColor(pdfLogoColor)
          .text(`${pdfLogoText}`, startX, startY, {
            wordSpacing: -3,
            characterSpacing: -5,
          });
      } else {
        if (!specialLogoTextForBio) {
          pdf
            .fontSize(logoTextFontSize)
            .fillColor(pdfLogoColor)
            .text(`${pdfLogoText}`, startX, startY, {
              characterSpacing: -1,
            });
        } else {
          // 当前仅仅写死，只针对Bio客户的BIOTEMPAK字串
          if (pdfLogoText === 'BIOTEMPAK') {
            pdf
              .fontSize(logoTextFontSize)
              .fillColor([51, 171, 87])
              .text('BIO', startX, startY, { characterSpacing: -1 });
            pdf.fillColor(pdfLogoColor).text('TEMPAK', startX + (deltaX * 3) / 9 - 5, startY, {
              characterSpacing: -1,
            });
          } else {
            pdf
              .fontSize(logoTextFontSize)
              .fillColor(pdfLogoColor)
              .text(`${pdfLogoText}`, startX, startY, {
                characterSpacing: -1,
              });
          }
        }
      }
      // 此时把logoText画好后，我们需要大致判断下，占的宽度，因为毕竟是用户配置，可长可短
      // 确定2需要写的x坐标，这样画出来更协调（动态调整）两字母间还会有少许间隙
      if (showDataReport) {
        // 2、画@符号
        posX += deltaX + 4;
        // 商标强制用英文字体，显得大
        pdf.font(getFont('en')).fontSize(FONT_SIZE_SMALL).text(SIGN.SHANGBIAO, posX, posY);
        // 3、画Data Report
        posX += 10;
        posY = startY + 1;
      }
    }
  }
  if (showDataReport) {
    pdf
      .font(getFont(LANGUAGE))
      .fillColor(pdfLogoColor)
      .fontSize(logoTextFontSize)
      .text(text('PDF_DATA_REPORT', LANGUAGE), posX, posY, {
        lineBreak: false,
        wordSpacing: -3,
        characterSpacing: constainChinese ? -5 : -1,
      });
  }

  return { endX: posX, endY: posY };
};

const drawHeadNoteSign = (pdf, { startX, startY, timeZone, dateFormat, globalInfo }) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  pdf
    .font(getFont(LANGUAGE))
    .fontSize(FONT_SIZE_SMALL)
    .fillColor([0, 0, 255])
    .text(
      _util.stringFormat([text('PDF_NOTE', LANGUAGE), timeZone, `[${dateFormat}]`]),
      startX,
      startY
    );
  return { endX: startX, endY: startY };
};

/**
 * 按照两列来绘制,那么我们就取一个等分好了
 */
const drawAlertSign = (pdf, { startY, colCnt = 2, width, height, sensorInfo }) => {
  const { alertSign = [] } = sensorInfo;
  let posX = PAGE_LEFT_POS();
  let posY = startY;
  const onePartWidth = width / colCnt;
  const onePartHeight = (height && height / Math.ceil(alertSign.length / colCnt)) || height;
  const labelWidth = onePartWidth / 3;
  const valueWidth = onePartWidth - labelWidth;
  const options = Object.assign(
    { lineBreak: false, width: labelWidth },
    height ? { height: onePartHeight } : {}
  );
  alertSign.forEach((sign, index) => {
    const { key, value } = sign || {};
    if (key && value) {
      pdf.fontSize(FONT_SIZE_SMALL).fillColor(ALARM_COLOR).text(`${key}:`, posX, posY, options);
      posX += labelWidth;
      pdf.text(value, posX, posY, { ...options, width: valueWidth });
      posX += valueWidth;
      // pdf
      //   .fontSize(FONT_SIZE_SMALLER)
      //   .fillColor(ALARM_COLOR)
      //   .text(
      //     `${key}:  ${value}`,
      //     posX,
      //     posY,
      //     Object.assign(
      //       {
      //         lineBreak: false,
      //         width: onePartWidth,
      //       },
      //       height ? { height } : {}
      //     )
      //   );
      // posX += onePartWidth;
      if ((index + 1) % colCnt == 0) {
        posX = PAGE_LEFT_POS();
        posY += 10;
      }
    }
  });
};

const drawHeadDataSummay = (
  pdf,
  {
    sensors,
    dataCount,
    alarmCount,
    pageRightPos = PAGE_RIGHT_POS(),
    globalInfo,
    pdfInfo,
    paddingConfigs,
    deviceStopMode,
  }
) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  const {
    paddingTop: { TOP_POS_HEAD_SUMMARY },
  } = pdfInfo || {};
  const { topDelta = 0 } = paddingConfigs || {};

  // 起始位置也是需要动态计算,也就是下面样例整体从哪里开始绘制 labelDelta+dataDelta+一部分空格间隔
  // Temp low Alarm:   0
  // label部分最大delta值
  let labelDeltaXMax = 0;
  const ONE_STEP = LANGUAGE == 'zh' ? 8 : 4; // 模糊计算，一个字符占5个宽度
  // 数据部分最大delta值
  let dataDeltaXMax = 0;
  /**
   * {
   *    'dataCount':{
   *      label:'Data  Point',
   *      delta:10,
   *    },
   *    'temp':{
   *      low:{
   *        label:'Temp Low Alarm:',
   *        delta:20,
   *      },
   *      hight:{
   *        label:'Temp High Alarm:',
   *        delta:20,
   *      },
   *    },
   *    'humi':{
   *    ...
   *    }
   * }
   */
  const deltaXs = ['dataCount'].concat(sensors).reduce((pre, type) => {
    const deltas = {};

    if (type === 'dataCount') {
      deltas[type] = {
        label: text('PDF_DATA_POINTS', LANGUAGE),
        delta: stepLength(dataCount, {
          fontSize: FONT_SIZE_SMALL,
          startPos: 'right',
        }),
      };
      labelDeltaXMax = Math.max(labelDeltaXMax, deltas[type].label.length * ONE_STEP);
      dataDeltaXMax = Math.max(dataDeltaXMax, deltas[type].delta);
    } else {
      const { low, high } = alarmCount[type] || {};
      const { total: lowTotal = 0 } = low || {};
      const { total: highTotal = 0 } = high || {};

      const lowX = stepLength(lowTotal, {
        fontSize: FONT_SIZE_SMALL,
        startPos: 'right',
      });
      const highX = stepLength(highTotal, {
        fontSize: FONT_SIZE_SMALL,
        startPos: 'right',
      });
      dataDeltaXMax = Math.max(dataDeltaXMax, lowX, highX);
      deltas[type] = {
        low: {
          label: '',
          delta: lowX,
        },
        high: {
          label: '',
          delta: highX,
        },
      };
    }
    const bothTemp = sensors.includes(SENSORS.TEMP) && sensors.includes(SENSORS.SUB_TEMP);
    switch (type) {
      case SENSORS.TEMP:
        deltas[type].low.label = text(
          bothTemp ? 'PDF_TEMP1_LOW_ALARM' : 'PDF_TEMP_LOW_ALARM',
          LANGUAGE
        );
        deltas[type].high.label = text(
          bothTemp ? 'PDF_TEMP1_HIGH_ALARM' : 'PDF_TEMP_HIGH_ALARM',
          LANGUAGE
        );
        labelDeltaXMax = Math.max(
          labelDeltaXMax,
          deltas[type].low.label.length * ONE_STEP,
          deltas[type].high.label.length * ONE_STEP
        );
        break;
      case SENSORS.HUMI:
        deltas[type].low.label = text('PDF_HUMI_LOW_ALARM', LANGUAGE);
        deltas[type].high.label = text('PDF_HUMI_HIGH_ALARM', LANGUAGE);
        labelDeltaXMax = Math.max(
          labelDeltaXMax,
          deltas[type].low.label.length * ONE_STEP,
          deltas[type].high.label.length * ONE_STEP
        );
        break;
      case SENSORS.SUB_TEMP:
        deltas[type].low.label = text('PDF_TEMP2_LOW_ALARM', LANGUAGE);
        deltas[type].high.label = text('PDF_TEMP2_HIGH_ALARM', LANGUAGE);
        labelDeltaXMax = Math.max(
          labelDeltaXMax,
          deltas[type].low.label.length * ONE_STEP,
          deltas[type].high.label.length * ONE_STEP
        );
        break;
      default:
      // do nothing
    }

    return { ...pre, ...deltas };
  }, {});

  // 从最右侧门限开始往左计算宽度  多左移一点空格的距离
  const posX = pageRightPos - labelDeltaXMax - dataDeltaXMax - 25; // 记录下开始绘制的起始位置
  let posY = TOP_POS_HEAD_SUMMARY + topDelta;
  const deltaY = 15;
  pdf.fontSize(FONT_SIZE_SMALL).fillColor(DEFAULT_FONT_COLOR);
  sensors.forEach(type => {
    const { low, high } = alarmCount[type] || {};
    const { total: lowTotal = 0 } = low || {};
    const { total: highTotal = 0 } = high || {};
    switch (type) {
      case SENSORS.TEMP:
        textBreak(pdf, deltaXs[type].low.label, posX, posY);
        textBreak(pdf, lowTotal, pageRightPos - deltaXs[type].low.delta, posY);

        posY += deltaY;
        textBreak(pdf, deltaXs[type].high.label, posX, posY);
        textBreak(pdf, highTotal, pageRightPos - deltaXs[type].high.delta, posY);
        break;
      case SENSORS.HUMI:
        posY += deltaY;
        textBreak(pdf, deltaXs[type].low.label, posX, posY);
        textBreak(pdf, lowTotal, pageRightPos - deltaXs[type].low.delta, posY);

        posY += deltaY;
        textBreak(pdf, deltaXs[type].high.label, posX, posY);
        textBreak(pdf, highTotal, pageRightPos - deltaXs[type].high.delta, posY);
        break;
      case SENSORS.SUB_TEMP:
        posY += deltaY;
        textBreak(pdf, deltaXs[type].low.label, posX, posY);
        textBreak(pdf, lowTotal, pageRightPos - deltaXs[type].low.delta, posY);

        posY += deltaY;
        textBreak(pdf, deltaXs[type].high.label, posX, posY);
        textBreak(pdf, highTotal, pageRightPos - deltaXs[type].high.delta, posY);
        break;
      default:
      // do nothing
    }
  });
  posY += deltaY;
  textBreak(pdf, deltaXs['dataCount'].label, posX, posY);
  textBreak(pdf, dataCount, pageRightPos - deltaXs['dataCount'].delta, posY);

  const stopMode = {
    label: text('PDF_STOP_MODE', LANGUAGE),
    delta: stepLength(dataCount, {
      fontSize: FONT_SIZE_SMALL,
      startPos: 'right',
    }),
  };
  posY += deltaY;
  textBreak(pdf, stopMode.label, posX, posY);
  textBreak(pdf, deviceStopMode, pageRightPos - stopMode.delta, posY);

  return { startX: posX };
};

/**
 //* 绘制 Device Information
 * @param {pdfKit} pdf 
 * @param {object} deviceInfo 
 */
const printDeviceInfo = (pdf, { deviceInfo, pdfInfo, globalInfo, paddingConfigs }) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  const {
    pdfLogoColor,
    layoutParams: { labelLeftStartX, valueLeftStartX },
    paddingTop: { TOP_POS_DEVICE },
    row_delta: { FIRST_ROW_DELTA, ROW_DELTA },
  } = pdfInfo || {};
  const { terNo, model, firmwareVersion, hardwareVersion } = deviceInfo || {};
  const { topDelta = 0 } = paddingConfigs || {};

  let posY = TOP_POS_DEVICE + topDelta;
  pdf
    .fontSize(FONT_SIZE_TITLE)
    .fillColor(pdfLogoColor)
    .text(text('PDF_DEVICE_INFO', LANGUAGE), labelLeftStartX, posY);
  // 画线
  posY += DELTA_Y_LABEL_LINE;
  drawLine(pdf, [labelLeftStartX, posY], [PDF_A4_WIDTH / 2 - 10, posY]);

  posY += FIRST_ROW_DELTA;
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_DEVICEID', LANGUAGE), labelLeftStartX, posY);
  pdf.text(terNo, valueLeftStartX, posY);

  posY += ROW_DELTA;
  pdf.text(text('PDF_MODEL', LANGUAGE), labelLeftStartX, posY);
  pdf.text(model, valueLeftStartX, posY);

  posY += ROW_DELTA;
  pdf.text(text('PDF_FIRM_VERSION', LANGUAGE), labelLeftStartX, posY);
  pdf.text(firmwareVersion, valueLeftStartX, posY);

  posY += ROW_DELTA;
  pdf.text(text('PDF_HARD_VERSION', LANGUAGE), labelLeftStartX, posY);
  pdf.text(hardwareVersion, valueLeftStartX, posY);
};

/**
 //* 绘制 Device Configuration
 * @param {pdfKit} pdf 
 * @param {object} deviceInfo 
 */
const printOrderInfo = (pdf, { deviceInfo, pdfInfo, globalInfo, paddingConfigs }) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  const {
    pdfLogoColor,
    layoutParams: { labelRightStartX, valueRightStartX },
    paddingTop: { TOP_POS_ORDER },
    row_delta: { FIRST_ROW_DELTA, ROW_DELTA },
  } = pdfInfo || {};
  const { companyName, shipmentId, startRecordTime, endRecordTime, startDelayTime, read } =
    deviceInfo || {};
  const { topDelta = 0 } = paddingConfigs || {};

  let posY = TOP_POS_ORDER + topDelta;
  pdf
    .fontSize(FONT_SIZE_TITLE)
    .fillColor(pdfLogoColor)
    .text(text('PDF_DEVICE_CONFIG', LANGUAGE), labelRightStartX, posY);
  // 画线
  posY += DELTA_Y_LABEL_LINE;
  drawLine(pdf, [labelRightStartX, posY], [PAGE_RIGHT_POS(), posY]);

  posY += FIRST_ROW_DELTA;
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_DEVICE_START_DELAY', LANGUAGE), labelRightStartX, posY);
  if (checkContainChinese(read)) {
    pdf.font(getFont('zh')).text(read, valueRightStartX, posY);
  } else {
    pdf.text(startDelayTime, valueRightStartX, posY);
  }

  posY += ROW_DELTA;
  pdf.font(getFont(LANGUAGE)).text(text('PDF_DEVICE_LOG', LANGUAGE), labelRightStartX, posY);
  pdf.text(read, valueRightStartX, posY);
  // if (checkContainChinese(shipmentId)) {
  //   pdf.font(getFont('zh')).text(shipmentId, valueRightStartX, posY);
  // } else {
  //   pdf.text(shipmentId, valueRightStartX, posY, {
  //     width: PDF_A4_WIDTH - valueRightStartX - PAGE_LEFT_POS(),
  //     lineBreak: false,
  //     lineGap: -2.5,
  //     // height: ROW_DELTA,
  //     ellipsis: true,
  //   });
  // }

  posY += ROW_DELTA;
  pdf.font(getFont(LANGUAGE)).text(text('PDF_DEVICE_START_TIME', LANGUAGE), labelRightStartX, posY);
  pdf.text(startRecordTime, valueRightStartX, posY);

  posY += ROW_DELTA;
  pdf.text(text('PDF_DEVICE_END_TIME', LANGUAGE), labelRightStartX, posY);
  pdf.text(endRecordTime, valueRightStartX, posY);
};

const printLoggingLessThreeSummay = (
  pdf,
  { sensorInfo, globalInfo, pdfInfo, summaryInfo, deviceInfo, posY, loggingSummaryConfigs }
) => {
  const { LANGUAGE = 'en', UNIT } = globalInfo || {};
  const { sensors = [], thresholds = {}, dataCount = 0 } = sensorInfo || {};
  const {
    layoutParams: { labelLeftStartX, valueLeftStartX, labelRightStartX, valueRightStartX },
    row_delta: { ROW_DELTA },
  } = pdfInfo || {};
  const { highests, lowests, averages, mkts, showMkt } = summaryInfo || {};
  const { report, read, startDelayTime } = deviceInfo || {};
  const { threshold1Label } = loggingSummaryConfigs || {};

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

  //* threshold
  // 温-湿
  if (existTemp && existHumi) {
    thresh1Label = (threshold1Label && threshold1Label) || text('PDF_TEMP_HUMI_THRESH', LANGUAGE);
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
    thresh1Label = (threshold1Label && threshold1Label) || text('PDF_BOTH_TEMPS_THRESH', LANGUAGE);
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
    thresh1Label = (threshold1Label && threshold1Label) || text('PDF_TEMP_THRESH', LANGUAGE);
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
    .text(text('PDF_DEVICE_DATA_POINT', LANGUAGE), labelRightStartX, posY, {
      width: valueRightStartX - labelRightStartX,
      lineGap: -2,
    });
  pdf.text(dataCount, valueRightStartX, posY);

  //* 最高温 最低温
  // 一组（一行）数据
  sensors.forEach(type => {
    if (bothTemp) {
      const highestLabel =
        type === SENSORS.TEMP
          ? text('PDF_HIGHEST_TEMP1', LANGUAGE)
          : text('PDF_HIGHEST_TEMP2', LANGUAGE);
      const lowestLabel =
        type === SENSORS.TEMP
          ? text('PDF_LOWEST_TEMP1', LANGUAGE)
          : text('PDF_LOWEST_TEMP2', LANGUAGE);
      const averageLabel =
        type === SENSORS.TEMP
          ? text('PDF_AVERAGE_TEMP1', LANGUAGE)
          : text('PDF_AVERAGE_TEMP2', LANGUAGE);
      const mktLabel =
        type === SENSORS.TEMP ? text('PDF_MKT1', LANGUAGE) : text('PDF_MKT2', LANGUAGE);
      posY += ROW_DELTA;
      pdf.text(highestLabel, labelLeftStartX, posY);
      pdf.text(
        highests[type].value === NOVALUE
          ? NOVALUE
          : `${_util.formatSensorValue(type)(highests[type].value, 1)}${unitTemp} (${
              highests[type].time
            })`,
        valueLeftStartX,
        posY
      );
      pdf.text(lowestLabel, labelRightStartX, posY);
      pdf.text(
        lowests[type].value === NOVALUE
          ? NOVALUE
          : `${_util.formatSensorValue(type)(lowests[type].value, 1)}${unitTemp} (${
              lowests[type].time
            })`,
        valueRightStartX,
        posY,
        { lineBreak: false }
      );
    } else if (type === SENSORS.HUMI) {
      // 一组（一行）数据
      posY += ROW_DELTA;
      pdf.text(text('PDF_HIGHEST_HUMI', LANGUAGE), labelLeftStartX, posY);
      pdf.text(
        highests[SENSORS.HUMI].value === NOVALUE
          ? NOVALUE
          : `${_util.formatSensorValue(SENSORS.HUMI)(
              highests[SENSORS.HUMI].value,
              1
            )}${unitHumi} (${highests[SENSORS.HUMI].time})`,
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
    } else {
      // 单温：要么是temp 要么是subTemp
      posY += ROW_DELTA;
      pdf.text(text('PDF_HIGHEST_TEMP', LANGUAGE), labelLeftStartX, posY);
      pdf.text(
        highests[type].value === NOVALUE
          ? NOVALUE
          : `${_util.formatSensorValue(type)(highests[type].value, 1)}${unitTemp} (${
              highests[type].time
            })`,
        valueLeftStartX,
        posY
      );
      pdf.text(text('PDF_LOWEST_TEMP', LANGUAGE), labelRightStartX, posY);
      pdf.text(
        lowests[type].value === NOVALUE
          ? NOVALUE
          : `${_util.formatSensorValue(type)(lowests[type].value, 1)}${unitTemp} (${
              lowests[type].time
            })`,
        valueRightStartX,
        posY,
        { lineBreak: false }
      );
    }
  });

  // 一组（一行）数据
  if (showMkt) {
    posY += ROW_DELTA;
    pdf.text(text('PDF_MKT', LANGUAGE), labelLeftStartX, posY);
    pdf.text(
      mkts['temp'] === NOVALUE
        ? NOVALUE
        : `${_util.formatSensorValue('temp')(mkts['temp'], 1)}${unitTemp}`,
      valueLeftStartX,
      posY
    );
    pdf.text(text('PDF_AVERAGE', LANGUAGE), labelRightStartX, posY, {
      width: valueRightStartX - labelRightStartX,
      lineGap: -2,
    });
    pdf.text(
      averages['temp'] === NOVALUE
        ? NOVALUE
        : `${_util.formatSensorValue('temp')(averages['temp'], 1)}${unitTemp}`,

      valueRightStartX,
      posY
    );
  }

  // 一组（一行）数据
  // posY += ROW_DELTA;
  // pdf.text(text('PDF_REPORT_INTERVAL', LANGUAGE), labelLeftStartX, posY);
  // pdf.text(report, valueLeftStartX, posY);
  // pdf.text(text('PDF_RECORD_INTERVAL', LANGUAGE), labelRightStartX, posY);
  // pdf.text(read, valueRightStartX, posY);
};

const printLoggingThreeSummay = (
  pdf,
  { sensorInfo, globalInfo, pdfInfo, summaryInfo, deviceInfo, posY }
) => {
  const { LANGUAGE = 'en', UNIT } = globalInfo || {};
  const { thresholds = {} } = sensorInfo || {};
  const {
    layoutParams: { labelLeftStartX, valueLeftStartX, labelRightStartX, valueRightStartX },
    row_delta: { ROW_DELTA },
  } = pdfInfo || {};
  const { highests, lowests, averages, mkts, averageDeviations, showMkt } = summaryInfo || {};
  const { report, read, startDelayTime } = deviceInfo || {};
  const { min: minTemp, max: maxTemp } = thresholds[SENSORS.TEMP] || {};
  const { min: minTemp2, max: maxTemp2 } = thresholds[SENSORS.SUB_TEMP] || {};
  const unitTemp = SIGN.UNIT(SENSORS.TEMP, LANGUAGE, { unit: UNIT });
  const { min: minHumi, max: maxHumi } = thresholds[SENSORS.HUMI] || {};
  const unitHumi = SIGN.UNIT(SENSORS.HUMI, LANGUAGE);

  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_TEMP_THRESH', LANGUAGE), labelLeftStartX, posY);
  pdf.text(
    `${_util.formatSensorValue(SENSORS.TEMP)(minTemp, 1)}${unitTemp}${getBoLangHao(
      LANGUAGE
    )}${_util.formatSensorValue(SENSORS.TEMP)(maxTemp, 1)}${unitTemp}`,
    valueLeftStartX,
    posY
  );
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_TEMP2_THRESH', LANGUAGE), labelRightStartX, posY);
  pdf.text(
    `${_util.formatSensorValue(SENSORS.SUB_TEMP)(minTemp2, 1)}${unitTemp}${getBoLangHao(
      LANGUAGE
    )}${_util.formatSensorValue(SENSORS.SUB_TEMP)(maxTemp2, 1)}${unitTemp}`,
    valueRightStartX,
    posY
  );

  // 一组（一行）数据
  posY += ROW_DELTA;
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_HUMI_THRESH', LANGUAGE), labelLeftStartX, posY);
  pdf.text(
    `${_util.formatSensorValue(SENSORS.HUMI)(minHumi, 1)}${unitHumi}${getBoLangHao(
      LANGUAGE
    )}${_util.formatSensorValue(SENSORS.HUMI)(maxHumi, 1)}${unitHumi}`,
    valueLeftStartX,
    posY
  );
  pdf
    .fontSize(FONT_SIZE_SMALL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_START_DELAY', LANGUAGE), labelRightStartX, posY);
  pdf.text(startDelayTime, valueRightStartX, posY);

  // 一组（一行）数据
  posY += ROW_DELTA;
  pdf.text(text('PDF_HIGHEST_TEMP1', LANGUAGE), labelLeftStartX, posY);
  pdf.text(
    highests[SENSORS.TEMP].value === NOVALUE
      ? NOVALUE
      : `${_util.formatSensorValue(SENSORS.TEMP)(highests[SENSORS.TEMP].value, 1)}${unitTemp} (${
          highests[SENSORS.TEMP].time
        })`,
    valueLeftStartX,
    posY
  );
  pdf.text(text('PDF_LOWEST_TEMP1', LANGUAGE), labelRightStartX, posY);
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
    pdf.text(text('PDF_TEMP1_AVERATE_STANDARD', LANGUAGE), labelLeftStartX, posY);
    pdf.text(
      averages[SENSORS.TEMP] === NOVALUE
        ? NOVALUE
        : `${_util.formatSensorValue(SENSORS.TEMP)(averages[SENSORS.TEMP], 1)}${unitTemp}/${
            averageDeviations[SENSORS.TEMP]
          }${unitTemp}`,
      valueLeftStartX,
      posY
    );
    pdf.text(text('PDF_MKT1', LANGUAGE), labelRightStartX, posY, {
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

  // 一组（一行）数据
  if (showMkt) {
    posY += ROW_DELTA;
    pdf.text(text('PDF_TEMP2_AVERATE_STANDARD', LANGUAGE), labelLeftStartX, posY);
    pdf.text(
      averages[SENSORS.SUB_TEMP] === NOVALUE
        ? NOVALUE
        : `${_util.formatSensorValue(SENSORS.SUB_TEMP)(averages[SENSORS.SUB_TEMP], 1)}${unitTemp}/${
            averageDeviations[SENSORS.SUB_TEMP]
          }${unitTemp}`,
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

  // 一组（一行）数据
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

  // 一组（一行）数据
  posY += ROW_DELTA;
  pdf.text(text('PDF_HUMI_AVERAGE', LANGUAGE), labelLeftStartX, posY);
  pdf.text(
    averages[SENSORS.HUMI] === NOVALUE
      ? NOVALUE
      : `${_util.formatSensorValue(SENSORS.HUMI)(averages[SENSORS.HUMI], 1)}${unitHumi}`,
    valueLeftStartX,
    posY
  );
  pdf.text(text('PDF_RECORD_INTERVAL', LANGUAGE), labelRightStartX, posY);
  pdf.text(read, valueRightStartX, posY);

  // 一组（一行）数据
  posY += ROW_DELTA;
  pdf.text(text('PDF_REPORT_INTERVAL', LANGUAGE), labelLeftStartX, posY);
  pdf.text(report, valueLeftStartX, posY);
};
/**
 //* 绘制 Order Information
 * @param {pdfKit} pdf 
 * @param {object} deviceInfo 
 */
const printLoggingSummary = (
  pdf,
  {
    sensorInfo,
    summaryInfo,
    deviceInfo,
    pdfInfo,
    globalInfo,
    printLoggingLessThree = printLoggingLessThreeSummay,
    paddingConfigs,
    loggingSummaryConfigs,
  }
) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  const { sensorCnt } = sensorInfo || {};
  const {
    pdfLogoColor,
    layoutParams: { labelLeftStartX },
    paddingTop: { TOP_POS_LOGGING },
    row_delta: { FIRST_ROW_DELTA },
  } = pdfInfo || {};
  const { topDelta = 0 } = paddingConfigs || {};

  let posY = TOP_POS_LOGGING + topDelta;
  pdf
    .fontSize(FONT_SIZE_TITLE)
    .fillColor(pdfLogoColor)
    .text(text('PDF_LOGGING_SUMMARY', LANGUAGE), labelLeftStartX, posY);
  // 画线
  posY += DELTA_Y_LABEL_LINE;
  drawLine(pdf, [labelLeftStartX, posY], [PAGE_RIGHT_POS(), posY]);

  posY += FIRST_ROW_DELTA;

  // 一组（一行）数据
  if (sensorCnt < 3) {
    printLoggingLessThree(pdf, {
      sensorInfo,
      globalInfo,
      pdfInfo,
      summaryInfo,
      deviceInfo,
      posY,
      loggingSummaryConfigs,
    });
  } else {
    printLoggingThreeSummay(pdf, {
      sensorInfo,
      globalInfo,
      pdfInfo,
      summaryInfo,
      deviceInfo,
      posY,
      loggingSummaryConfigs,
    });
  }
};

/**
 //*画dataSummary 
 * @param {pdfKit} pdf 
 * @param {*} summaryInfo 
 */
const printDataSummary = (
  pdf,
  {
    pdfInfo,
    summaryInfo,
    sensorInfo,
    globalInfo,
    showSensors = [SENSORS.TEMP, SENSORS.SUB_TEMP, SENSORS.HUMI],
    paddingConfigs,
  }
) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  const { sensors = [], sensorCnt } = sensorInfo || {};
  const { alarmCount = {} } = summaryInfo || {};
  const {
    pdfLogoColor,
    row_delta: { FIRST_ROW_DELTA, ROW_DELTA },
    paddingTop: { TOP_POS_DATA_SUMMARY },
  } = pdfInfo || {};
  const { topDelta = 0 } = paddingConfigs || {};

  const onePartWidth = (PDF_A4_WIDTH - PAGE_LEFT_POS() * 2) / 4;
  let posX = PAGE_LEFT_POS();
  let posY = TOP_POS_DATA_SUMMARY + topDelta;
  pdf
    .fontSize(FONT_SIZE_TITLE)
    .fillColor(pdfLogoColor)
    .text(text('PDF_DATA_SUMMARY', LANGUAGE), posX, posY);
  // 画线
  posY += DELTA_Y_LABEL_LINE;
  drawLine(pdf, [posX, posY], [PAGE_RIGHT_POS(), posY]);

  posY += FIRST_ROW_DELTA;
  pdf
    .fontSize(FONT_SIZE_NORMAL)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_ALARM_TYPE', LANGUAGE), posX, posY, {
      width: onePartWidth,
      align: 'left',
    });

  const lengthBetween1st2nd = onePartWidth - 20;
  posX += lengthBetween1st2nd;
  pdf.text(text('PDF_TOTAL_EVENTS', LANGUAGE), posX, posY, {
    width: onePartWidth,
    align: 'center',
  });

  posX += onePartWidth;
  pdf.text(text('PDF_LONGEST_TIME', LANGUAGE), posX, posY, {
    width: onePartWidth,
    align: 'center',
  });

  posX += onePartWidth;
  pdf.text(text('PDF_TOTAL_TIME', LANGUAGE), posX, posY, {
    width: onePartWidth,
    align: 'center',
  });

  const drawData = (posX, posY, { total, longestTime, totalTime }) => {
    posX += lengthBetween1st2nd;
    pdf.text(total, posX, posY, {
      width: onePartWidth,
      align: 'center',
    });
    posX += onePartWidth;
    pdf.text(longestTime, posX, posY, {
      width: onePartWidth,
      align: 'center',
    });
    posX += onePartWidth;
    pdf.text(totalTime, posX, posY, {
      width: onePartWidth,
      align: 'center',
    });
  };

  const bothTemp = sensors.includes(SENSORS.TEMP) && sensors.includes(SENSORS.SUB_TEMP);
  sensors.forEach(type => {
    const { low, high } = alarmCount[type] || {};
    switch (type) {
      case SENSORS.TEMP:
        if (showSensors.includes(type)) {
          posX = PAGE_LEFT_POS(); // 重新回到最左边绘制
          posY += ROW_DELTA;
          pdf
            .fontSize(FONT_SIZE_SMALL)
            .text(text(bothTemp ? 'PDF_TEMP1_LOW' : 'PDF_TEMP_LOW', LANGUAGE), posX, posY);
          drawData(posX, posY, low);

          posX = PAGE_LEFT_POS(); // 重新回到最左边绘制
          posY += ROW_DELTA;
          pdf
            .fontSize(FONT_SIZE_SMALL)
            .text(text(bothTemp ? 'PDF_TEMP1_HIGH' : 'PDF_TEMP_HIGH', LANGUAGE), posX, posY);
          drawData(posX, posY, high);
        }
        break;
      case SENSORS.HUMI:
        if (showSensors.includes(type)) {
          posX = PAGE_LEFT_POS(); // 重新回到最左边绘制
          posY += ROW_DELTA;
          pdf.fontSize(FONT_SIZE_SMALL).text(text('PDF_HUMI_LOW', LANGUAGE), posX, posY);
          drawData(posX, posY, low);

          posX = PAGE_LEFT_POS(); // 重新回到最左边绘制
          posY += ROW_DELTA;
          pdf.fontSize(FONT_SIZE_SMALL).text(text('PDF_HUMI_HIGH', LANGUAGE), posX, posY);
          drawData(posX, posY, high);
        }
        break;
      case SENSORS.SUB_TEMP:
        if (sensorCnt === 3 || showSensors.includes(type)) {
          posX = PAGE_LEFT_POS(); // 重新回到最左边绘制
          posY += ROW_DELTA;
          pdf.fontSize(FONT_SIZE_SMALL).text(text('PDF_TEMP2_LOW', LANGUAGE), posX, posY);
          drawData(posX, posY, low);

          posX = PAGE_LEFT_POS(); // 重新回到最左边绘制
          posY += ROW_DELTA;
          pdf.fontSize(FONT_SIZE_SMALL).text(text('PDF_TEMP2_HIGH', LANGUAGE), posX, posY);
          drawData(posX, posY, high);
        }
        break;
      default:
      // do nothing
    }
  });
  // 画线
  posX = PAGE_LEFT_POS();
  posY += FIRST_ROW_DELTA;
  drawLine(pdf, [posX, posY], [PAGE_RIGHT_POS(), posY]);
};

/**
 //* 画chart
 * @param {*} pdf 
 * @param {*} param1 
 */
const printChart = (pdf, { sensorInfo, pdfInfo, deviceInfo, globalInfo }) => {
  const { LANGUAGE = 'en', UNIT } = globalInfo || {};
  const {
    pdfLogoColor,
    chartParams: { draw2ndSensor, chartWidth },
  } = pdfInfo || {};
  const { sensorCnt } = sensorInfo || {};

  let posX = PAGE_LEFT_POS();
  let posY = PADDING_TOP_CHART();
  pdf
    .fontSize(FONT_SIZE_TITLE)
    .fillColor(pdfLogoColor)
    .text(text('PDF_RECORD_CHART', LANGUAGE), posX, posY);

  // 确定一下图表起始位置
  posY += 25;
  const chartStartY = posY;
  const chartStartX = PAGE_LEFT_POS() + PADDING_LEFT_CHART_FROM_LEFT_POS();

  //* 绘制Y轴的横线与Y坐标轴线的label分布
  printChartYLineAndLabel(pdf, {
    pdfInfo,
    startX: chartStartX,
    startY: chartStartY,
  });

  //* 绘制阈值线
  printChartThreshLine(pdf, {
    pdfInfo,
    startX: chartStartX,
    startY: chartStartY,
    sensorInfo,
  });

  //* 绘制X轴的竖线与X坐标轴线的label分布
  const yAxisHeight = printChartXLineAndLabel(pdf, {
    globalInfo,
    pdfInfo,
    deviceInfo,
    startX: chartStartX,
    startY: chartStartY,
  });
  sensorInfo.yAxisHeight = yAxisHeight;
  //* 画Y轴label :Temperature( ℃)
  posY += 174;
  pdf
    .fontSize(FONT_SIZE_LARGE)
    .fillColor(DEFAULT_FONT_COLOR)
    .rotate(-90, { origin: [posX, posY] })
    .text(
      `${text('PDF_TEMP_Y_LABEL', LANGUAGE)}( ${SIGN.UNIT(SENSORS.TEMP, LANGUAGE, {
        unit: UNIT,
      })})`,
      posX,
      posY
    );
  // 旋转后，再转回来，已防止后面的内容也被旋转了
  pdf.rotate(90, { origin: [posX, posY] });
  //* 画Y轴2 label :Humidity('%RH')
  if (draw2ndSensor) {
    posX = PAGE_RIGHT_POS() - 18;
    pdf
      .fontSize(FONT_SIZE_LARGE)
      .fillColor(DEFAULT_FONT_COLOR)
      .rotate(-90, { origin: [posX, posY] })
      .text(
        `${text('PDF_HUMI_Y_LABEL', LANGUAGE)}( %${SIGN.UNIT(SENSORS.HUMI, LANGUAGE)})`,
        posX,
        posY
      );
    // 旋转后，再转回来，已防止后面的内容也被旋转了
    pdf.rotate(90, { origin: [posX, posY] });
  }

  //* 画X轴label ： Time
  posX = PDF_A4_WIDTH / 2 - 17;
  posY = chartStartY + CHART_INNER_HEIG() + 30; // 表格起始Y位置+chart高度，然后往下一些
  pdf
    .fontSize(FONT_SIZE_LARGE)
    .fillColor(DEFAULT_FONT_COLOR)
    .text(text('PDF_TIME', LANGUAGE), posX, posY, { lineBreak: false });

  //* 画右下角阈值示例
  const timeStartX = posX;
  const legendStartY = posY - (sensorCnt < 3 ? 2 : 5);
  printThresholdLegend(pdf, {
    startX: PAGE_LEFT_POS() + PADDING_LEFT_CHART_FROM_LEFT_POS() + (chartWidth * 94) / 120,
    startY: legendStartY,
    sensorInfo,
    pdfInfo,
    globalInfo,
  });

  //* 图表下面的sign，我们仅仅绘制每行一列，而且宽度，控制到X轴label的距离
  drawAlertSign(pdf, {
    startY: legendStartY,
    width: timeStartX - PAGE_LEFT_POS() - 10,
    height: PDF_A4_HEIGHT - PADDING_BOTTOM_FOOT() - legendStartY,
    colCnt: 1,
    sensorInfo,
  });

  //* 绘制sensor数据
  printDataLine(pdf, {
    pdfInfo,
    sensorInfo,
    startX: chartStartX,
    startY: chartStartY,
    globalInfo,
  });
};

/**
 //* 绘制右下角阈值示例
 * @param {pdfKit} pdf 
 * @param {object} startX,startY 起始坐标 
 */
const printThresholdLegend = (pdf, { startX, startY, sensorInfo, pdfInfo, globalInfo }) => {
  const { LANGUAGE = 'en' } = globalInfo || {};
  const { sensors, markList = [] } = sensorInfo || {};
  const {
    TEMP_DATA_LINE_COLOR,
    TEMP_THRESH_LINE_COLOR,
    SUB_TEMP_DATA_LINE_COLOR,
    SUB_TEMP_THRESH_LINE_COLOR,
    HUMI_DATA_LINE_COLOR,
    HUMI_THRESH_LINE_COLOR,
    LINE_COLORS,
    THRESH_LINE_COLORS,
    MARK_DATA_LINE_COLOR,
  } = CHART_COLORS;

  const legendLineWidth = 35;
  const deltaX = 5; // line与文字间的距离
  const deltaY = 8;
  let posY = startY;
  const lineEndX = startX + legendLineWidth;
  const textPosX = lineEndX + deltaX;
  const textDeltaY = 2.5; // 往上移动一段距离，保持中间对准line
  const bothTemp = sensors.includes(SENSORS.TEMP) && sensors.includes(SENSORS.SUB_TEMP);
  sensors.forEach((type, index) => {
    const lineColor = LINE_COLORS[index];
    const threshLegendLineColor = THRESH_LINE_COLORS[index];
    pdf.undash();
    switch (type) {
      case SENSORS.TEMP:
        drawLine(pdf, [startX, posY], [lineEndX, posY], {
          color: lineColor,
        });
        pdf
          .fontSize(FONT_SIZE_SMALLER)
          .fillColor(DEFAULT_FONT_COLOR)
          .text(
            text(bothTemp ? 'PDF_TEMP1_LEGEND' : 'PDF_TEMP_LEGEND', LANGUAGE),
            textPosX,
            posY - textDeltaY,
            {
              lineBreak: false,
            }
          );

        posY += deltaY;
        drawLine(pdf, [startX, posY], [lineEndX, posY], {
          color: threshLegendLineColor,
          dash: DASH.CHART,
        });
        pdf
          .fontSize(FONT_SIZE_SMALLER)
          .fillColor(DEFAULT_FONT_COLOR)
          .text(
            text(bothTemp ? 'PDF_TEMP1_THRESH_LEGEND' : 'PDF_TEMP_THRESH_LEGEND', LANGUAGE),
            textPosX,
            posY - textDeltaY,
            {
              lineBreak: false,
            }
          );
        posY += deltaY;
        break;
      case SENSORS.SUB_TEMP:
        drawLine(pdf, [startX, posY], [lineEndX, posY], {
          color: lineColor,
        });
        pdf
          .fontSize(FONT_SIZE_SMALLER)
          .fillColor(DEFAULT_FONT_COLOR)
          .text(text('PDF_TEMP2_LEGEND', LANGUAGE), textPosX, posY - textDeltaY, {
            lineBreak: false,
          });

        posY += deltaY;
        drawLine(pdf, [startX, posY], [lineEndX, posY], {
          color: threshLegendLineColor,
          dash: DASH.CHART,
        });
        pdf
          .fontSize(FONT_SIZE_SMALLER)
          .fillColor(DEFAULT_FONT_COLOR)
          .text(text('PDF_TEMP2_THRESH_LEGEND', LANGUAGE), textPosX, posY - textDeltaY, {
            lineBreak: false,
          });
        posY += deltaY;
        break;
      case SENSORS.HUMI:
        drawLine(pdf, [startX, posY], [lineEndX, posY], {
          color: lineColor,
        });
        pdf
          .fontSize(FONT_SIZE_SMALLER)
          .fillColor(DEFAULT_FONT_COLOR)
          .text(text('PDF_HUMI_LEGEND', LANGUAGE), textPosX, posY - textDeltaY, {
            lineBreak: false,
          });

        posY += deltaY;
        drawLine(pdf, [startX, posY], [lineEndX, posY], {
          color: threshLegendLineColor,
          dash: DASH.CHART,
        });
        pdf
          .fontSize(FONT_SIZE_SMALLER)
          .fillColor(DEFAULT_FONT_COLOR)
          .text(text('PDF_HUMI_THRESH_LEGEND', LANGUAGE), textPosX, posY - textDeltaY, {
            lineBreak: false,
          });
        break;
      default:
    }
  });
  if (markList.length > 0) {
    pdf.undash();
    posY += deltaY;
    drawLine(pdf, [startX, posY], [lineEndX, posY], {
      color: MARK_DATA_LINE_COLOR,
    });
    pdf
      .fontSize(FONT_SIZE_SMALLER)
      .fillColor(DEFAULT_FONT_COLOR)
      .text('Mark', textPosX, posY - textDeltaY, {
        lineBreak: false,
      });
  }
};

/**
 //* 绘制Y轴的横线与Y坐标轴线的label分布 
 * @param {*} pdf 
 * @param {*} param1 
 */
const printChartYLineAndLabel = (pdf, { pdfInfo, startX, startY }) => {
  const {
    chartParams: {
      chartWidth,
      draw2ndSensor,
      fullDraw2ndSensor,
      heightDeltaPerYPart,
      Y1stValues,
      Y2ndValues,
      withFixed = true,
    },
  } = pdfInfo || {};
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
  Y1stValues.forEach((value, index) => {
    posY = startY + index * heightDeltaPerYPart;

    const label = withFixed ? value.toFixed(1) : value;
    labelDeltaX = labelDeltaWithYLine + stepLength(label, { fontSize: FONT_SIZE_SMALL });
    // 首先Y轴的label 都是 右侧对齐的
    pdf.text(label, posX - labelDeltaX, posY - labelDeltaY);
    // 首尾横线都是直线，没有dash
    if (index === 0) {
      drawLine(pdf, [posX, posY], [endX, posY], {
        color: CHART_COLORS.CHAT_LINE_COLOR,
        undash: true,
      });
    }
    // 除了绘制label对应的虚线，还有两个label之间还有一条虚线
    else {
      // 绘制两label之间的虚线
      // drawLine(pdf, [posX, posY - heightDeltaPerLine], [endX, posY - heightDeltaPerLine], {
      //   // dash: DASH.CHART,
      //   color: CHART_COLORS.XY_LINE_COLOR,
      // });
      drawLine(pdf, [posX, posY], [endX, posY], {
        color: CHART_COLORS.CHAT_LINE_COLOR,
        undash: true,
      });
      // 首尾横线都是直线，没有dash
      // if (index === Y1stValues.length - 1) {
      //   drawLine(pdf, [posX, posY], [endX, posY], {
      //     color: DEFAULT_FONT_COLOR,
      //     undash: true,
      //   });
      // } else {
      //   // 绘制label对应的虚线
      //   drawLine(pdf, [posX, posY], [endX, posY], {
      //     // dash: DASH.CHART,
      //     color: CHART_COLORS.XY_LINE_COLOR,
      //   });
      // }
    }
  });

  if (draw2ndSensor) {
    if (!fullDraw2ndSensor) {
      Y2ndValues.forEach((value, index) => {
        // 湿度最上面第一个label不绘制
        posY = startY + (index + 1) * heightDeltaPerYPart;
        pdf.text(value, endX + 2, posY - labelDeltaY, { lineBreak: false });
      });
    } else {
      Y2ndValues.forEach((value, index) => {
        // 湿度最上面第一个label不绘制
        posY = startY + index * heightDeltaPerYPart;
        pdf.text(value, endX + 2, posY - labelDeltaY, { lineBreak: false });
      });
    }
  }
};

/**
 //* 绘制阈值线 
 * @param {*} pdf 
 * @param {*} param1 
 */
const printChartThreshLine = (
  pdf,
  { pdfInfo, startX: chartStartX, startY: chartStartY, sensorInfo }
) => {
  const { THRESH_LINE_COLORS } = CHART_COLORS;
  const { thresholds } = sensorInfo || {};
  const {
    chartParams: {
      chartWidth,

      topPosLeftYValue, // 左侧Y轴：最高Y位置点映射的温度值（不一定是温度的最高值，需要综合阈值以及布局分布需要确定的值）
      heightLeftYPerValue, // 左侧Y轴：单位sensor值对应的高度

      topPosRightYValue, // 右侧Y轴：最高Y位置点映射的温度值（不一定是温度的最高值，需要综合阈值以及布局分布需要确定的值）
      heightRightYPerValue, // 右侧Y轴：单位sensor值对应的高度
      startYRightDelta,
    },
  } = pdfInfo || {};

  const chartEndX = chartStartX + chartWidth;
  let minPosY = chartStartY;
  let maxPosY = chartStartY;

  // TODO 待优化，重复代码
  Object.keys(thresholds).forEach((type, index) => {
    const { min = 0, max = 0 } = thresholds[type] || {};
    const shoulDrawLine = _util.isThresholdValid(min, max);
    const threshLineColor = THRESH_LINE_COLORS[index];
    // note：temp、subTemp绘制 以 左侧Y轴 布局为准 、 humi 而是以 右侧Y轴 布局为准
    switch (type) {
      case SENSORS.TEMP:
      case SENSORS.SUB_TEMP:
        if (shoulDrawLine) {
          minPosY = getPos(chartStartY, heightLeftYPerValue, topPosLeftYValue, min);
          maxPosY = getPos(chartStartY, heightLeftYPerValue, topPosLeftYValue, max);

          drawLine(pdf, [chartStartX, minPosY], [chartEndX, minPosY], {
            color: threshLineColor,
            dash: DASH.CHART,
          });
          drawLine(pdf, [chartStartX, maxPosY], [chartEndX, maxPosY], {
            color: threshLineColor,
            dash: DASH.CHART,
          });
        }
        break;
      case SENSORS.HUMI:
        if (shoulDrawLine) {
          minPosY = getPos(
            chartStartY + startYRightDelta,
            heightRightYPerValue,
            topPosRightYValue,
            min
          );
          maxPosY = getPos(
            chartStartY + startYRightDelta,
            heightRightYPerValue,
            topPosRightYValue,
            max
          );
          drawLine(pdf, [chartStartX, minPosY], [chartEndX, minPosY], {
            color: threshLineColor,
            dash: DASH.CHART,
          });
          drawLine(pdf, [chartStartX, maxPosY], [chartEndX, maxPosY], {
            color: threshLineColor,
            dash: DASH.CHART,
          });
        }
        break;
      default:
      // do nothing
    }
  });
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
  // 记录 y轴高度
  let yAxisHeight = [];
  pdf.fontSize(FONT_SIZE_SMALLER).fillColor(DEFAULT_FONT_COLOR);
  // 从左往右,从上往下 绘制竖线
  for (let index = 0; index < X_LINE_CNT; index++) {
    const value = XValues[index] || null;
    posX = startX + index * widthDeltaPerXPart;

    // 首尾横线都是直线，没有dash
    if (index === 0 || index === X_LINE_CNT - 1) {
      drawLine(pdf, [posX, posY], [posX, endY], {
        color: CHART_COLORS.CHAT_LINE_COLOR,
        undash: true,
      });
      yAxisHeight = [
        [posX, posY],
        [posX, endY],
      ];
    }
    // 除了绘制label对应的虚线
    else {
      // 绘制label对应的虚线
      drawLine(pdf, [posX, posY], [posX, endY], {
        // dash: DASH.CHART,
        color: CHART_COLORS.CHAT_LINE_COLOR,
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
  return yAxisHeight;
};

/**
 //* 绘制数据折线 
 * @param {*} pdf 
 * @param {*} param1 
 */
const printDataLine = (pdf, { pdfInfo, sensorInfo, startX, startY, globalInfo }) => {
  const { LINE_COLORS, MARK_DATA_LINE_COLOR } = CHART_COLORS;
  const { UNIT } = globalInfo;
  const {
    chartParams: {
      popConfig,
      topPosLeftYValue,
      heightLeftYPerValue,
      topPosRightYValue,
      heightRightYPerValue,
      widthXPerValue,
      startYRightDelta,
      XIndexs,
      widthDeltaPerXPart,
    },
  } = pdfInfo || {};
  const { sensors, datas, thresholds, yAxisHeight = [], markList = [] } = sensorInfo || {};

  let posX = undefined;
  let posY = undefined;

  const isAlert = (val, min, max) => {
    return val < min || val > max;
  };
  // 记录曲线 x轴 绘制长度
  let xAxisLength = 0;
  // 防止之前有绘制dash的
  pdf.undash();
  sensors.forEach((type, index) => {
    const { min, max } = thresholds[type];
    const { needPop = false } = popConfig[type];
    posX = undefined;
    posY = undefined;
    const sensorDatas = datas[type] || [];
    let valAfterPop = null;
    let counter = 0; // 计数器
    const strokeColor = LINE_COLORS[index];
    let chartStartPosX = startX;
    const startIndexPosX = 0;
    let chartStartPosY = startY;
    // 更小范围取值，每格之间
    let lengthPerValueX = widthXPerValue;
    // let lengthPerValueX = widthDeltaPerXPart / (sensorDatas.length / (XIndexs.length - 1));
    let lengthPerValueY = heightLeftYPerValue;
    let topPosYValue = topPosLeftYValue;
    switch (type) {
      case SENSORS.TEMP:
      case SENSORS.SUB_TEMP:
        chartStartPosX = startX;
        chartStartPosY = startY;
        lengthPerValueX = widthXPerValue;
        lengthPerValueY = heightLeftYPerValue;
        topPosYValue = topPosLeftYValue;
        break;
      case SENSORS.HUMI:
        chartStartPosX = startX;
        chartStartPosY = startY + startYRightDelta;
        lengthPerValueX = widthXPerValue;
        lengthPerValueY = heightRightYPerValue;
        topPosYValue = topPosRightYValue;
        break;
      default:
      // do nothing
    }

    pdf.strokeColor(strokeColor);
    /**
     * TODO
     * 如果直接通过posX = getPos(chartStartPosX, lengthPerValueX, index, 0);
     * 绘制的X步长会有精度损失，毕竟lengthPerValueX不是整除，然后再做乘法，精度损失必不可少
     * 然而为了美观，XLine必须均分X轴的宽度绘制，这就导致本来XIndexs中的数据本来是应该落到XLine线上的
     * 由于计算精度的损失，肯定不能正好落到XLine线上，这就需要动态调整一下
     ** 当绘制到XIndexs中的index时，强制改变move的落点，就是落到轴线上，然后以该XLine为startPosX绘制
     */
    for (let index = 0; index < sensorDatas.length; index++) {
      const data = sensorDatas[index];
      const { val } = data;
      if (_util.isValidSensor(val)) {
        valAfterPop = needTransSensorValue(type, UNIT) ? transFahr(val) : val;
        // 先移动到前一个点
        if (posX && posY) {
          pdf.moveTo(posX, posY);

          // 这里判断，并改写valAfterPop与timestampAfterPop即可实现跳点(滤点)
          // 公共配置
          if (NEED_POP && needPop) {
            if (isAlert(valAfterPop, min, max)) {
              counter = 0;
            } else {
              counter++;
              if (counter % (POP_INTERVAL + 1) === 0) {
                //该点便被跳过
                // 最后一个点，保留不作跳过处理
                if (index !== sensorDatas.length - 1) {
                  // TODO 对比前后两个值相差是否悬殊，如果悬殊不大（整体量级上），可替代，如果悬殊过大，不可跳过，会明显改变波形
                  // 可能对比值不明显，对比两个点的deltaY所占的最高温度点与最低温度点之间的Y高度所占的比例更为标准通用，毕竟坐标点之间的距离是公共直观可见的度量标准
                  // const nextData = sensorDatas[index + 1];
                  valAfterPop = needTransSensorValue(type, UNIT)
                    ? transFahr(sensorDatas[index + 1].val)
                    : sensorDatas[index + 1].val;
                  index++; // 该点被跳过
                }
              }
            }
          }
          // const xIndexsPos = XIndexs.indexOf(index);
          // if (xIndexsPos !== -1) {
          //   chartStartPosX = startX + xIndexsPos * widthDeltaPerXPart;
          //   startIndexPosX = index;
          // }
          // 按照第几个值来算x轴距离
          posX = getPos(chartStartPosX, lengthPerValueX, index, 0);
          posY = getPos(chartStartPosY, lengthPerValueY, topPosYValue, valAfterPop);
          xAxisLength = posX;
          if (posX && posY) pdf.lineTo(posX, posY).stroke();
        } else {
          // 仅仅记录异常值变为正常值时的posX，posY，
          // 下一次如果val是valid的，那么上面就直接moveTo到此次记录的posX，posY
          const startPosIndex = 0;
          const startPosX = chartStartPosX;
          // for (let i = 0; i < XIndexs.length - 1; i++) {
          //   const xIndex = XIndexs[i];
          //   if (xIndex <= index && index < XIndexs[i + 1]) {
          //     startPosX = startX + i * widthDeltaPerXPart + (index - xIndex) * lengthPerValueX;
          //     startPosIndex = index;
          //     break;
          //   }
          // }

          posX = getPos(startPosX, lengthPerValueX, index, startPosIndex);
          posY = getPos(chartStartPosY, lengthPerValueY, topPosYValue, valAfterPop);
          xAxisLength = posX;
        }
      } else {
        posX = undefined;
        posY = undefined;
      }
    }
  });

  // 绘制Make线
  /**
   * 需要参数： x 与 y 轴 原点坐标  、 y轴高度  、绘制的 x轴长度
   * x轴长度 转换为 时间长度     算出每一秒的x轴长度
   *  Mark点 的坐标  =  Mark的时间长度 减去 开始时间   *  每一秒的 x轴时间刻度
   */
  const accuracy = 100000000;
  if (markList.length > 0) {
    const sensorDatas = datas['temp'];
    const timeOn = sensorDatas[0].timestamp;
    const timeOff = sensorDatas[sensorDatas.length - 1].timestamp;
    const timeDifference = (timeOff - timeOn) * accuracy;
    const xScale = (((xAxisLength - startX) * accuracy) / timeDifference) * accuracy;
    let markTextX = startX + 40;
    const markTextY = yAxisHeight[0][1] - 12;
    markList.forEach((item, index) => {
      pdf.undash();
      let itemX = ((item.timestamp - timeOn) * xScale) / accuracy + startX;
      // 防止最后x轴长度 偏移
      if (itemX > xAxisLength) {
        itemX = xAxisLength;
      }
      // 预防首位
      if (!itemX) {
        itemX = startX;
      }
      drawLine(pdf, [itemX, yAxisHeight[0][1]], [itemX, yAxisHeight[1][1]], {
        color: MARK_DATA_LINE_COLOR,
      });
      pdf.undash();
      // 绘制头部引线
      drawLine(pdf, [markTextX, markTextY], [itemX, yAxisHeight[0][1]], {
        color: MARK_DATA_LINE_COLOR,
      });
      // 绘制数字
      pdf
        .fillColor(MARK_DATA_LINE_COLOR)
        .fontSize(10)
        .text(index + 1, markTextX, markTextY - 13);
      markTextX += 30;
    });
  }
};

/**
 //* 绘制data Table 数据表格
 * @param {*} pdf 
 * @param {*} param1 
 *      pageStartIndex : 绘制foot使用，每一页都需要绘制foot，默认起始是第2页
 */
const printDataTable = (
  pdf,
  {
    sensorInfo,
    pdfInfo,
    deviceInfo,
    pageStartIndex = 2,
    footPrint = printFoot,
    globalInfo,
    dataTableConfigs,
  }
) => {
  const {
    dataTableParams: {
      totalPages, // table页多少页
      widthTable, // 表格的宽度
      pageLeftPos, // 表格左侧离页面左侧的距离
    },
  } = pdfInfo || {};
  const {
    oneDatePerMonth = false,
    markAlert = false,
    showTableHead = true,
  } = dataTableConfigs || {};

  const posX = pageLeftPos;
  const posY = PADDING_TOP_DATA_TABLE();
  for (let i = 0; i < totalPages; i++) {
    // 新增一页
    pdf.addPage();
    if (showTableHead) {
      //绘制from 、to、 file created
      printTableHead(pdf, {
        pdfInfo,
        sensorInfo,
        deviceInfo,
        pageIndex: i,
        globalInfo,
      });
    }
    //绘制最外围边框
    pdf.strokeColor(DEFAULT_FONT_COLOR).rect(posX, posY, widthTable, DATA_TABLE_HEIGHT()).stroke();
    //绘制表头
    printTableTitle(pdf, { pdfInfo });
    //绘制数据
    printTableData(pdf, {
      pdfInfo,
      sensorInfo,
      deviceInfo,
      pageIndex: i,
      globalInfo,
      oneDatePerMonth,
      markAlert,
    });
    // 每页绘制foot
    footPrint(pdf, {
      pdfInfo,
      pageIndex: pageStartIndex + i,
      ...deviceInfo,
      globalInfo,
    });
  }
};

/**
//* 绘制table最上方的 from、to、filecreated
 * @param {*} pdf 
 * @param {*} param1 
 */
const printTableHead = (pdf, { pdfInfo, sensorInfo, deviceInfo, pageIndex = 0, globalInfo }) => {
  const { DATE_FORMAT = 'YY-MM-DD HH:mm:ss', LANGUAGE = 'en' } = globalInfo || {};
  const {
    dataTableParams: { onePageDataContains },
  } = pdfInfo || {};
  const { fileCreatedTime, timeZone } = deviceInfo || {};
  const { sensors = [], datas } = sensorInfo || {};

  const sensorDatas = datas[sensors[0]];
  const { timestamp: fromTime } = sensorDatas[pageIndex * onePageDataContains];
  const { timestamp: toTime } =
    sensorDatas[
      (pageIndex + 1) * onePageDataContains > sensorDatas.length
        ? sensorDatas.length - 1
        : (pageIndex + 1) * onePageDataContains - 1
    ];
  const posY = 5;
  // pdf.fontSize(FONT_SIZE_SMALL).text(
  //   `${text('PDF_FROM', LANGUAGE)} ${_common.formatDate(fromTime, timeZone, DATE_FORMAT)}   ${text(
  //     'PDF_TO',
  //     LANGUAGE
  //   )} ${_common.formatDate(toTime, timeZone, DATE_FORMAT)}`,
  //   // sensors.length < 3 ? PAGE_LEFT_POS() : 2,
  //   PAGE_LEFT_POS(),
  //   posY
  // );

  // pdf.text(`${text('PDF_FILE_CREATED', LANGUAGE)}${fileCreatedTime}`, 0, posY, {
  //   lineBreak: false,
  //   // width: sensors.length < 3 ? PAGE_RIGHT_POS() : PDF_A4_WIDTH - 2,
  //   width: PAGE_RIGHT_POS(),
  //   align: 'right',
  // });
};

/**
//*  绘制数据表格的表头信息
 * @param {*} pdf 
 * @param {*} param1 
 */
const printTableTitle = (pdf, { pdfInfo }) => {
  const {
    dataTableParams: {
      pageLeftPos, // 表格左侧离页面左侧的距离
      pageRightPos, // 表格右侧离页面右侧的距离
      tableParts, // 多少列
      tableTitleArr,
      everyDataWidths,
    },
  } = pdfInfo || {};

  const startY = PADDING_TOP_DATA_TABLE();
  let posX = pageLeftPos;
  let posY = startY;
  const deltaY = TABLE_TITLE_HEIGHT() / 3;
  pdf.fontSize(FONT_SIZE_SMALLER).fillColor(DEFAULT_FONT_COLOR);

  pdf.undash();
  // 不同的sensor集合，展示不同的表头
  for (let i = 0; i < tableParts; i++) {
    // eslint-disable-next-line
    tableTitleArr.forEach((colTitle, index) => {
      const curWidth = everyDataWidths[index];

      pdf.text(colTitle, posX, posY + deltaY, {
        width: curWidth,
        align: 'center',
        lineBreak: false,
      });
      posX += curWidth;
    });
    // 顺带绘制每列右侧的竖线,最结尾的竖线不必要绘制
    if (i !== tableParts - 1) {
      drawLine(pdf, [posX, startY], [posX, startY + DATA_TABLE_HEIGHT()], {
        lineWidth: 1,
      });
    }
  }
  posY += TABLE_TITLE_HEIGHT();
  // 绘制title下面的一条横线
  drawLine(pdf, [pageLeftPos, posY], [pageRightPos, posY], { lineWidth: 1 });
};

/**
//* 绘制数据表格中的数据
 * @param {*} pdf 
 * @param {*} param1 
 */
const printTableData = (
  pdf,
  {
    pdfInfo,
    sensorInfo,
    deviceInfo,
    pageIndex = 0,
    globalInfo,
    oneDatePerMonth = false,
    markAlert = false,
  }
) => {
  const { DATE_FORMAT = 'DD-MM-YY HH:mm:ss', UNIT } = globalInfo || {};
  const {
    dataTableParams: {
      pageLeftPos, // 表格左侧离页面左侧的距离
      everyDataWidths,
      onePageDataContains,
      oneColDataContains,
      oneColWidth,
    },
  } = pdfInfo || {};
  const { sensors = [], thresholds, datas } = sensorInfo || {};
  const { timeZone } = deviceInfo || {};

  const startX = pageLeftPos;
  // +1稍微离title 一点距离
  const startY = PADDING_TOP_DATA_TABLE() + TABLE_TITLE_HEIGHT() + 2;
  let posX = startX;
  let posY = startY;

  // 根据绘制的第几页，确定一页所需的数据
  const curPageStartIndex = pageIndex * onePageDataContains;
  const curPageEndIndex = (pageIndex + 1) * onePageDataContains;
  const onPageDatas = sensors.reduce((pre, type) => {
    return {
      ...pre,
      [type]: datas[type].slice(curPageStartIndex, curPageEndIndex),
    };
  }, {});

  // 记录绘制到第几列了
  let colPrint = 0;
  let colStartX = startX;
  // 根据oneDatePerMonth 需要确定每页前一个数据的日期与本页第一个比较是否有改变日期
  const prePageEndIndex = pageIndex === 0 ? 0 : curPageStartIndex - 1;

  const getDateValue = timestamp =>
    _common.formatDate(timestamp, timeZone, DATE_FORMAT.split(' ')[0] || 'YY-MM-DD');

  const isDayChanged = (preTimestamp, curTimestamp) =>
    getDateValue(preTimestamp) !== getDateValue(curTimestamp);
  for (let index = 0; index < onPageDatas[Object.keys(onPageDatas)[0]].length; index++) {
    // 根据sensors拿每个数据
    const [type] = sensors; // 取第一个type，拿到时间数据
    const { timestamp } = onPageDatas[type][index];
    let dateValue = '';

    if (oneDatePerMonth) {
      if (index !== 0) {
        // 判断与前一个时间戳是否有改变日子
        if (isDayChanged(onPageDatas[type][index - 1].timestamp, timestamp)) {
          dateValue = getDateValue(timestamp);
        }
      } else {
        // 不是第一页的第一个，则需要与前一页最后一个时间戳比较
        if (pageIndex !== 0) {
          if (isDayChanged(datas[type][prePageEndIndex].timestamp, timestamp)) {
            dateValue = getDateValue(timestamp);
          }
        } else {
          // 第一页的第一个直接保留
          dateValue = getDateValue(timestamp);
        }
      }
    } else {
      dateValue = getDateValue(timestamp);
    }
    const datasRefined = sensors.reduce(
      (pre, type) => {
        const { min = 0, max = 0 } = thresholds[type];
        // 万一出现 几个sensor，但是各个sensor数据量不同，会导致报错
        const { val = NOVALUE } = onPageDatas[type].length > index ? onPageDatas[type][index] : {};
        let refinedVal = { isAlert: false };
        if (_util.isValidSensor(val)) {
          refinedVal = {
            value: _util.formatSensorValue(type, { unit: UNIT })(val, 1),
            isAlert: false,
          };
          if (_util.isThresholdValid(min, max) && (val < min || val > max)) {
            refinedVal.isAlert = true;
          }
        } else {
          refinedVal.value = NOVALUE;
        }
        return [...pre, refinedVal];
      },
      [
        { value: dateValue },
        {
          value: _common.formatDate(timestamp, timeZone, DATE_FORMAT.split(' ')[1] || 'HH:mm:ss'),
        },
      ]
    );
    // eslint-disable-next-line
    everyDataWidths.forEach((width, partIndex) => {
      pdf
        .fillColor(markAlert && datasRefined[partIndex].isAlert ? ALARM_COLOR : DEFAULT_FONT_COLOR)
        .text(datasRefined[partIndex].value, posX, posY, {
          height: TABLE_EACH_LINE_HEIGHT(),
          width,
          align: 'center',
          lineBreak: false,
        });
      posX += width;
    });
    // 绘制完一行，重新定位到下一行
    posX = colStartX;
    posY += TABLE_EACH_LINE_HEIGHT();

    // 每列绘制oneColDataContains
    if ((index + 1) % oneColDataContains === 0) {
      colPrint += 1;
      //一列绘制完毕，重新换一列从头开始绘制
      colStartX = startX + colPrint * oneColWidth;
      posX = colStartX;
      posY = startY;
    }
  }
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
  const deltaX = footPageNumberDeltaX(pageIndex, totalPage);
  // 页码放中间
  // posX = PDF_A4_WIDTH / 2 - 5 - deltaX;
  posX = PAGE_RIGHT_POS() - 16;
  posY = posY + 5;
  pdf
    .fillColor(DEFAULT_FONT_COLOR)
    .fontSize(FONT_SIZE_SMALL)
    .text(`${pageIndex}/${totalPage}`, posX, posY, { lineBreak: false });

  // 网站页脚
  posX = PAGE_LEFT_POS();
  pdf.text('wwww.friggatech.com', posX, posY, {
    lineBreak: false,
  });
  // device id 放右下角
  // posX = PAGE_RIGHT_POS() - 70;
  // pdf.text(`${text("PDF_DEVICEID", LANGUAGE)}${terNo}`, posX, posY, {
  //   lineBreak: false,
  // });
};

/**
 //* 绘制签名页 
 */
const printEndorsement = (pdf, { endorsementInfo, footPrint, pdfInfo, globalInfo, deviceInfo }) => {
  const {
    endorsementParams: {
      onePageEstContains,
      totalPagesEstNeed,
      pageEstLeftPos,
      shouldDrawEst = false,
    },
    dataTableParams: { totalPages = 1, basePages = 1 },
  } = pdfInfo;
  if (!shouldDrawEst) {
    return;
  }
  const { endorsements = [] } = endorsementInfo || {};
  if (totalPagesEstNeed > 0) {
    const pageStartIndex = totalPages + basePages; // 签注起始页码
    // 有数据才绘制
    const posX = pageEstLeftPos;
    const posY = PADDING_TOP_ENDORSEMENT();
    let curPageEstContains = 0; // 当前页需要绘制多少签注
    const estCnt = endorsements.length; // 总共多少签注
    for (let index = 0; index < totalPagesEstNeed; index++) {
      // 当前页需要绘制多少签注
      const left = estCnt - onePageEstContains * index;
      curPageEstContains =
        left > 0 ? (left > onePageEstContains ? onePageEstContains : left) : index === 0 ? left : 0;
      // 新增一页
      pdf.addPage();
      // 每页先绘制框架
      const heightEst =
        ENDORSEMENT_TITLE_HEIGHT() + curPageEstContains * ENDORSEMENT_EACH_LINE_HEIGHT();
      printEstOutLine(pdf, {
        startX: posX,
        startY: posY,
        pdfInfo,
        heightEst,
      });
      // 绘制签注数据
      printEsts(pdf, {
        endorsements,
        curPageEstContains,
        pdfInfo,
        globalInfo,
        pageIndex: index,
        deviceInfo,
      });
      // 每页绘制foot
      footPrint(pdf, {
        pdfInfo,
        pageIndex: pageStartIndex + index + 1,
        ...deviceInfo,
        globalInfo,
      });
    }
  }
};

const printEstOutLine = (pdf, { startX, startY, heightEst, pdfInfo }) => {
  const {
    endorsementParams: { widthEst, everyEstWidths, estTitleArr, pageEstLeftPos, pageEstRightPos },
  } = pdfInfo || {};
  let posX = startX;
  let posY = startY;
  //绘制最外围边框
  pdf.strokeColor(DEFAULT_FONT_COLOR).rect(startX, startY, widthEst, heightEst).stroke();
  // 绘制表头
  pdf.fontSize(FONT_SIZE_SMALL).fillColor(DEFAULT_FONT_COLOR);
  pdf.undash();
  const deltaY = 4;
  // 4列  序号 | 内容 | 签名人 | 签名时间
  estTitleArr.forEach((title, index) => {
    const width = everyEstWidths[index];
    pdf.text(title, posX, posY + deltaY, {
      width,
      align: 'center',
      lineBreak: false,
    });
    posX += width;

    // 顺带绘制每列右侧的竖线,最结尾的竖线不必要绘制
    if (index !== estTitleArr.length - 1) {
      drawLine(pdf, [posX, startY], [posX, startY + heightEst], {
        lineWidth: 1,
      });
    }
  });

  // 绘制title下面的一条横线
  posY += TABLE_TITLE_HEIGHT();
  drawLine(pdf, [pageEstLeftPos, posY], [pageEstRightPos, posY], {
    lineWidth: 1,
  });
};

const printEsts = (pdf, { endorsements, pageIndex, pdfInfo, globalInfo, deviceInfo }) => {
  const { DATE_FORMAT = 'YY-MM-DD HH:mm:ss' } = globalInfo || {};
  const {
    endorsementParams: { onePageEstContains, everyEstWidths, estTitleArr, pageEstLeftPos },
  } = pdfInfo || {};
  const { timeZone } = deviceInfo || {};
  const startX = pageEstLeftPos;
  const startY = PADDING_TOP_ENDORSEMENT() + ENDORSEMENT_TITLE_HEIGHT();
  let posX = startX;
  let posY = startY;

  pdf.fontSize(FONT_SIZE_SMALL);
  for (let i = pageIndex * onePageEstContains; i < onePageEstContains * (pageIndex + 1); i++) {
    if (i >= endorsements.length) {
      break;
    }
    const { endorsementContent, created, endorseEmail } = endorsements[i];
    const ests = [
      i + 1,
      endorsementContent,
      endorseEmail,
      _common.formatDate(new Date(created), timeZone, DATE_FORMAT),
    ];
    // 一次绘制一行
    Object.keys(estTitleArr);
    // eslint-disable-next-line
    everyEstWidths.forEach((width, partIndex) => {
      const est = ests[partIndex];
      if (checkContainChinese(est)) {
        pdf.font(getFont('zh')).text(est, posX, posY, {
          height: ENDORSEMENT_EACH_LINE_HEIGHT(),
          width,
          align: 'center',
          lineBreak: false,
        });
      } else {
        pdf.font(getFont('en')).text(est, posX, posY, {
          height: ENDORSEMENT_EACH_LINE_HEIGHT(),
          width,
          align: 'center',
          lineBreak: false,
        });
      }

      posX += width;
    });
    // 绘制完一行，重新定位到下一行
    posX = startX;
    posY += TABLE_EACH_LINE_HEIGHT() + 3;
  }
};
const paint = drawPdf;
export {
  paint,
  init,
  initGlobalInfo,
  initSensorInfo,
  initDeviceInfo,
  initSummaryInfo,
  initPdfInfo,
  initChartXValues,
  initChartParams,
  initDataTableParams,
  initApiInfo,
  initBtPrintInfo,
  initEndorsementInfo,

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
  printThresholdLegend,
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
