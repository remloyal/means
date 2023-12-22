'use strict';

import {
  ALARM_COLOR,
  PASS_COLOR,
  DEFAULT_FONT_COLOR,
  FONT_SIMSUN,
  FONT_ARIAL,
  FONT_HELVETICA,
  SIGN,
  NOVALUE,
  FONT_SIZE_SMALL,
  FONT_SIZE_LOGO,
} from './constants';
import {
  SENSOR_EXC_DEFAULT,
  AlarmStatus,
  MKT_PARAMS,
  SENSORS,
  ALERT_TYPE,
  TEMP_UNIT,
} from '../gloable/gloable';
import * as _util from '../unitl';
import * as _common from '../gloable/common';
import { text } from '../gloable/language';
import { isTempSenosr, transFahr } from '../unitl';

/**
 pdf坐标
(0,0)
  ----------------------------->
  |
  |
  |
  |
  |
  |
  |
  |
  |
  \/
 */

/**
 *
 * @param {pdfKit} pdf 实例
 * @param {*} pageWidth pdf页面的宽度
 * @param {*} left pdf内容离左边的距离
 * @param {*} top pdf内容离顶部的距离
 * @param {*} logoHeight logo的高度
 * @param {*} logoWidth logo的宽度
 * @param {*} isAlarm 是否报警：根据此项画不同颜色的logo
 */
