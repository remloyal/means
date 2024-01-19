// 'use strict';
// eslint-disable-next-line
import { SENSORS, TEMP_UNIT } from '../gloable/gloable';
import { filePath } from '../../unitls/unitls';
const path = require('path');

/**
 * Convert a value in milli-meters into a number of points.
 * Always returns an integer value
 */
export const PDF_MM_TO_POINT = mm => parseInt((mm * 72) / 25.4 + 0.5, 10);

/**
 * Point width of a standard A4 page
 */
export const PDF_A4_WIDTH = PDF_MM_TO_POINT(210);
export const PDF_A4_HEIGHT = PDF_MM_TO_POINT(297);
//内容与页面左边(LEFT)框的距离
export const PAGE_LEFT_POS = (padding = 50) => padding;
export const PADDING_BOTTOM_FOOT = (padding = 20) => padding;
export const PADDING_TOP_DATA_TABLE = padding => PADDING_BOTTOM_FOOT(padding);
export const PADDING_TOP_ENDORSEMENT = padding => PADDING_BOTTOM_FOOT(padding);
const simsunPath = filePath('/static/font/simsun.ttf');
const arialPath = filePath('/static/font/arial.ttf');
const Msyhl = filePath('/static/font/Msyhl.ttf');
export const PDF_INFO = {
    SIZE: 'A4',
    OWNER_PASSWORD: '20210606',
    VERSION: '1.4',
    SUBJECT: 'Platform PDF',
  },
  FONT_SIMSUN = simsunPath, // 中文字体 黑体
  FONT_ARIAL = arialPath, // 俄语会用到，葡萄牙语应该也会用到
  FONT_HELVETICA = 'Helvetica', // 英文字体 常规
  FONT_HELVETICA_BOLD = 'Helvetica-Bold', // 英文字体 粗体
  FONT_SIZE_XLARGE = 32,
  FONT_SIZE_LARGE = 15,
  FONT_SIZE_NORMAL = 10,
  FONT_SIZE_SMALL = 8,
  FONT_SIZE_SMALLER = 6,
  FONT_SIZE_LOGO = 29,
  FONT_SIZE_TITLE = 12,
  /**
   |----PDF_A4_WIDTH------|
    ______________________
   |  '                '  |
   |  '                '  |
   |  '                '  |
   |  '                '  |
   |  '                '  |
   |  '                '  |
   |  '                '  |
   |  '                '  |
   |  '                '  |
   |__'________________'__|
      |----展示区域----|   
     \|/              \|/
  PAGE_LEFT_POS       PAGE_RIGHT_POS
   * Point width of a standard A4 page
   */
  // PDF_A4_WIDTH,
  /**
   * Point height of a standard A4 page
   */
  // PDF_A4_HEIGHT,
  //绘制区域的最左侧X位置，边界X值
  // PAGE_LEFT_POS,
  //能绘制区域的最右侧X位置
  PAGE_RIGHT_POS = padding => PDF_A4_WIDTH - PAGE_LEFT_POS(padding) + 5, // 为了跟设备端一致 略微增加delta（测试出来的）
  //每项距离页面顶端(TOP)的距离(以确定Y坐标，递增确定位置)
  PADDING_TOP_HEAD = (padding = 18) => padding, //Head info PART 1
  PADDING_TOP_HEAD_SUMMARY = (padding = 24) => padding, //Head info PART 1
  PADDING_TOP_DEVICE = (padding = 122) => padding, //ship device info
  PADDING_TOP_LOGGING_SUMMARY = (padding = 233) => padding, //log summary
  PADDING_TOP_DATA_SUMMARY = (padding = 363) => padding, //data summary
  PADDING_TOP_CHART = (padding = 501) => padding, //record chart
  PADDING_LEFT_CHART_FROM_LEFT_POS = (padding = 35) => padding, // 表格距离左侧可展示区域的距离
  // PADDING_BOTTOM_FOOT= padding => PADDING_BOTTOM_FOOT(padding), //foot info

  ROW_FIRST_DELTA = 15, // 第一行与line之间的间隔
  ROWS_DELTAY = 20, // 每行之间的间隔
  PDF_LOGO_HEIG = (size = 35) => size,
  PDF_LOGO_WIDTH = (size = 35) => size,
  // 三sensor的情况下，布局整体需要上移调整，足以放下所有信息的空间
  THREE_SENSOR_DELTAY_NOTE = 10,
  THREE_SENSOR_DELTAY_HEAD_SUMMARY = 15,
  THREE_SENSOR_DELTAY_DEVICE_INFO = 32,
  THREE_SENSOR_DELTAY_LOGGING_SUMMARY = 50,
  THREE_SENSOR_DELTAY_DATA_SUMMARY = 5,
  DELTA_Y_LABEL_LINE = 18, // 每个大写label与下面横线的距离
  CHART_INNER_HEIG = (padding = 228) => padding, //Record Chart坐标轴边框高度 要满足CHART_Y_PARTS均分
  CHART_X_PARTS = 8, //Record Chart X轴分多少块
  CHART_Y_PARTS = 10, //Record Chart Y轴分多少块
  CHART_Y_PARTS_YIYAO_HUMI = 10,
  CHART_Y_PARTS_SHENGSHENG = 10,
  ALARM_COLOR = [255, 0, 0],
  PASS_COLOR = [0, 128, 0],
  DEFAULT_FONT_COLOR = [0, 0, 0],
  CHART_COLORS = {
    TEMP_DATA_LINE_COLOR: [0, 0, 255],
    TEMP_THRESH_LINE_COLOR: [255, 0, 0],
    SUB_TEMP_DATA_LINE_COLOR: '#00FFE7',
    SUB_TEMP_THRESH_LINE_COLOR: '#E800FF',
    HUMI_DATA_LINE_COLOR: [0, 255, 0],
    HUMI_THRESH_LINE_COLOR: [255, 0, 255],
    LINE_COLORS: [[0, 0, 255], [0, 255, 0], '#00FFE7'],
    THRESH_LINE_COLORS: [[255, 0, 0], [255, 0, 255], '#E800FF'],
    XY_LINE_COLOR: [211, 211, 211], // light gray
    CHAT_LINE_COLOR: [153, 153, 153],
    MARK_DATA_LINE_COLOR: [250, 112, 250],
  },
  /*source contents原始数据打印*/
  TEMPS_PARTS_MAX = (sensors = [], sensorsPdfSupported = []) => {
    const sensorsCnt = sensors.length;
    // 跟设备端保持一致，支持humi的就会绘制5列(不管sensor选了几个1个还是2个)
    // 可能存在，支持温湿度，但是用户只选了温度，那1个sensor绘制6列，很合理，但是设备却绘制5列，空出湿度那一列
    const supportHumi = sensorsPdfSupported.includes(SENSORS.HUMI);
    let parts = 5;
    switch (sensorsCnt) {
      case 1:
        parts = 6;
        break;
      case 2:
        parts = 5;
        break;
      case 3:
        parts = 5;
        break;
      default:
        parts = 5;
    }
    if (supportHumi) {
      parts = 5;
    }
    return parts;
  },
  // data table 表头高度
  TABLE_TITLE_HEIGHT = (padding = 15) => padding,
  // data table 每一行的高度
  TABLE_EACH_LINE_HEIGHT = (padding = 7) => padding,
  // PADDING_TOP_DATA_TABLE= padding => PADDING_TOP_DATA_TABLE(padding),
  // data Table的高度，整体高度-2*foot的高度，也就是顶部pading为foot的高度
  DATA_TABLE_HEIGHT = (topPadding, bottomPadding) =>
    PDF_A4_HEIGHT - (PADDING_TOP_DATA_TABLE(topPadding) + PADDING_BOTTOM_FOOT(bottomPadding) + 2),
  // endorsement 表头高度
  ENDORSEMENT_TITLE_HEIGHT = (padding = 20) => padding,
  // endorsement 每行的高度
  ENDORSEMENT_EACH_LINE_HEIGHT = (padding = 10) => padding,
  // PADDING_TOP_ENDORSEMENT= padding => PADDING_TOP_ENDORSEMENT(padding),
  // endorsement 的高度，整体高度-2*foot的高度，也就是顶部pading为foot的高度
  ENDORSEMENT_HEIGHT = (topPadding, bottomPadding) =>
    PDF_A4_HEIGHT - (PADDING_TOP_ENDORSEMENT(topPadding) + PADDING_BOTTOM_FOOT(bottomPadding) + 2),
  DASH = {
    FOOT: 3,
    CHART: 3,
  },
  // 符号，pdf中打印用
  SIGN = {
    SHANGBIAO: '\xae', // 商标 Ⓡ
    UNIT: (type, lan = 'en', options) => {
      const { unit = TEMP_UNIT.CELS } = options || {};
      let units = '';
      switch (type) {
        case SENSORS.TEMP:
        case SENSORS.SUB_TEMP:
          if (lan !== 'zh') {
            units = '\xb0C'; // ℃
            if (unit === TEMP_UNIT.FAHR) {
              units = '\xb0F';
            }
          } else {
            units = '℃'; //
            if (unit === TEMP_UNIT.FAHR) {
              units = '℉';
            }
          }
          break;
        case SENSORS.HUMI:
          units = 'RH';
          break;
        default:
          units = '';
      }
      return units;
    },
  },
  UNKONWN = 'unkown',
  NOVALUE = '-'; // PDF中无数据，默认填充