const drawLogo = (pdf, pageWidth, left, top, logoHeight, logoWidth, isAlarm = false) => {
  // 找到logo最右侧与最底部的位置
  const right = left + logoWidth;
  const bottom = top + logoHeight;

  // logo 四个拐角是弧状
  const curveWidth = logoWidth / 8;
  const curveHeight = logoHeight / 8;

  /**
   * !画最外面的边框
*!  (0,0)
**    --------------------------————>
      |                           |  |
      |——————————right——————————|top |   
      |left|                      |  |
      |
      |     b__________________c  -  |
      |   a|     _________      |d   |
      |    |    |       | \     |    |
      |    |  __|_______|__\__  |    |
      |    | |      PASS      | |    |
      |    | |__ _____________| |   bottom
      |    |    |          |    |    | 
      |    |    |__________|    |    |
      |   h|___________________ | e  |
      |     g                  f 
     \|/
      ' 
  */
  // pdf.strokeColor([0, 128, 0]);
  pdf.lineWidth(5);
  // 移动到b位置
  pdf.moveTo(left + curveWidth, top);
  // 画线 bc
  pdf
    .lineTo(right - curveWidth, top)
    //画cd的圆弧 贝塞尔曲线  (贝塞尔控制点的 x 坐标,贝塞尔控制点的 y 坐标,结束点的 x 坐标,结束点的 y 坐标)
    .quadraticCurveTo(right, top, right, top + curveWidth)
    //画线 de
    .lineTo(right, bottom - curveHeight)
    //画ef的圆弧
    .quadraticCurveTo(right, bottom, right - curveWidth, bottom)
    //画线fg
    .lineTo(left + curveWidth, bottom)
    //画gh的圆弧
    .quadraticCurveTo(left, bottom, left, bottom - curveHeight)
    //画线ha
    .lineTo(left, top + curveHeight)
    //画ab的圆弧
    .quadraticCurveTo(left, top, left + curveWidth, top);

  if (isAlarm) {
    pdf.fillAndStroke(ALARM_COLOR, ALARM_COLOR); // red
  } else {
    pdf.fillAndStroke(PASS_COLOR, PASS_COLOR); //green
  }
  // 绘制一个网页端pdf的标识，方便我们判断，是设备导出，还是平台导出
  pdf.fillColor([255, 255, 255]).text('.', right - curveWidth + 2, bottom - 2 * curveHeight + 2);
  /**
   * ! 画里面的pdf框
*!  (0,0)
**    --------------------------————>
      |                           |  |
      |——————————right——————————|top |   
      |left|                      |  |
      |     ____________________  -  |
      |    |   a _________ b    |    |
      |    |    |       | \     |    |
      |    |  __|_______|__\c_  |    |
      |    | |      PASS      | |    |
      |    | |__ _____________| |   bottom
      |    |    |          |    |    | 
      |    |   e|__________|d   |    |
      |    |___________________ |    |
      |                        
     \|/
      ' 
  */
  const innerHeight = (logoHeight * 9) / 60 - 0.5; // ab离外框的距离
  let innerWidth = (logoWidth * 13) / 60 - 0.5; // cd 离外框的距离
  const ax = left + innerWidth;
  const ay = top + innerHeight;
  const bx = ax + (logoWidth * 2) / 5; // 以a点为基础，多画一部分
  const by = ay;
  const cx = right - innerWidth; //这样左边与右边离外边框的距离一致
  const cy = top + (logoHeight * 4) / 11;
  const dx = cx;
  const dy = bottom - innerHeight; // 这样上面与下面离外边框的距离都一致
  const ex = ax;
  const ey = dy;

  pdf
    .lineWidth(1.5)
    .strokeColor([255, 255, 255])
    .moveTo(ax, ay)
    .lineTo(bx, by)
    .lineTo(cx, cy)
    .lineTo(dx, dy)
    .lineTo(ex, ey)
    .lineTo(ax, ay - 0.5) // 往上画画，不然看上去有点缺口
    .stroke();

  /**
   * ! 画三角形区域
*!  (0,0)
**    --------------------------————>
      |                           |  |
      |——————————right——————————|top |   
      |left|                      |  |
      |     ____________________  -  |
      |    |     _________ b    |    |
      |    |    |       | \     |    |
      |    |  __|______f|__\c_  |    |
      |    | |      PASS      | |    |
      |    | |__ _____________| |   bottom
      |    |    |          |    |    | 
      |    |    |__________|    |    |
      |    |___________________ |    |
      |                        
     \|/
      ' 
  */
  const fx = bx;
  const fy = cy;

  pdf
    .lineWidth(1)
    .moveTo(bx, by)
    .lineTo(fx, fy)
    .lineTo(cx, fy) // 保证f与c的y值一致，同一高度
    .fillAndStroke([255, 255, 255], [255, 255, 255]);

  /**
   * ! 画中间白色矩形
*!  (0,0)
**    --------------------------————>
      |                           |  |
      |——————————right——————————|top |   
      |left|                      |  |
      |     ____________________  -  |
      |    |     _________      |    |
      |    |    |       | \     |    |
      |    |g __|_______|__\c_ h|    |
      |    | |      PASS      | |    |
      |    | |__ _____________| |   bottom
      |    |j   |          |   i|    | 
      |    |    |__________|    |    |
      |    |___________________ |    |
      |                        
     \|/
      ' 
  */
  innerWidth = innerWidth / 8; // gj与hi离外层边框的宽度
  const gx = left + innerWidth;
  const gy = cy;
  const hx = right - innerWidth; //这样矩形左右两边离最外层边框距离一致
  const hy = gy;
  const ix = hx;
  const iy = bottom - (hy - top); // g与h点 离最外上边框的距离，其实与i离最外下边框距离需要一致
  const jx = gx;
  const jy = iy;
  pdf
    .lineWidth(2)
    .moveTo(gx, gy)
    .lineTo(hx, hy)
    .lineTo(ix, iy)
    .lineTo(jx, jy)
    .lineTo(gx, gy - 1)
    .fillAndStroke([255, 255, 255], [255, 255, 255]);

  /**
   * ! 画最后的pass or alarm
*!  (0,0)
**    --------------------------————>
      |                           |  |
      |——————————right——————————|top |   
      |left|                      |  |
      |     ____________________  -  |
      |    |    a_________      |    |
      |    |    |       | \     |    |
      |    |g __|_______|__\__  |    |
      |    | |  PASS          | |    |
      |    | |__ _____________| |   bottom
      |    |    |          |    |    | 
      |    |    |__________|    |    |
      |    |___________________ |    |
      |                        
     \|/
      ' 
  */
  // 坐标参考 a的x，g的y
  if (isAlarm) {
    pdf
      .fontSize(10)
      .font('Helvetica')
      .fillColor(ALARM_COLOR)
      .text('ALARM', ax - 8, gy + 1, {
        characterSpacing: 0.5, //the amount of space between each character in the text
      });
  } else {
    pdf
      .fontSize(10)
      .font('Helvetica')
      .fillColor(PASS_COLOR)
      .text('PASS', ax - 3, gy + 1, {
        characterSpacing: 0.5, //the amount of space between each character in the text
      });
  }
  return { logoWidth };
};

/**
 *
 * @param {pdfKit} pdf 实例
 * @param {*} pageWidth pdf页面的宽度
 * @param {*} left pdf内容离左边的距离
 * @param {*} top pdf内容离顶部的距离
 * @param {*} logoHeight logo的高度
 * @param {*} logoWidth logo的宽度
 * @param {*} isAlarm 是否报警：根据此项画不同颜色的logo
 */
const drawYesOrNoLogo = (pdf, pageWidth, left, top, logoHeight, logoWidth, isAlarm = false) => {
  pdf.lineWidth(10);
  if (isAlarm) {
    // const right = leftStart + (logoWidth * 9) / 10;
    // const bottom = topStart + (logoHeight * 9) / 10;
    // const left = leftStart + logoWidth / 10;
    // const top = topStart + logoHeight / 10;
    const right = left + logoWidth;
    const bottom = top + logoHeight;
    pdf
      .strokeColor(ALARM_COLOR)
      .moveTo(left, top)
      .lineTo(right, bottom)
      .moveTo(right, top)
      .lineTo(left, bottom)
      .stroke();
    // 绘制一个网页端pdf的标识，方便我们判断，是设备导出，还是平台导出
    pdf.fillColor([255, 255, 255]).text('.', left + logoWidth - 2, top);
  } else {
    pdf
      .strokeColor(PASS_COLOR)
      .moveTo(left, top + (logoHeight * 3) / 5)
      .lineTo(left + (logoWidth * 2) / 5, top + logoHeight)
      .lineTo(left + logoWidth, top)
      .stroke();
    // 绘制一个网页端pdf的标识，方便我们判断，是设备导出，还是平台导出
    pdf.fillColor([255, 255, 255]).text('.', left + logoWidth - 0.5, top);
  }
};

const setBoldEnFont = pdf => {
  return pdf.font('Helvetica-Bold');
};

const setNormalEnFont = pdf => {
  return pdf.font('Helvetica');
};

/**
 * 默认绘制不换行的字串（系统默认，当达到预设的pdf宽度边界时，字串绘制不下，便会自动换行）
 * @param {*} pdf
 * @param {*} text
 * @param {*} x
 * @param {*} y
 * @param {*} lineBreak
 */
const textBreak = (pdf, text, x, y, lineBreak = false) => {
  pdf.text(text, x, y, { lineBreak, characterSpacing: 0.2 });
};

/**
 * 画线
 * @param {pdfKit} pdf
 * @param {Array} from  [x,y]
 * @param {Array} to  [x,y]
 */
const drawLine = (pdf, from, to, option) => {
  const {
    color = DEFAULT_FONT_COLOR,
    lineWidth = 0.5,
    dash = 0,
    space,
    undash = false,
  } = option || {};
  // 需要注意一点： 前一条线画了dash，后面一条线，如果不作undash，那么也会被绘制成带有之前dash的线
  if (dash > 0) {
    pdf
      .strokeColor(color)
      .lineWidth(lineWidth)
      .moveTo(from[0], from[1])
      .lineTo(to[0], to[1])
      .dash(dash, { space: space || dash })
      .stroke();
  } else {
    if (undash) {
      pdf.undash();
    }
    pdf
      .strokeColor(color)
      .lineWidth(lineWidth)
      .moveTo(from[0], from[1])
      .lineTo(to[0], to[1])
      .stroke();
  }
};

/**
 * 根据传入的sensor值，获取其Y坐标点
 * 根据传入的 timestap值，获取其X坐标点
 * @param {*} chartStartPos
 * @param {*} lengthPerValue
 * @param {*} topPosYValue
 * @param {*} value
 */
const getPos = (chartStartPos, lengthPerValue, topPosYValue, value) => {
  // 通过以上，可以计算得出每个点的值 映射到pdf坐标系中的Y轴位置
  return chartStartPos + lengthPerValue * (topPosYValue - value);
};

/**
 * 计算summaryInfo
 * @param {object} 计算所需要的参数
 * @returns
 * //#region
 * //#endregion
 */
//#region
/*
{
  isAlarm,
  alarmCount: {
    temp: {
      low: {
        total: 0,
        longestTime: '0s',
        totalTime: '0s',
      },
      high: {
        total: 10,
        longestTime: '0s',
        totalTime: '0s',
      },
    },
    humi: {
      low: {
        total: 210,
        longestTime: '0s',
        totalTime: '0s',
      },
      high: {
        total: 131,
        longestTime: '0s',
        totalTime: '0s',
      },
    },
  },
  highests: {
    temp: {
      value: 32.7,
      time: '20-02-13 14:29:00',
    },
    subTemp: {
      value: 34.3,
      time: '20-02-13 14:29:00',
    },
    humi: {
      value: 47,
      time: '20-02-13 14:29:00',
    },
  },
  lowests: {
    temp: {
      value: 28.8,
      time: '20-02-13 14:29:00',
    },
    subTemp: {
      value: 31,
      time: '20-02-13 14:29:00',
    },
    humi: {
      value: 38,
      time: '20-02-13 14:29:00',
    },
  },
  averages: {
    temp: 18.3,
    subTemp: 18,
    humi: 19,
  },
  mkts: {
    temp: 18.2,
  },
};
*/
//#endregion
const calcuteSummary = ({
  data = [],
  threshold,
  needTransSensorValue = false,
  product = {},
  timeZone,
  mask = null,
}) => {
  const { minOrigin = 0, maxOrigin = 0 } = threshold || {};
  const { pdfMktShow = false } = product || {};

  let alarm = false;
  let highest = null;
  let lowest = null;
  let lowCnt = 0; // 低温告警次数
  let highCnt = 0; // 高温告警次数
  let lowLongestTime = 0; // 低温最长持续时间
  let highLongestTime = 0; // 高温最长持续时间
  let lowTotalTime = 0; // 低温总持续时间
  let highTotalTime = 0; // 高温总持续时间
  let beforeStatus = AlarmStatus.NORMAL; // 当前状态  0 正常   1 低温告警  2高温告警
  let curStatus = AlarmStatus.NORMAL; // 上一条数据状态
  let beforeSensor = null; // 最后一条数据情况
  // 防止出现所有sensor值都是异常值的时候，那么计算结果可能为0，给的初始值就作为计算结果了
  let sum = null;
  let timeInter = null; // mkt计算，两正常温度点之间的时间间隔
  let timeSum = null; // 总时间
  let timestampBefore = null; // 毫秒
  let temSum = null;
  let mkt = null; // mkt 的值
  let sumPow = null; // calcu average deviation
  let average = null;
  let averageDeviation = null;

  const isTempAlarmOn = maxOrigin !== minOrigin;

  const initValidValue = val => (val === null ? 0 : val);
  // 计算average、mkt等，是计算有效值的个数，而不是所有数据的个数
  let valideDataCnt = 0;
  let firstValideDataIndex = -1; // 为了MKT
  const priceList = [];

  data.forEach((m, i) => {
    if (m.val === SENSOR_EXC_DEFAULT) alarm = true; // 如果存在异常数据 设备存在异常
    // 更新最高温度 与 最高温报警温度时间
    if (m.val !== SENSOR_EXC_DEFAULT) {
      valideDataCnt += 1;
      if (firstValideDataIndex < 0) firstValideDataIndex = i;

      //*支持mkt展示的才做计算
      if (pdfMktShow) {
        sum = initValidValue(sum);
        timeInter = initValidValue(timeInter);
        timeSum = initValidValue(timeSum);
        timestampBefore = initValidValue(timestampBefore);
        temSum = initValidValue(temSum);
        mkt = initValidValue(mkt);
        // 不是第一个点 , 第一个点不算入mtk
        if (i !== 0) {
          timeInter = (m.timestamp - timestampBefore) / 1000;
        }

        temSum += timeInter * Math.exp(-MKT_PARAMS.δH / (MKT_PARAMS.K + m.val));
        timeSum += timeInter;
      }
      // 计算平均值
      sum += m.val;

      if (highest) {
        if (m.val > highest.val) {
          highest.val = m.val;
          highest.timestamp = m.timestamp;
        } else if (m.val < lowest.val) {
          lowest.val = m.val;
          lowest.timestamp = m.timestamp;
        }
      } else {
        highest = {
          val: m.val,
          timestamp: m.timestamp,
        };
        lowest = {
          val: m.val,
          timestamp: m.timestamp,
        };
      }

      // 因为threshold已经格式化单位了，所以状态比较也需要用格式化的数据比较
      if (isTempAlarmOn) {
        if (m.val > maxOrigin) {
          if (!alarm) alarm = true;
          curStatus = AlarmStatus.HIGH;
        } else if (m.val < minOrigin) {
          if (!alarm) alarm = true;
          curStatus = AlarmStatus.LOW;
        } else {
          curStatus = AlarmStatus.NORMAL;
        }
      } else {
        curStatus = AlarmStatus.NORMAL;
      }

      // 上条记录与当前 记录如果 不一致 进行数据计算
      if (curStatus !== beforeStatus || i === data.length - 1) {
        if (curStatus === AlarmStatus.LOW && beforeStatus !== AlarmStatus.LOW) {
          lowCnt += 1;
        } else if (curStatus === AlarmStatus.HIGH && beforeStatus !== AlarmStatus.HIGH) {
          highCnt += 1;
        }
        // 我们计算的是每两次改变状态节点之间，一段超温的统计
        if (beforeSensor) {
          if (beforeStatus === AlarmStatus.HIGH) {
            const lt = m.timestamp - beforeSensor.timestamp;
            highTotalTime += lt;
            if (highLongestTime < lt) {
              highLongestTime = lt;
            }
          } else if (beforeStatus === AlarmStatus.LOW) {
            const lt = m.timestamp - beforeSensor.timestamp;
            lowTotalTime += lt;
            if (lowLongestTime < lt) {
              lowLongestTime = lt;
            }
          }
        }
        beforeStatus = curStatus;
        beforeSensor = m;
      }
      priceList.push(Math.round(m.val * 10));
    }
    timestampBefore = m.timestamp;
  });
  average =
    valideDataCnt > 0 && sum !== null ? _util.formatDecimal(sum / valideDataCnt, 1) : undefined;
  if (pdfMktShow) {
    mkt =
      valideDataCnt === 1
        ? data[firstValideDataIndex].val
        : valideDataCnt === 0
          ? null
          : temSum !== null && timeSum !== null
            ? _util.formatDecimal(-MKT_PARAMS.δH / Math.log(temSum / timeSum) - MKT_PARAMS.K, 1)
            : null;

    data.forEach((m, i) => {
      if (m.val != SENSOR_EXC_DEFAULT) {
        sumPow = initValidValue(sumPow);
        // sumPow += Math.pow(m.val - average, 2); // 这边会有误差，0.7 平方，这么算下来不是0.49
        if (average) sumPow += (m.val - average) * (m.val - average);
      }
    });
    averageDeviation =
      valideDataCnt > 0 && sumPow !== null
        ? _util.formatDecimal(Math.sqrt(sumPow / valideDataCnt), 1)
        : null;
  }

  const seconds2Local = (microSeconds = 0) => {
    const seconds = microSeconds / 1000;
    const hour = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    return `${hour ? `${hour}h` : ''}${min ? `${min}m` : ''}${sec}s`;
  };
  if (priceList.length > 0) {
    const mean =
      priceList.reduce((a, b) => {
        return a + b;
      }) /
      priceList.length /
      10;
    mkt = Math.floor(mean * 10) / 10;
  }
  return {
    alarm,
    alarms: {
      low: {
        total: lowCnt,
        longestTime: seconds2Local(lowLongestTime),
        totalTime: seconds2Local(lowTotalTime),
      },
      high: {
        total: highCnt,
        longestTime: seconds2Local(highLongestTime),
        totalTime: seconds2Local(highTotalTime),
      },
    },
    highest: {
      value: highest ? (needTransSensorValue ? transFahr(highest.val) : highest.val) : NOVALUE,
      valueOrigin: highest ? highest.val : NOVALUE,
      time: highest ? _common.formatDate(highest.timestamp, timeZone, mask) : NOVALUE,
      timestamp: (highest && highest.timestamp) || NOVALUE,
    },
    lowest: {
      value: lowest ? (needTransSensorValue ? transFahr(lowest.val) : lowest.val) : NOVALUE,
      valueOrigin: lowest ? lowest.val : NOVALUE,
      time: lowest ? _common.formatDate(lowest.timestamp, timeZone, mask) : NOVALUE,
      timestamp: (lowest && lowest.timestamp) || NOVALUE,
    },
    average: _util.isNumber(average)
      ? needTransSensorValue
        ? transFahr(average)
        : average
      : NOVALUE,
    averageOrigin: _util.isNumber(average) ? average : NOVALUE,
    mkt: _util.isNumber(mkt) ? (needTransSensorValue ? transFahr(mkt) : mkt) : NOVALUE,
    mktOrigin: _util.isNumber(mkt) ? mkt : NOVALUE,
    averageDeviation: _util.isNumber(averageDeviation)
      ? needTransSensorValue
        ? transFahr(averageDeviation)
        : averageDeviation
      : NOVALUE,
    averageDeviationOrigin: _util.isNumber(averageDeviation) ? averageDeviation : NOVALUE,
    sumPow: _util.isNumber(sumPow) ? (needTransSensorValue ? transFahr(sumPow) : sumPow) : NOVALUE,
    sumPowOrigin: _util.isNumber(sumPow) ? sumPow : NOVALUE,
  };
};

const calcuteYiyaoSummary = ({
  data = [],
  threshold,
  needTransSensorValue = false,
  type,
  summaryData,
  product = {},
  timeZone,
  language = 'en',
  mask = null,
  unit,
}) => {
  const { pdfMktShow = false } = product || {};

  let alarm = false;
  let highest = null;
  let lowest = null;
  // 防止出现所有sensor值都是异常值的时候，那么计算结果可能为0，给的初始值就作为计算结果了
  let sum = null;
  let timeInter = null; // mkt计算，两正常温度点之间的时间间隔
  let timeSum = null; // 总时间
  let timestampBefore = null; // 毫秒
  let temSum = null;
  let mkt = null; // mkt 的值
  let sumPow = null; // calcu average deviation
  let average = null;
  let averageDeviation = null;

  let alarmSummay = null;
  if (type === SENSORS.TEMP) {
    const { summary = [] } = summaryData || {};
    alarmSummay = [
      { key: 'max2', val: 'H2: >', thsIndex: 1, boundary: 0 },
      { key: 'max1', val: 'H1: >', thsIndex: 0, boundary: 0 },
      { key: 'min1', val: 'L1: <', thsIndex: 0, boundary: 1 },
      { key: 'min2', val: 'L2: <', thsIndex: 1, boundary: 1 },
    ].map(item => {
      const type = item.key;
      const { totalEvents = 0, totalTime = 0 } =
        (summary || []).filter(
          s => s.thsIndex === item.thsIndex && s.boundary === item.boundary
        )[0] || {};
      // const timeTotal = _util.formatTimeDuration(totalTime * 1000, language);
      return {
        show: !!threshold[type].alert,
        zone: `${item.val}${_util.formatSensorValue(SENSORS.TEMP, { unit })(
          threshold[type].value,
          1
        )}${SIGN.UNIT(SENSORS.TEMP, language, { unit })}`,
        thresh: threshold[type].value,
        alarmType: ALERT_TYPE[threshold[type].alertType](language),
        allowTime: `${threshold[type].time} ${
          threshold[type].time > 0 ? text('KEY_MINS', language) : text('KEY_MIN', language)
        }`,
        // totalTime: timeTotal,
        totalTime: `${parseInt(totalTime / 60, 10)} ${
          totalTime > 0 ? text('KEY_MINS', language) : text('KEY_MIN', language)
        }`,
        status: totalEvents === 0 ? text('KEY_PASS', language) : text('KEY_FAIL', language),
        isAlert: totalEvents > 0,
      };
    });
    //  判断报告是否通过
    (summary || []).forEach(item => {
      const { totalEvents = 0 } = item || {};
      if (!alarm) {
        alarm = totalEvents > 0;
      }
    });
  }

  const initValidValue = val => (val === null ? 0 : val);
  // 计算average、mkt等，是计算有效值的个数，而不是所有数据的个数
  let valideDataCnt = 0;
  let firstValideDataIndex = -1; // 为了MKT
  data.forEach((m, i) => {
    if (m.val === SENSOR_EXC_DEFAULT) alarm = true; // 如果存在异常数据 设备存在异常
    // 更新最高温度 与 最高温报警温度时间
    if (m.val !== SENSOR_EXC_DEFAULT) {
      valideDataCnt += 1;
      if (firstValideDataIndex < 0) firstValideDataIndex = i;

      //*支持mkt展示的才做计算
      if (pdfMktShow) {
        sum = initValidValue(sum);
        timeInter = initValidValue(timeInter);
        timeSum = initValidValue(timeSum);
        timestampBefore = initValidValue(timestampBefore);
        temSum = initValidValue(temSum);
        mkt = initValidValue(mkt);
        // 不是第一个点 , 第一个点不算入mtk
        if (i !== 0) {
          timeInter = (m.timestamp - timestampBefore) / 1000;
        }

        temSum += timeInter * Math.exp(-MKT_PARAMS.δH / (MKT_PARAMS.K + m.val));
        timeSum += timeInter;
      }
      // 计算平均值
      sum += m.val;

      if (highest) {
        if (m.val > highest.val) {
          highest.val = m.val;
          highest.timestamp = m.timestamp;
        } else if (m.val < lowest.val) {
          lowest.val = m.val;
          lowest.timestamp = m.timestamp;
        }
      } else {
        highest = {
          val: m.val,
          timestamp: m.timestamp,
        };
        lowest = {
          val: m.val,
          timestamp: m.timestamp,
        };
      }
    }
    timestampBefore = m.timestamp;
  });
  average =
    valideDataCnt > 0 && sum !== null ? _util.formatDecimal(sum / valideDataCnt, 1) : undefined;
  if (pdfMktShow) {
    mkt =
      valideDataCnt === 1
        ? data[firstValideDataIndex].val
        : valideDataCnt === 0
          ? null
          : temSum !== null && timeSum !== null
            ? _util.formatDecimal(-MKT_PARAMS.δH / Math.log(temSum / timeSum) - MKT_PARAMS.K, 1)
            : null;

    data.forEach((m, i) => {
      if (m.val != SENSOR_EXC_DEFAULT) {
        sumPow = initValidValue(sumPow);
        // sumPow += Math.pow(m.val - average, 2); // 这边会有误差，0.7 平方，这么算下来不是0.49
        if (average) sumPow += (m.val - average) * (m.val - average);
      }
    });
    averageDeviation =
      valideDataCnt > 0 && sumPow !== null
        ? _util.formatDecimal(Math.sqrt(sumPow / valideDataCnt), 1)
        : null;
  }

  return {
    alarm,
    alarms: alarmSummay,
    highest: {
      value: highest ? (needTransSensorValue ? transFahr(highest.val) : highest.val) : NOVALUE,
      valueOrigin: highest ? highest.val : NOVALUE,
      time: highest ? _common.formatDate(highest.timestamp, timeZone, mask) : NOVALUE,
      timestamp: highest || NOVALUE,
    },
    lowest: {
      value: lowest ? (needTransSensorValue ? transFahr(lowest.val) : lowest.val) : NOVALUE,
      valueOrigin: lowest ? lowest.val : NOVALUE,
      time: lowest ? _common.formatDate(lowest.timestamp, timeZone, mask) : NOVALUE,
      timestamp: lowest || NOVALUE,
    },
    average: _util.isNumber(average)
      ? needTransSensorValue
        ? transFahr(average)
        : average
      : NOVALUE,
    mkt: _util.isNumber(mkt) ? (needTransSensorValue ? transFahr(mkt) : mkt) : NOVALUE,
    averageDeviation: _util.isNumber(averageDeviation)
      ? needTransSensorValue
        ? transFahr(averageDeviation)
        : averageDeviation
      : NOVALUE,
    sumPow: _util.isNumber(sumPow) ? (needTransSensorValue ? transFahr(sumPow) : sumPow) : NOVALUE,
  };
};

const getFont = (lan = 'en') => {
  let font = FONT_HELVETICA;
  switch (lan) {
    case 'zh':
      font = FONT_SIMSUN;
      break;
    case 'ru':
      font = FONT_ARIAL;
      break;
  }
  return font;
};

/**
 * 根据语言获取波浪号~
 * 因为中文的~在pdf中显示会跑到两字上面的位置，所以需要使用特殊的波浪号
 * 英文的就用~
 */
const getBoLangHao = (lan = 'en') => {
  let sign = '~';
  if (lan === 'zh') sign = '～';
  return sign;
};

/**
 *
 * @param {string} text  要绘制的文字
 * @param {int} fontSize 文字大小
 * @param {string} startPos  起始位置（left、right）
 *                            left：从左侧起，所有占位符都需要算到长度中
 *                            right:从右侧起，就要忽略最后一个字符的长度了
 */
const stepLength = (text, config) => {
  const { fontSize = FONT_SIZE_LOGO, startPos = 'left', lan = 'en' } = config || {};
  // fontSize 为29
  const lengthMap = {
    [FONT_SIZE_SMALL]: {
      1: 4,
      2: 4,
      3: 4,
      4: 4,
      5: 4,
      6: 4,
      7: 4,
      8: 4,
      9: 4,
      0: 4,
      '-': 3,
      '.': 2,
      ' ': 3,
    },
    [FONT_SIZE_LOGO]: {
      A: 17,
      B: 17,
      C: 17,
      D: 20,
      E: 17,
      F: 17,
      G: 20,
      H: 17,
      I: 7,
      J: 13,
      K: 17,
      L: 13,
      M: 22,
      N: 18,
      O: 20,
      P: 17,
      Q: 20,
      R: 18,
      S: 17,
      T: 17,
      U: 18,
      V: 18,
      W: 26,
      X: 17,
      Y: 17,
      Z: 17,
      a: 13,
      b: 13,
      c: 13,
      d: 14,
      e: 13,
      f: 8,
      g: 13,
      h: 13,
      i: 7,
      j: 7,
      k: 13,
      l: 5,
      m: 20,
      n: 13,
      o: 13,
      p: 13,
      q: 13,
      r: 10,
      s: 13,
      t: 7,
      u: 13,
      v: 13,
      w: 20,
      x: 13,
      y: 13,
      z: 13,
      ' ': 7,
      ':': 5,
    },
  };
  let defaultSize = 4;
  switch (fontSize) {
    case FONT_SIZE_SMALL:
      if (lan === 'en') {
        defaultSize = 4;
      } else {
        defaultSize = 5;
      }
      break;
    case FONT_SIZE_LOGO:
      if (lan === 'en') {
        defaultSize = 17;
      } else {
        defaultSize = 27;
      }
      break;
  }
  return `${text}`.split('').reduce((pre, cur, index) => {
    return (
      pre +
      (lengthMap[`${fontSize}`][cur] || defaultSize) - // 如果没有匹配项，给一个默认值4
      (startPos === 'left'
        ? 0
        : index === `${text}`.length - 1
          ? lengthMap[`${fontSize}`][`${text}`[0]] || defaultSize // 减去第一位的长度
          : 0)
    );
  }, 0);
};

/**
 * 判断字符串是否包含中文
 */
const checkContainChinese = str => {
  if (escape(str).indexOf('%u') < 0) {
    return false;
  }
  return true;
};

/**
 * 根据第几页与总页数，动态调整显示的位置，使其保持在原位置
 * @param {*} index
 * @param {*} total
 */
const footPageNumberDeltaX = (index, total) => {
  // 获取index 与 total的位数
  const deltaCnt = `${index}`.length + `${total}`.length - 2;
  // 保持原始位置不动的情况下，随着totalPage与pageIndex的增加，动态调整
  return deltaCnt * 4; // 多一位数字，挪4个单位长度
};

/**
 * 温度有两个单位，所以温度为华氏摄氏度的时候就需要转化温度值
 * @param {*} type
 * @param {*} unit
 */
const needTransSensorValue = (type, unit) => {
  return isTempSenosr(type) && unit === TEMP_UNIT.FAHR;
};
export {
  drawLogo,
  drawYesOrNoLogo,
  drawLine,
  setBoldEnFont,
  setNormalEnFont,
  textBreak,
  getPos,
  calcuteYiyaoSummary,
  getFont,
  getBoLangHao,
  stepLength,
  calcuteSummary,
  checkContainChinese,
  footPageNumberDeltaX,
  needTransSensorValue,
};
