'use strict';
import { text } from './language';
import _config from './config';
import _cfg from './config.json';
import { filePath } from '../../unitls/unitls';
// 发送短信时的类型区分
export const SMS_TYPE = {
  TEMP: 1,
  LOCATION: 2,
};
/*
 * 单纯的配置信息，一些常量(不要引入其他文件的东西,其他常量在if.js中)
 * Note:但是引入if.js容易出现异常
 * date: 2018/12/29
 * author: kiki
 */
export const MESSAGE_TYPE = {
  temp: 1, // 温度报警
  humi: 2, // 湿度报警
  shock: 3, // 振动报警
  lowBat: 4, // 低电报警
  sensorOut: 5, // 探头拔出报警
  flight: 6, // 进入飞行模式
  bind: 7, // 设备开始
  unBind: 8, // 设备结束
  offLine: 9, // 设备离线
  light: 10, // 光线报警
  subTemp: 11, // 辅温报警
  subHumi: 12, // 辅湿报警
  tempRecover: 13, // 温度报警恢复
  humiRecover: 14, // 湿度报警恢复
  shockRecover: 15, // 震动报警恢复
  flightRecover: 16, // 退出飞行模式
  lightRecover: 17, // 光线报警恢复
  subTempRecover: 18, // 辅温报警恢复
  subHumiRecover: 19, // 辅湿报警恢复
  subLight: 20, // 光线2报警
  subLightRecover: 21, // 光线2报警恢复
  openBox: 22, // 开关箱事件
  preTemp: 100, // 温度预警
  preHumi: 101, // 湿度预警
  preSubTemp: 102, // 辅温预警
  preSubHumi: 103, // 辅湿预警
  // 注意 Message表字段定义tinyint unsigned 只表示（0~255）
};

export const SENSORS = {
  TEMP: 'temp',
  SUB_TEMP: 'subTemp',
  HUMI: 'humi',
  SUB_HUMI: 'subHumi',
  LIGHT: 'light',
  SUB_LIGHT: 'subLight',
  SHOCK: 'shock',
  OPEN_BOX: 'openBox',
  ANGLE: 'angle',
};

// v2 获取数据的接口需要的type
export const DATA_TYPES_FOR_V2_WAYBILLS = {
  TEMP_HUMI: 'humiture',
  LBS: 'lbs',
  SENSOR: 'sensor',
  EVENT: 'event',
};

/**
 * 对接后端接口，统一返回码code
 */
export const CODE_BACK_END = {
  SUCCESS: 0,
  FAIL: 400,
  NO_AUTHORIZATION: 401,
  REQUEST_DENY: 403,
  SERVER_ERROR: 500,
  DEVICE_ID_INVALID: 1001,
  ORDER_NOT_EXIST: 2001,
};

export const SENSOR_LABEL = {
  temp: (lan, bothTemp = false) => text(bothTemp ? 'TEMP1_LABEL' : 'TEMP_LABEL', lan),
  subTemp: lan => text('SUBTEMP_LABEL', lan),
  humi: lan => text('HUMI_LABEL', lan),
  subHumi: lan => text('SUBHUMI_LABEL', lan),
};

export const INDEX_MAP_TYPE = {
  [MESSAGE_TYPE.temp]: SENSORS.TEMP,
  [MESSAGE_TYPE.subTemp]: SENSORS.SUB_TEMP,
  [MESSAGE_TYPE.humi]: SENSORS.HUMI,
  [MESSAGE_TYPE.subHumi]: SENSORS.SUB_HUMI,
  [MESSAGE_TYPE.light]: SENSORS.LIGHT,
  [MESSAGE_TYPE.subLight]: SENSORS.SUB_LIGHT,
  [MESSAGE_TYPE.shock]: SENSORS.SHOCK,
  [MESSAGE_TYPE.openBox]: SENSORS.OPEN_BOX,
};
export const TYPE_MAP_NAME = {
  location: lan => text('LOCATION', lan), // 电子围栏
  temp: lan => text('TEMP', lan), //  温度
  preTemp: lan => text('PRE_TEMP', lan), //  温度
  humi: lan => text('HUMI', lan), // 湿度
  preHumi: lan => text('PRE_HUMI', lan), // 湿度
  shock: lan => text('SHOCK', lan), // 震动
  lowBat: lan => text('LOW_BAT', lan), // 低电量
  sensorOut: lan => text('SENSOR_OUT', lan), // 探头拔出
  flight: lan => text('FLIGHT', lan), // 飞行模式
  devBind: lan => text('DEV_BIND', lan), // 设备开始
  devUnBind: lan => text('DEV_UNBIND', lan), // 设备结束
  offLine: lan => text('OFFLINE', lan), // 设备离线
  light: lan => text('LIGHT', lan), // 光线
  subTemp: lan => text('SUB_TEMP', lan), // 辅温
  preSubTemp: lan => text('PRE_SUB_TEMP', lan), // 辅温
  subHumi: lan => text('SUB_HUMI', lan), // 辅湿
  preSubHumi: lan => text('PRE_SUB_HUMI', lan), // 辅湿
  tempRecover: lan => text('TEMP_RECOVER', lan), // 温度报警恢复
  humiRecover: lan => text('HUMI_RECOVER', lan), // 湿度报警恢复
  shockRecover: lan => text('SHOCK_RECOVER', lan), // 震动报警恢复
  flightRecover: lan => text('FLIGHT_RECOVER', lan), // 退出飞行模式
  lightRecover: lan => text('LIGHT_RECOVER', lan), // 光线报警恢复
  subTempRecover: lan => text('SUB_TEMP_RECOVER', lan), // 辅温报警恢复
  subHumiRecover: lan => text('SUB_HUMI_RECOVER', lan), // 辅湿报警恢复
  subLight: lan => text('SUB_LIGHT', lan), // 光线2报警
  subLightRecover: lan => text('SUB_LIGHT_RECOVER', lan), // 光线2报警恢复
  openBox: lan => text('OPEN_BOX', lan), // 开箱报警
  closeBox: lan => text('CLOSE_BOX', lan), // 开箱报警
};

// alarm message start @{
export const ALARM_MESSAGE_TYPE = {
  temp: 1, // 温度报警
  humi: 2, // 湿度报警
  shock: 3, // 振动报警
  lowBat: 4, // 低电报警
  openBox: 5, // 开关箱事件
  light: 10, // 光线报警
  subTemp: 11, // 辅温报警
  subHumi: 12, // 辅湿报警
  preTemp: 100, // 温度预警
  preHumi: 101, // 湿度预警
  preSubTemp: 102, // 辅温预警
  preSubHumi: 103, // 辅湿预警
};

export const INDEX_MAP_ALARM_MESSAGE_TYPE = {
  [ALARM_MESSAGE_TYPE.temp]: SENSORS.TEMP,
  [ALARM_MESSAGE_TYPE.subTemp]: SENSORS.SUB_TEMP,
  [ALARM_MESSAGE_TYPE.humi]: SENSORS.HUMI,
  [ALARM_MESSAGE_TYPE.subHumi]: SENSORS.SUB_HUMI,
  [ALARM_MESSAGE_TYPE.light]: SENSORS.LIGHT,
  [ALARM_MESSAGE_TYPE.shock]: SENSORS.SHOCK,
  [ALARM_MESSAGE_TYPE.openBox]: SENSORS.OPEN_BOX,
  [ALARM_MESSAGE_TYPE.lowBat]: 'lowBat',
  [ALARM_MESSAGE_TYPE.preTemp]: 'preTemp',
  [ALARM_MESSAGE_TYPE.preHumi]: 'preHumi',
  [ALARM_MESSAGE_TYPE.preSubTemp]: 'preSubTemp',
  [ALARM_MESSAGE_TYPE.preSubHumi]: 'preSubHumi',
};
// }@ alarm message end

// 型号对应 delaytime，pdf生成时，按照从product中取的用，如果有异常，取不到，就从本地配置中取
export const MODEL_TO_DELAYTIME = {
  A80: 30,
  T70: 0,
  S70: 0,
  A90: 30,
  T71: 0,
  B90: 30,
  B95: 30,
  B92: 30,
  B96: 30,
  B97: 30,
  B91: 30,
  B9A: 30,
  B9B: 30,
  B9C: 30,
  B98: 30,
  B99: 30,
  T72: 0,
};

// 温度探头类型: 0 只用内部 / 1 只用外部 / 2 内外部同时，只显示外部
export const TEMP_SENSOR_TYPE = {
  SENSOR_INNER: 0,
  SENSOR_OUTER: 1,
  SENSOR_IN_AND_OUTER: 2,
};
export const EXC_TEMP = 3276.7; // 0x7FFF
export const EXC_HUMI = 127; // 0x7F
export const SENSOR_EXC_DEFAULT = EXC_TEMP;
export const DEFAULT_START_DELAY_TIME = 30;
export const PUSH_STYLE = {
  ONCE_PUSH: 0,
  SCHDULE_PUSH: 1,
};
export const PUSH = {
  PUSH_TITLE: 'Frigga Track',
};

// while voltage < 0,show voltage:100
export const ModelUnUsedShowVoltage100 = ['A90'];

export const ModelLowPowerRange = {
  A90: { min: 0, max: 10 },
  T70: { min: 0, max: 10 },
  T71: { min: 0, max: 10 },
  T72: { min: 0, max: 10 },
  B90: { min: 0, max: 10 },
  B91: { min: 0, max: 10 },
  B92: { min: 0, max: 10 },
  B9A: { min: 0, max: 10 },
  B9F: { min: 0, max: 10 },
  B95: { min: 0, max: 10 },
  B96: { min: 0, max: 10 },
  B97: { min: 0, max: 10 },
  B98: { min: 0, max: 10 },
  B99: { min: 0, max: 10 },
  B9G: { min: 0, max: 10 },
  B9L: { min: 0, max: 10 },
  B9B: { min: 0, max: 10 },
  B9S: { min: 0, max: 10 },
  B9C: { min: 0, max: 10 },
  B9D: { min: 0, max: 10 },
  B9E: { min: 0, max: 10 },
};
Object.freeze(ModelLowPowerRange);

/*
model__model2__model3:{
  report:{ voltage:days}
}
*/
export const WorkTimeRelated = {
  'A90__A80__SE90__NL-100SU': {
    10: {
      100: 10,
      90: 9,
      80: 8,
      70: 7,
      60: 6,
      50: 5,
      40: 4,
      30: 3,
      20: 2,
      10: 1,
      0: 0,
    },
    20: {
      100: 20,
      90: 18,
      80: 16,
      70: 14,
      60: 12,
      50: 10,
      40: 8,
      30: 6,
      20: 4,
      10: 2,
      0: 0,
    },
    30: {
      100: 30,
      90: 27,
      80: 24,
      70: 21,
      60: 18,
      50: 15,
      40: 12,
      30: 9,
      20: 6,
      10: 3,
      0: 0,
    },
    60: {
      100: 60,
      90: 54,
      80: 48,
      70: 42,
      60: 36,
      50: 30,
      40: 24,
      30: 18,
      20: 12,
      10: 6,
      0: 0,
    },
  },
  'T70__T71__T72__T7A__T73__T74__T72B__T7B__T7C__T7H__SE71__GT2__GT2-EX__T7__GT2__T7D': {
    10: {
      100: 25,
      90: 22,
      80: 19,
      70: 16.5,
      60: 14,
      50: 11,
      40: 8,
      30: 5.5,
      20: 3,
    },
    20: {
      100: 40,
      90: 35.5,
      80: 31,
      70: 26.5,
      60: 22,
      50: 18,
      40: 13,
      30: 9,
      20: 4.5,
    },
    30: {
      100: 70,
      90: 62,
      80: 54.5,
      70: 46.5,
      60: 39,
      50: 31,
      40: 23,
      30: 15.5,
      20: 8,
    },
    60: {
      100: 120,
      90: 107,
      80: 93,
      70: 80,
      60: 66.5,
      50: 53,
      40: 40,
      30: 26.5,
      20: 13,
    },
  },
  'B90__B92__B91__B9A__B90__B9H__B9D__B9AH__BPD__B9F__NL-120MU__NL-122MU__Y9': {
    10: { 100: 10, 90: 9, 80: 8, 70: 7, 60: 6, 50: 4, 40: 3, 30: 2, 20: 1 },
    20: { 100: 20, 90: 18, 80: 16, 70: 13, 60: 11, 50: 9, 40: 7, 30: 4, 20: 2 },
    30: {
      100: 30,
      90: 27,
      80: 23,
      70: 20,
      60: 17,
      50: 13,
      40: 10,
      30: 7,
      20: 3,
    },
    60: {
      100: 60,
      90: 53,
      80: 47,
      70: 40,
      60: 33,
      50: 27,
      40: 20,
      30: 13,
      20: 7,
    },
    120: {
      100: 120,
      90: 107,
      80: 93,
      70: 80,
      60: 67,
      50: 53,
      40: 40,
      30: 27,
      20: 13,
    },
  },
  'B95__B96__B97__B9B__B9C__B98__B99__B9S__B9E__B9M__B9N__B9Y__B9J__B9H-3G__B9G__B9L__PLUS__BT3-4M__GT3__SE97__B9Z':
    {
      20: { 100: 10, 90: 9, 80: 8, 70: 7, 60: 6, 50: 4, 40: 3, 30: 2, 20: 1 },
      30: {
        100: 15,
        90: 13,
        80: 12,
        70: 10,
        60: 8,
        50: 7,
        40: 5,
        30: 3,
        20: 2,
      },
      60: {
        100: 30,
        90: 27,
        80: 23,
        70: 20,
        60: 17,
        50: 13,
        40: 10,
        30: 7,
        20: 3,
      },
      120: {
        100: 60,
        90: 53,
        80: 47,
        70: 40,
        60: 33,
        50: 27,
        40: 20,
        30: 13,
        20: 7,
      },
    },
};
Object.freeze(WorkTimeRelated);

// excel template
export const EXCEL_TEMPLATE = {
  FRIGGA: 0,
  FUXING: 1,
};
export const EXCEL_NAME_TYPE = {
  FRIGGA: {
    type: 0,
    format: '{0}_{1}.xlsx', // DEVICEID_CNT.xlsx
  },
  PERSONAL: {
    type: 1,
    format: '{0}_{1}_{2}.xlsx', // DEVICEID_PERSONAL_CNT.xlsx
  },
};
// pdf图表显示
export const PDF_CHART_TYPE = {
  TEMP_HUMI: 1, // 温度、湿度
  TEMP_SUBTEMP: 2, // 双温
  TEMP_SUBTEMP_HUMI: 3, // 双温、单湿
};
// pdf log
export const PDF_LOGO = {
  LOGO_COLOR: 'ff6600',
  LOGO_TEXT: 'Frigga',
  TYPE: {
    FRIGGA: 'frigga', // 默认
    TKMK: 'tkmk', // pass √ ， fail ×
  },
};
// pdf template

export const PDF_TEMPLATE_NAME = {
  FRIGGA: 'frigga',
  SHENGSHENG: 'shengsheng',
  BRAZIL: 'brazil',
  TAIKUN: 'taikun',
  RUSSIA_TKMK: 'russia',
  BIOTEMPAK: 'biotempak',
};
export const PDF_TEMPLATE = {
  0: PDF_TEMPLATE_NAME.FRIGGA,
  1: PDF_TEMPLATE_NAME.SHENGSHENG,
  2: PDF_TEMPLATE_NAME.BRAZIL,
  3: PDF_TEMPLATE_NAME.TAIKUN,
  4: PDF_TEMPLATE_NAME.RUSSIA_TKMK,
  5: PDF_TEMPLATE_NAME.BIOTEMPAK,
};
export const PDF_NAME_TYPE = {
  FRIGGA: {
    type: 0,
    format: '{0}_{1}_{2}.pdf', // KIKI0001_202111161726_202111171726.pdf
  },
  USAGE: {
    type: 1,
    format: '{0}-{1}-{2}-{3}.pdf', // pdfInfo.deviceId-usage-startTime-endTime.pdf    YYYYMMDDHHmmss
  },
  SHENGSHENG: {
    type: 2,
    format: '{0}{1}-{2}{3}_{4}.pdf',
  },
};
export const ALERT_STRATEGY = {
  1: 'guoshu',
  2: 'yiyao',
};

export const DEFAULT_PUBLIC_LIMIT = {
  generalView: true,
  mapView: true,
  csvExport: false,
  pdfExport: true,
};

export const RESPONSE_CODES = Object.freeze({
  // make sure code unique for mobile api
  CODES_COMMON: {
    SUCCESS: {
      code: 0,
      errorCode: '0',
      message: 'Success',
    },
    INTERNAL_ERROR: {
      code: 10004,
      errorCode: '10004',
      message: 'Internal Error!',
    },
    NOT_FOUND: {
      code: 404,
      errorCode: '404',
      message: 'Not Found!',
    },
    PARMS_ERROR: {
      code: 10005,
      errorCode: '10005',
      message: 'Params Error!',
    },
    DATA_CENTER_CONNECT_ERROR: {
      code: 503,
      errorCode: '503',
      message: 'Data center connect error!',
    },
    NO_AUTHORIZATION: {
      code: 10006,
      errorCode: '10006',
      message: 'no authorization',
    },
    JUDGE_HASH_ERROR: {
      code: 10007,
      errorCode: '10007',
      message: 'right params required',
    },
  },
  // code start with 10100
  CODES_ACTIVE_DEVICE: {
    INVALIDE_DEVICE_ID: {
      code: 10001,
      message: 'The device ID or additional code is not correct.',
    },
    DEVICE_ACTIVE_REPEAT: {
      code: 10002,
      message: 'The device has been added, no need to add again.',
    },
    IMPORTED_BY_OTHER: {
      code: 10003,
      message: 'The device has been activated by other customers.',
    },
  },
  // code start with 10100
  CODES_QUERY_DETAIL: {
    INVALIDE_DEVICE_ID: {
      code: 10100,
      message: 'Invalid device ID',
    },
    ORDER_NOT_FOUND: {
      code: 10101,
      message: 'the order does not exist',
    },
  },
  // code start with 11000
  CODES_QUERY_CHART: {
    NO_HISTORY_CHART_DATA: {
      code: 11000,
      message: 'no history chart data',
    },
  },
  // code start with 12000
  CODES_QUERY_MESSAGE: {
    NO_HISTORY_MESSAGE_DATA: {
      code: 12000,
      message: 'no history message data',
    },
  },
  // code start with 13000
  CODES_QUERY_ROUTE: {
    NO_HISTORY_ROUTE_DATA: {
      code: 13000,
      message: 'no history route data',
    },
  },
  // code start with 13010
  CODES_LOGIN: {
    PWD_ERROR: {
      code: 13010,
      message: 'pwd error',
    },
    LOCKED: {
      code: 13011,
      message: 'account locked',
    },
    PWD_EXPIRATION: {
      code: 13012,
      message: 'pwd expiration',
    },
  },
  // code start with 14000
  CODES_QUERY_REPORT: {
    NO_HISTORY_ROUTE_DATA: {
      code: 14000,
      message: 'no history report data',
    },
  },
  // code start with 15000
  CODES_FORGET_PASSWORD: {
    NO_USER: {
      code: 15000,
      message: 'The E-mail address provided is incorrect',
    },
    CODE_INVALID: {
      code: 15001,
      message: 'code not exist',
    },
    REQUEST_OUTTIME: {
      code: 15002,
      message: 'request out of time',
    },
  },
  // code start with 16000
  CODES_DEL_DEVICE: {
    SUPER_FORBIDDEN: {
      code: 16000,
      message: 'super admin forbidden ',
    },
    NO_DEVICE: {
      code: 16001,
      message: 'unkown error , can not find the device',
    },
    NO_RELATION: {
      code: 16002,
      message: 'there is no relationship between the device and login (maybe deleted already)',
    },
    NO_AHTHORITY: {
      code: 16003,
      message: 'no Authorization',
    },
  },
  // code start with 17000
  CODES_SET_PARAMS: {
    NO_DEVICE: {
      code: 17000,
      message: 'no such device, can not set',
    },
    UNIQUE_MODEL: {
      code: 17001,
      message: 'other different model exists',
    },
    SET_FAIL: {
      code: 17002,
      message: 'set params fail',
    },
    SET_FORBID: {
      code: 17003,
      message: 'set params forbidden',
    },
  },
  // code start with 17100
  CODES_GET_PARAMS: {
    NO_DEVICE: {
      code: 17100,
      message: 'no such device, can not get',
    },
  },
  // code start with 18000
  CODES_ADD_MODEL: {
    MODEL_EXIST: {
      code: 18000,
      message: 'the model has already been added',
    },
  },
  // code start with 18100
  CODES_SEARCH_MODEL: {
    MODEL_NOT_EXIST: {
      code: 18100,
      message: 'no such model',
    },
  },
  // code start with 18200
  CODES_EXPORT_EXCEL: {
    DEVICE_NULL: {
      code: 18200,
      message: 'empty devices list',
    },
    DEVICES_TOO_MANY: {
      code: 18201,
      message: 'too many devices ,something will go wrong, please export less devices',
    },
  },
  // code start with 18300
  CODES_SEARCH_DEVICE: {
    DEVICE_NOT_EXIST: {
      code: 18300,
      message: 'device not exist',
    },
    DEVICE_CAN_NOT_FIND: {
      code: 18301,
      message: 'device not found',
    },
  },
  // code start with 18400
  CODES_EMAIL_CONFIG: {
    EMAIL_EXIST: {
      code: 18400,
      message: 'the email has already been added',
    },
    EMAIL_NOT_EXIST: {
      code: 18401,
      message: 'no such email address',
    },
  },
  // code start with 18500
  CODES_IMPORT_DEVICES: {
    DEVICE_EXIST: {
      code: 18500,
      message: 'the device has already been added',
    },
    MODEL_NOT_EXIST: {
      code: 18501,
      message: 'the device model not exist',
    },
  },
  // code start with 18550
  CODES_ORDER_FILE_UPLOAD: {
    DEVICE_NOT_EXIST: {
      code: 18550,
      message: 'the device does not exist',
    },
    USER_RELATION_NOT_EXIST: {
      code: 18551,
      message: 'the relationship between customer and user is not found',
    },
    USER_NOT_OWN_DEVICE: {
      code: 18552,
      message: 'user does not own the device',
    },
    USER_NOT_EXIST: {
      code: 18553,
      message: 'user does not exist',
    },
    IS_DUE: {
      code: 18554,
      message: 'the right of uploading file has been already due',
    },
    MAX_LIMIT: {
      code: 18555,
      message: 'reach the max files limit',
    },
  },
  // code start with 18570
  CODES_BATCH_ASSGIN_DEVICES: {
    NO_AHTHORITY: {
      code: 18570,
      message: 'no Authorization',
    },
    ALL_DEVICES_NOT_RELATED: {
      code: 18571,
      message:
        'all devices can not be supported to be assigned,having no  relationship with the owner',
    },
    ALL_ACCOUNT_NOT_EXIST: {
      code: 18572,
      message: 'all acccounts are not exist',
    },
    ALL_ACCOUNT_NO_RELATION_WITH_OWNER: {
      code: 18573,
      message: 'all acccounts have no relationship with the owner',
    },
    PARAMS_ERROR: {
      code: 18574,
      message: 'params error,please check!',
    },
    LOGINER_HAS_NO_RELATION_WITH_PARENT: {
      code: 18575,
      message: 'there is no relation between login account with the admin to be assigned',
    },
    KEY_ASSIGN_RESULT_TER_NO_RELATION: {
      code: 18576,
      message: 'device does not belong to the distributor account',
    },
    KEY_ASSIGN_RESULT_USER_NO_RELATION: {
      code: 18577,
      message: 'user account does not belong to the distributor account',
    },
    KEY_ASSIGN_RESULT_CUSTOMER_NO_RELATION: {
      code: 18578,
      message: 'customer account does not belong to the distributor account',
    },
    KEY_ASSIGN_RESULT_BREAK_RANK_NOT_ALLOW: {
      code: 18579,
      message: 'only direct parent-son relation is allowed to be assigned',
    },
    KEY_ASSIGN_RESULT_ACCOUNT_NOT_EXIST: {
      code: 18580,
      message: 'user account not exit',
    },
    KEY_ASSIGN_RESULT_ASSIGNED_ALREADY: {
      code: 18581,
      message: 'device has been assigned to other account',
    },
  },
  // code start with 18590
  CODES_EXPORT_EXCEL_ANALYSIS: {
    NO_MARKET: {
      code: 18590,
      message: 'user not exist',
    },
    NO_DEVICES: {
      code: 18591,
      message: 'no devices exist below',
    },
    NO_ORDERS: {
      code: 18592,
      message: 'no orders exist',
    },
  },
  // code start with 18610
  CODES_DELETE_USER: {
    NO_AUTHORIZATION: {
      code: 18610,
      message: 'no authorization',
    },
    USERS_BELOW_EXISTS: {
      code: 18611,
      message: 'There are still users under the company',
    },
    SUPPLIER_BELOW_EXISTS: {
      code: 18612,
      message: 'There are still suppliers under the market',
    },
  },
  // code start with 18630
  CODES_CREATE_USER: {
    COMPANY_UNIQUE: {
      code: 18630,
      message: 'company name is not unique!',
    },
    EMAIL_UNIQUE: {
      code: 18631,
      message: 'email is not unique!',
    },
    USERS_LIMIT: {
      code: 18632,
      message: 'Unable to create more users',
    },
  },
  // code start with 18640
  CODES_MODIFY_USER: {
    NO_CHANGE: {
      code: 18640,
      message: 'modify info has no change',
    },
  },
  // code start with 18650
  CODES_CLUSTER: {
    DUPLICATE_CLUSTER_NAME: {
      code: 18650,
      message: 'name is not unqiue',
    },
    DUPLICATE_STORE_NAME: {
      code: 18651,
      message: 'name is not unqiue',
    },
  },
  // code start with 18660
  CODES_ENDORSEMENT: {
    DUPLICATE_EST_NAME: {
      code: 18660,
      message: 'same endorsement exists',
    },
    ORDER_NOT_END: {
      code: 18661,
      message: 'order not end',
    },
    EST_OWNER_NOT_FOUND: {
      code: 18662,
      message: 'owner not found',
    },
    EST_NOT_FOUND: {
      code: 18663,
      message: 'endorsement not found',
    },
    ORDER_NOT_FOUND: {
      code: 18664,
      message: 'order not found',
    },
  },
  // code start with 18670
  CODES_USER: {
    DUPLICATE_PASSWORD: {
      code: 18670,
      message: 'password duplicated',
    },
  },
  CODES_START_JOURNEY: {
    EXPECT_BIND_TIME_EARLIER_THAN_UNBIND: {
      code: 18670,
      message: 'expectBindTime is earlier than the end time of the previous order',
    },
    EXPECT_BIND_TIME_NOT_IN_RANGE: {
      code: 18671,
      message: 'Expected stat time you selected is not in valide range(30 days before now)',
    },
  },
  // code start with 18680
  CODES_PROJECTS: {
    OWNER_PROJECT_NO_RELATION: {
      code: 18680,
      message: 'There is no relationship between your account and the project',
    },
    DUPLICATE_RELATION: {
      code: 18681,
      message: 'There has already existed the device',
    },
    PROJECT_DEVICE_MODEL_NOT_UNIQUE: {
      code: 18682,
      message: 'Same model required ,model existed below project and devices to be assigned',
    },
    PROJECT_ASSIGNED_DEVICES_MODEL_NOT_UNIQUE: {
      code: 18683,
      message: 'Devices to be assigned should be same model',
    },
    DEVICE_NOT_EXISTED_IN_PROJECT: {
      code: 18684,
      message: 'Device has not existed below project',
    },
    PROJECT_EXISTED_ALREADY: {
      code: 18685,
      message: 'Project already existed below the user',
    },
    PROJECT_ASSIGNED_ADMIN_ALREADY: {
      code: 18686,
      message: 'Project already assigned to other customer',
    },
    PROJECT_DEVICE_ASSIGNED_ADMIN_ALREADY: {
      code: 18687,
      message: 'Device below the project already assigned to other customer,please check',
    },
    PROJECT_DEVICES_OUT_OF_MAX: {
      code: 18688,
      message: 'Devices assigned reach count limitation',
    },
  },
  // code start with 18700
  CODES_REGIST: {
    // 10001 10002 10003 is compatible with old logic
    REGIST_EMAIL_HAD_REGISTED: {
      code: 10001,
      message: 'The e-mail has been registered',
    },
    REGIST_WAIT_FOR_APPROVAL: {
      code: 10002,
      message: 'Registration information has been submitted, please wait for approval',
    },
    REGIST_VCODE_LIMIT: {
      code: 10003,
      message: 'Only one verification code can be obtained in 5 minutes',
    },
  },
});

export const MAX_EXCEL_BATCH_EXPORT = 50; // limit the number of excel batch exporting
export const MAX_EXCEL_BUFFER_SIZE = 63892533;

export const SENSORS_ALL = [
  'temp',
  'subTemp',
  'humi',
  'subHumi',
  'light',
  'subLight',
  'shock',
  'angle',
];
export const ALTER_STATUS = {
  abnormal: -1, // 异常  ：探头问题  // 暂时没用，前端需要统一一个探头异常状态
  noChange: 0, // 无变化状态
  normal: 1, // 正常
  high: 2, // 偏高
  low: 3, // 偏低
  fenceAlert: 4, // 电子围栏报警
  tempAlarm: 5, // 温度探头异常
  humiAlar: 6, // 支付探头异常
  yiyaoTempAlert: 7, // 医药温度报警
  openBoxAlert: 1, // 开箱报警
  openBoxDefault: 0, // 开箱报警默认值--非报警
};
export const pdfPath = filePath('/file/');
export const PDF_DIR = filePath('/file/PDF');
export const CSV_DIR = filePath('/file/CSV');
export const EXCEL_DIR = filePath('/file/EXCEL');
export const PDF_CONFIG = {
  PDF_ARCHIVE_FORMAT: 'YYYY-MM-DD',
  GENERATE_TYPE: {
    FILE: 1,
    BLOB: 2,
  },
  POP: {
    NEED_POP: false,
    POP_INTERVAL: 3,
  },
};
export const EXPORT_TYPE = {
  PDF: 'PDF',
  EXCEL: 'EXCEL',
  CSV: 'CSV',
};
export const EXPORT_STYLE = {
  COMMON_EXPORT: 0,
  LBS_EXPORT: 1,
};

export const SET_FROM = {
  WEB_SITE: 1,
  OUTER_API: 2,
  CMS_IMPORT: 3, // cms上客制化的assignParamSet界面，bright，设备分配后设置一下用户报警号码以及报警邮箱
};
export const DEFAULT_USER_LIMIT = {
  allSettingPermit: 1,
  idleSettingPermit: 0,
  allSettingForbid: 0,
  settingAndEndForbid: 0,
};
export const SETTING_LIMIT = {
  ALL_PERMIT: 1,
  IDLE_PERMIT: 2,
  ALL_FORBIT: 3,
};
export const LIMITATION = {
  PERMIT: 1,
  FORBIT: 0,
};
export const FDA_LIMIT = {
  SIGN: 0,
  DELETE: 0,
  AUDIT_VIEW: 0,
};
export const ACCOUNT_LOCK_STATUS = {
  LOCKED: 1,
  UNLOCK: 0,
};

export const DEFAULT_ALERTS_TIME = {
  from: {
    hour: 9,
    minute: 0,
  },
  to: {
    hour: 18,
    minute: 0,
  },
  weekList: ['1', '2', '3', '4', '5'],
  anyTimeAlert: true,
};

export const MD5_SALTS = {
  MD5_SALT_HOUDUA: 'QvI3dgrDspBNKuZ6EMDK',
  MD5_SALT_CMS: 'friggacms001',
  MD5_SALT_QIANDUAN: 'QvI3dgrDspBNKuZ6EMDK',
};
export const ALERT_STRATEGY_TYPE = {
  GUOSHU: 1,
  YIYAO: 2,
};
export const ALERT_TYPE = {
  0: (lan = _cfg.frigga.language) => text('KEY_ALERT_TYPE_CONTINUOUS', lan),
  1: (lan = _cfg.frigga.language) => text('KEY_ALERT_TYPE_CUMULATIVE', lan),
};

// 医药pdf中支持展示的图表类型
export const PDF_YIYAO_SUPPORT = ['temp', 'subTemp', 'humi'];
export const DEFAULT_PDF_LANGUAGE = 'en';
export const DEFAULT_SUPPOERT_MANUAL_STOP = 0;
export const NO_MANUAL_STOP = 0;
export const DEFAULT_SUPPORT_OPENBOX = 0;

export const MKT_PARAMS = {
  K: 273.1, // 转开尔文 的固定值 （T+K即为开尔文）
  δH: 10, // delta_H / R 83.14472/8.3144
};
//  '0允许解绑 1 已下发解绑 2不允许解绑'
// TODO: 哪个晓得，这么命名与枚举有这层关系，命名需要改变一下，不过涉及web，server，cms
export const END_TYPE = {
  PERMIT_END: 0,
  RELEASE_END: 1,
  FORBID_END: 2,
};
// 解绑方式
export const UNBIND_TYPE = {
  UNKOWN: 0, // 未知 （默认 -老数据全部默认
  OPEN_BOX: 1, // 开箱超时后自动解绑（多协）  OpenBox
  TIMES_LIMIT: 2, // 设备自动解绑（发送次数），  Times Limit
  KEY: 3, // 按键解绑，      Key
  WEB: 4, // 平台解绑
  TER_USB: 5, // 设备USB解绑  对应 设备上报的
  EXPIRED: 6, // 设备自动解绑（到期）,   Expired
  API: 7, // 客户API 解绑,      API
  APP: 8, // 手机端APP解绑      APP
  LOCATION: 9, // 到达位置(自动)解绑    Location
  LOW_BAT: 10, // 低电量自动解绑     Low Power
  ABNORMAL_AUTO: 11, // 异常运单，自动填充解绑时间
  ABNORMAL_BIND: 30, // 异常绑定运单
  ABNORMAL_UNBIND: 31, // 异常解绑运单
};
export const UNBIND_TYPE_MAP_NAME = {
  [UNBIND_TYPE.UNKOWN]: () => '--',
  [UNBIND_TYPE.OPEN_BOX]: (lan = _cfg.frigga.language) => text('KEY_UNBIND_TYPE_OPENBOX', lan),
  [UNBIND_TYPE.TIMES_LIMIT]: (lan = _cfg.frigga.language) =>
    text('KEY_UNBIND_TYPE_TIME_LIMIT', lan),
  [UNBIND_TYPE.KEY]: (lan = _cfg.frigga.language) => text('KEY_UNBIND_TYPE_MANUAL', lan),
  [UNBIND_TYPE.WEB]: (lan = _cfg.frigga.language) => text('KEY_UNBIND_TYPE_PLATFORM', lan),
  [UNBIND_TYPE.TER_USB]: (lan = _cfg.frigga.language) => 'USB',
  [UNBIND_TYPE.EXPIRED]: (lan = _cfg.frigga.language) => text('KEY_UNBIND_TYPE_EXPIRED', lan),
  [UNBIND_TYPE.API]: (lan = _cfg.frigga.language) => text('KEY_UNBIND_TYPE_API', lan),
  [UNBIND_TYPE.APP]: (lan = _cfg.frigga.language) => text('KEY_UNBIND_TYPE_APP', lan),
  [UNBIND_TYPE.LOCATION]: (lan = _cfg.frigga.language) => text('KEY_UNBIND_TYPE_LOCATION', lan),
  [UNBIND_TYPE.LOW_BAT]: (lan = _cfg.frigga.language) => text('KEY_UNBIND_TYPE_LOW_BAT', lan),
  [UNBIND_TYPE.ABNORMAL_AUTO]: (lan = _cfg.frigga.language) =>
    text('KEY_UNBIND_TYPE_ABNORMAL_AUTO', lan),
  [UNBIND_TYPE.ABNORMAL_BIND]: (lan = _cfg.frigga.language) =>
    text('KEY_UNBIND_TYPE_ABNORMAL_AUTO', lan),
  [UNBIND_TYPE.ABNORMAL_UNBIND]: (lan = _cfg.frigga.language) =>
    text('KEY_UNBIND_TYPE_ABNORMAL_AUTO', lan),
};
// alert的别名
export const ALERT_LABEL = {
  temp: (lan = _cfg.frigga.language) => ({
    0: '',
    1: text('KEY_TEMP_ALIAS1', lan),
    2: text('KEY_SUB_TEMP_ALIAS1', lan),
  }),
  subTemp: (lan = _cfg.frigga.language) => ({
    0: '',
    1: text('KEY_SUB_TEMP_ALIAS1', lan),
    2: text('KEY_TEMP_ALIAS1', lan),
  }),
  humi: (lan = _cfg.frigga.language) => ({
    0: '',
    1: text('KEY_HUMI_ALIAS1', lan),
    2: text('KEY_SUB_HUMI_ALIAS1', lan),
  }),
  subHumi: (lan = _cfg.frigga.language) => ({
    0: '',
    1: text('KEY_SUB_HUMI_ALIAS1', lan),
    2: text('KEY_HUMI_ALIAS1', lan),
  }),
  shock: (lan = _cfg.frigga.language) => ({
    0: '',
  }),
  angle: (lan = _cfg.frigga.language) => ({
    0: '',
  }),
  light: (lan = _cfg.frigga.language) => ({
    0: '',
  }),
  subLight: (lan = _cfg.frigga.language) => ({
    0: '',
  }),
};

export const PDF_LAN_TO_TER = {
  zh: 0, // 中文
  en: 1, // 英文
  ru: 2, // 俄语
  pt: 3, // 葡萄牙
};
// 获取供应商 goods 列表信息. flag: 0 -> 已added, 1 ->未add
export const FETCH_GOODS_FLAG = {
  ADDED: 0,
  NOT_ADDED: 1,
};

// 服务器下发绑定的状态
export const START_STATUS = {
  NOT_PUSH_START: 0, // 未下发
  START_ING: 1, // 下发后 未绑定 （绑定中）
  STARTED: 2, // 已经绑定
};

export const INNER_NOTITY_TYPE = {
  NO_MAILS: 1,
  DATA_CHECK: 2,
};

export const EMAIL_CONFIG = {
  SEND_TYPE: {
    ALARM: 1, // 专门发报警的
    REGISTER: 2, // 专门发注册的
    SUPPORT: 3, // 专门 help的
    UPWORD: 4, // 修改密码
    ALL: 10, // 所有的都能发
  },
  WORK_STATUS: {
    WORK: 1,
    NOT_WORK: 0,
  },
  STATUS: {
    NORMAL: 0, // 正常状态（正常状态也可以是不工作状态）
    EXCEED: 1, // 超量监测状态 超出一天可发的量了（1000）
    REJECT: 2, // 超频监测状态 频率太大了（每15分钟不得超过500封，需要再隔15分钟才能用）
    INVALID: 3, // 这种状态，也就是不能再用了（手动置为不可工作状态，也变成此status）
    BAOLIU: 4, // 保留状态，单独给某种类型的邮件使用（eg：保留几十封发件量给注册邮件使用）
  },
  DAILY_LIMIT: 1000, // 目前服务器运营商说一天1000封
  EXCEPTION_LIMIT: 2, // 未知异常超过两次，邮箱置为不可用
  RETRY_LIMIT: 3, // 被发送邮件重试次数限制，超过三次，打入失败列表，不再发送
  EXCEED_LIMIT: 2, // 超过每天限制的次数，我们给一次尝试的机会 因为我们有统计个数，所以，给两次机会也足够了

  VCODE_TYPE: {
    UPDATE_PWD: 1,
    REGIST: 2, // 暂时不从UserApproval中剥离，其中还记录着用户的注册信息，需要发内部审核邮件进行查看回填数据
  },
  ALERT_EMAILS_LIMIT: 10, // 报警邮件限制条数,只允许发送前多少条收件人
};

export const EMAIL_RESPONSE_CODE = {
  SUCCESS: 1,
  INVALID_LOGIN: {
    CODE: 460,
    MESSAGE: 'Invalid login: 460 ERR.LOGIN.PASSERR',
  },
  DAILY_LIMIT: {
    CODE: 554,
    MESSAGE: 'You have exceed daily message limit,for single send email',
  },
  DAILY_LIMIT_GROUP: {
    CODE: 550,
    MESSAGE: 'You have exceed daily message limit,for group send email',
  },
  TOO_MANY_REJECT: {
    CODE: 421,
    MESSAGE: 'Your IP is rejected because of too many concurrent SMTP connections',
  },
  INVALID_LOGIN2: {
    CODE: 451,
    MESSAGE: 'send email first error: Invalid login: 451 4.3.2 Internal server error',
  },
};

export const REACT_CODES = {
  SMTP_IP_ONETIME_TOO_MANY: '421 4.4.5 HL:ICC',
  SMTP_IP_15_MINS_TOO_MANY: '421 4.5.0 HL:IFC',
  IP_SEND_MAIL_SHORT_TIME_TOO_MANY: '421 HL:IFC',

  IP_RECEPIENT_TOO_MANY: '450 4.5.3 RP:DRC',

  ACCOUNT_15_MINS_SEND_TOO_MANY: '451 MI:SFQ',
  ACCOUNT_SHORT_TIME_RECEIVER_TOO_MANY: '451 RP:QRC',
  ACCOUNT_TEMP_FORBIDEN: '451',

  ERR_LOGIN_PASSER: '460',

  RECEPIENT_TOO_MANY: '550 RP:RCL ',
  RECEPIENT_DAILY_LIMIT_NOT_WORK: '550 RP:TRC',
  RECEPIENT_NOT_FOUND: '550 5.1.1',

  SMTP_IP_DAILY_LIMIT: '554 5.7.3 HL:ITC',
  ACCOUNT_BLOCK_IN_BLACKLIST: '554 MI:SPB',
  ACCOUT_DAILY_LIMIT_NOT_WORK1: '554 5.5.0 MI:STC',
  ACCOUT_DAILY_LIMIT_NOT_WORK2: '554 5.5.3 RP:TRC',
  UNKOWN: 'unkown',
};

//* responseCode会有相同，与网易方沟通，需要通过response去匹配，所以考虑用正则去匹配出现的规则
//* 如果这里的正则匹配不到，那就用上面的去匹配responseCode
const EMAIL_ERROR_CODES = {
  //! 421
  421: [
    {
      // 421 4.4.5 HL:ICC
      CODE_REG: /421.*HL:ICC/g,
      MESSAGE: '发信IP同时间SMTP连接的个数超过服务器限制，降低IP并发连接数量',
      CODE: REACT_CODES.SMTP_IP_ONETIME_TOO_MANY,
    },
    {
      // 421 4.5.0 HL:IFC
      CODE_REG: /421.*HL:IFC/g,
      MESSAGE: '发信IP在过去15分钟内SMTP连接的个数超过服务器限制',
      CODE: REACT_CODES.SMTP_IP_15_MINS_TOO_MANY,
    },
    {
      // 421 HL:IFC
      CODE_REG: /421.*HL:IFC/g,
      MESSAGE: ' 该IP短期内发送了大量信件，超过了网易的限制，被临时禁止连接',
      CODE: REACT_CODES.IP_SEND_MAIL_SHORT_TIME_TOO_MANY,
    },
    {
      // 兜底的，只要判断有这个就做默认响应处理
      CODE_REG: /421.*/g,
      MESSAGE: ' 该IP短期内发送了大量信件，超过了网易的限制，被临时禁止连接',
      CODE: REACT_CODES.IP_SEND_MAIL_SHORT_TIME_TOO_MANY,
    },
  ],

  //! 450
  450: [
    {
      // 450 4.5.3 RP:DRC
      CODE_REG: /450.*RP:DRC/g,
      MESSAGE: '当前连接发送的收件人数量超出限制。请控制每次连接投递的邮件数量',
      CODE: REACT_CODES.IP_RECEPIENT_TOO_MANY,
    },
    {
      // 兜底的，只要判断有这个就做默认响应处理
      CODE_REG: /450.*/g,
      MESSAGE: '当前连接发送的收件人数量超出限制。请控制每次连接投递的邮件数量',
      CODE: REACT_CODES.IP_RECEPIENT_TOO_MANY,
    },
  ],

  //! 451
  451: [
    {
      // 451 4.3.2
      CODE_REG: /451 4.3.2/g,
      MESSAGE_TYPE: '这个是临时性的问题，可以稍后重新请求一次',
      CODE: REACT_CODES.ACCOUNT_TEMP_FORBIDEN,
    },
    {
      // 451 MI:SFQ
      CODE_REG: /451.*MI:SFQ/g,
      MESSAGE: '发信人在15分钟内的发信数量超过限制，请控制发信频率；',
      CODE: REACT_CODES.ACCOUNT_15_MINS_SEND_TOO_MANY,
    },
    {
      // 451 RP:QRC
      CODE_REG: /451.*RP:QRC/g,
      MESSAGE:
        '发信方短期内累计的收件人数量超过限制，该发件人被临时禁止发信。请降低该用户发信频率；',
      CODE: REACT_CODES.ACCOUNT_SHORT_TIME_RECEIVER_TOO_MANY,
    },
    {
      // 兜底的，只要判断有这个就做默认响应处理
      CODE_REG: /451.*/g,
      MESSAGE:
        '发信方短期内累计的收件人数量超过限制，该发件人被临时禁止发信。请降低该用户发信频率；',
      CODE: REACT_CODES.ACCOUNT_TEMP_FORBIDEN,
    },
  ],

  //! 460
  460: [
    {
      CODE_REG: /460.*/g,
      MESSAGE: 'Invalid login: 460 ERR.LOGIN.PASSERR',
      CODE: REACT_CODES.ERR_LOGIN_PASSER,
    },
  ],

  //! 550
  550: [
    {
      CODE_REG: /550.*RP:RCL/g,
      MESSAGE: '群发收件人数量超过了限额，请减少每封邮件的收件人数量',
      CODE: REACT_CODES.RECEPIENT_TOO_MANY,
    },
    {
      CODE_REG: /550.*RP:TRC/g,
      MESSAGE:
        '发件人当天内累计的收件人数量超过限制，当天不再接受该发件人的邮件。请降低该用户发信频率',
      CODE: REACT_CODES.RECEPIENT_DAILY_LIMIT_NOT_WORK,
    },
    {
      CODE_REG: /550 5.1.1/g,
      MESSAGE: '收件人不存在',
      CODE: REACT_CODES.RECEPIENT_NOT_FOUND,
    },
    {
      // 兜底的，只要判断有这个就做默认响应处理
      CODE_REG: /550.*/g,
      MESSAGE:
        '发件人当天内累计的收件人数量超过限制，当天不再接受该发件人的邮件。请降低该用户发信频率',
      CODE: REACT_CODES.RECEPIENT_DAILY_LIMIT_NOT_WORK,
    },
  ],

  //! 554
  554: [
    {
      // 554 5.7.3 HL:ITC
      CODE_REG: /554.*HL:ITC/g,
      MESSAGE: '发信IP今日SMTP连接的个数超过服务器限制',
      CODE: REACT_CODES.SMTP_IP_DAILY_LIMIT,
    },
    {
      // 554 MI:SPB
      CODE_REG: /554.*MI:SPB/g,
      MESSAGE: '发信帐号被列入系统黑名单',
      CODE: REACT_CODES.ACCOUNT_BLOCK_IN_BLACKLIST,
    },
    {
      // 554 5.5.0 MI:STC
      CODE_REG: /554.*MI:STC/g,
      MESSAGE: '发信帐号今日连接服务器发送的邮件数量超过服务器限制',
      CODE: REACT_CODES.ACCOUT_DAILY_LIMIT_NOT_WORK1,
    },
    {
      //  554 5.5.3 RP:TRC
      CODE_REG: /554.*RP:TRC/g,
      MESSAGE: '邮箱地址今日连接服务器发送的邮件数量超过服务器限制',
      CODE: REACT_CODES.ACCOUT_DAILY_LIMIT_NOT_WORK2,
    },
    {
      //  554 兜底的，只要判断有这个就做默认响应处理
      CODE_REG: /554.*/g,
      MESSAGE: '邮箱地址今日连接服务器发送的邮件数量超过服务器限制',
      CODE: REACT_CODES.ACCOUT_DAILY_LIMIT_NOT_WORK1,
    },
  ],
};

// 事件类型
export const EVENT_TYPE = {
  BOX: 0, // 开关箱事件
  AIRPLANE: 2,
  LOW_BAT: 3,
  SHOCK: 4, // 震动事件
};

// 设备状态
export const DEVICE_STATS = {
  // TODO: 因为各个状态之间没有预留空间，所以，插入其他状态不容易，以后再考虑重新定义状态吧，completed暂时取-1，因为排序，需要预idle同级
  completed: -1, // 单次设备运输完成
  idle: 0, // 已解绑
  active: 1, // 绑定未解绑  正常状态
  warn: 2, // 告警
  offline: 3, // 离线
  flight: 4, // 飞行
  expire: 1000, // 过期设备
  error: 1024, // 预留
};

export const DETECTOR_STATUS = {
  noChange: 0, // 未变化状态
  normal: 1, // 正常
  exception: 2, // 探头异常
  restore: 3, // 探头恢复
  unknown: -99, // 位置状态，不做处理
};

export const SEARCH_LIKE_MODEL = {
  HEAD_MATCH: 1, // XXX%
  TAIL_MATCH: 2, // %XXX
  ALL_MATCH: 3, // %XXX%
};

export const USER_INFO = {
  ROLE: {
    ADMIN: 1, // 管理员
    USER: 2, // 用户
  },
  CREATE_TYPE: {
    CREATE_BY_SUPER: 0, // 管理员创建
    REGIST: 1, // 用户注册
  },
  SUPER_ID: 1, // 超级管理员id
  CUSTOMER_STATUS: {
    // Customer表中status的标识
    NORMAL: 0, // 正常默认状态
    DELETED: 2, // 删除状态，逻辑删除
  },
  IDENTITY: {
    DEFAULT_FRIGGA_COMMON: 0, // 默认frigga用户
    MARKET: 1, // walmart等market账户
    SUPPLIER: 2, // supplier账户
    GROUP: 3, // 冷库账户
    SUPER_SUPPORT: 4, // 超管客服账户
  },
};

export const FILES_UPLOAD = {
  CNT_LIMIT: 10,
  EXIST_TIME: 3 * 31 * 24 * 60 * 60, // 秒： 3个月
  // EXIST_TIME: 10 * 60, // 秒：测试10分钟过期
  FROM: {
    UNKNOWN: 0,
    RUNNING: 1,
    REPORT: 2,
  },
};

export const LICENSE = {
  SINGLE: 0, // 单次设备
  MULTI_USE: 1, // 多次设备
};

export const PUSH_WEB = {
  // 推送给哪个平台（哪套皮）
  CLIENT: {
    ALL: 1,
    FRIGGA: 2,
    LOGTAG: 3,
    MAXI: 4,
    RTM: 5,
    SHIELD: 6,
    SIMINN: 7,
    TEMPAK: 8,
    TEMPILOT: 9,
    TERMO: 10,
  },
  BROAD_TYPE: {
    ALL: 1, // 广播
    CERTAIN: 2, // 定向
  },
  PUSH_TYPE: {
    SYSTEM: 1, // 系统消息
  },
  // server与client通信的key
  EVENT: {
    COMMON: 'common_event',
    CLIENT_JOIN: 'client_join', // client连接到server后，会发送client的相关信息给到server，查看最新通知
    LATEST_MSG: 'latest_msg', // server收到client的join推送后，会查最新推送，返回给client，供其判断展示
    NOTIFY_IP: 'notify_ip', // client连接到server后，server告知client，其ip是多少
  },
};

export const ORDER_STATS = {
  idle: 0,
  running: 1,
  warn: 2,
  error: 3,
  flight: 4,
  EXPIRE: 5,
};
export const ORDER_CURRENT = {
  idle: 0,
  running: 1,
};
export const TTL = {
  mobile: 100 * 365 * 24 * 60 * 60, // 100years
};
export const CONSTANTS = Object.freeze({
  TTL,
  ORDER_STATS,
  ORDER_CURRENT,
  ORDER_STATS_ACTIVES: [ORDER_STATS.running, ORDER_STATS.warn],

  // 消息类型
  MESSAGE_NOTICE_TYPE: {
    ALARM: 'alarm',
    NOTICE: 'notice',
    RECOVER: 'recover',
  },
  // 推送类型
  PUSH_TYPE: {
    NOTICE: 1,
  },
  REPORT_STATS: {
    PASS: 0,
    ALARM: 1,
  },
  DEVICE_LISENCE: {
    // 设备类型
    once: 0, // 一次
    permanent: 1, // 多次
    expiry: 2, // 有期限
  },
  PID_ALERT_TYPES: {
    16: ['temp', 'temp', 'humi', 'humi'], // PID_DATA_TH (0x10)		// 数据：温湿度
    27: ['temp'], // PID_DATA_T (0x1B)    // 数据：单温
    19: ['light'], // PID_DATA_EXP (0x13) 			// 数据：光曝
    20: ['shock'], // PID_DATA_VIBRATE (0x14) 		// 数据：振动
    21: [], // PID_DATA_ANGLE (0x15) 			// 数据：倾角
    22: [], // PID_DATA_BAROME (0x16) 			// 数据：气压
    23: [], // PID_DATA_ALTITUDE (0x17) 		// 数据：高度
  },
  PID: {
    RESERVED: 0x00, // (0x00,"reserved","无"),    0
    POWERON: 0x01, // (0x01, 'powerOn', '终端开机'),     1
    BIND: 0x02, // (0x02, 'bind', '订单绑定'),      2
    UNBINDSRV: 0x03, // (0x03, 'unbindSrv', '订单解绑 (服务器发起)'),         3
    UNBINDTER: 0x04, // (0x04, 'unbindTer', '订单解绑 (终端发起 终端发起 )'),       4
    SYS: 0x05, // (0x05, 'sys', '服务器下发参数'),        5
    FOTA: 0x06, // (0x06, 'updateVer', '版本升级'),        6
    FENCE: 0x07, // (0x07, 'fence', '终端是否在电子围栏中'),    7
    AIRPLANE: 0x08, // (0x08, 'flightMode', '飞行模式'),   8
    ORDER: 0x09, // (0x09, 'order', '订单信息下发'),    9
    TH: 0x10, // (0x10, 'th', '数据：温湿度'),   16
    GPS: 0x11, // (0x11, 'gps', '数据：Gps'),  17
    LBS: 0x12, // (0x12, 'lbs', '数据：LBS'),   18
    EXP: 0x13, // (0x13, 'exp', '数据：光曝'),   19
    VIBRATE: 0x14, // (0x14, 'vibrate', '数据：振动'),  20
    ANGLE: 0x15, // (0x15, 'angle', '数据：倾角'), 21
    BAROME: 0x16, // (0x16, 'barome', '数据：气压'),    22
    ALTITUDE: 0x17, // (0x17, 'altitude', '数据：高度'),     23
    PING: 0x18, // (0x18, 'ping', '数据：心跳'),    24
    EVENT: 0x19, // (0x19, 'event', '数据：事件'),   25
    BTPRINTEVENT: 0x1a, // (0x1a, 'btprint', '数据：蓝牙打印事件'),    26
    SINGLET: 0x1b, // (0x1b, 'signlet', '数据：单温'),      27
    EXP: 0x1c, // (0x1c, 'EXP', '数据：光曝'),  28
    ADDITIONAL: 0x1d, // (0x1d, 'additional', '附加系统设置参数'),   29
    LIGHT2: 0x1e, // (0x1e, 'light2', '光线2'),  30
    SILENCE: 0x27, // (0x27, 'silence', '下发进入静默模式特征值'),  39
    SS_SYS: 0x23, // (0x23, '', '生生物流参数，包含projectid 项目号'),  35
    VIB: 0x2c, // 震动报警，新增，以前走0x1c  44
    PRE_ALERT: 1000, // 预报警推送
    API_SYS: 58, // 外部api推送pid 5的参数 (比如生生)
    RECENT_REPORT_DEVICES: 105, // 批量推送最近上报数据的设备列表以及上报时间
    UNKOWN: 1, // (-1, 'unkown', '未知'),
  },
  DATA_STATUS: {
    active: 1, // 正常状态
    del: 2, // 删除状态
  },
  ORDER_MYSQL_KEY: {
    temp: {
      status: 'tempStatus',
    },
    humi: {
      status: 'tempStatus',
    },
  },
  DEVICE_EXPIRE_DATE: 30 * 24 * 60 * 60 * 1000,
  DEVICE_DUE_DAY: 30,
  DEVICE_DUE_STATUS: {
    normal: 0, // 未过期
    due: 1, // 过期
  },
  DEVICE_WILL_DUE_STATUS: {
    default: 0, // 非即将过期
    wilDue: 1, // 即将过期
  },
  DEVICE_QUERY_TYPE: {
    active: 1, // 查询未过期数据
    expire: 2, // 查询过期数据
    all: 3, // 查询所有数据
    idle: 4, // 查询所有未在运设备
    forbid: 5, // 不允许查询任何设备
    willdue: 6, // 即将过期
  },
  ANALYSIS_TYPE: {
    idle: 0, // 停运设备
    running: 1, // 在运设备
    warn: 2, // 告警设备
    flight: 3, // 设备处于飞行模式
    expire: 4, // 过期设备
  },
  /*
    最开始的定义，按照的是上报的status的值入库的 
    default: 0, // 默认状态
    flightNo: 1, // 正常状态
    flightAwait: 2, // 待进入飞行模式
    flightOk: 3, // 飞行模式中 */
  FLIGHT_STATUS: {
    no: 0, // 正常状态
    yes: 1, // 飞行模式中
  },
  OFF_LINE_STATUS: {
    yes: 1, // 离线
    no: 2, // 正常
  },
  PAY_STATUS: {
    approved: 1, // 已确认付款
    cancel: 2, // 取消支付
    created: 3, // 运单已创建等待确认付款
  },
  EXECUTE_STATUS: {
    non: 0, // 未执行
    executed: 1, // 已执行
    executedErr: 2, // 执行错误，等待下次执行
  },
  PAYMENT_TYPE: {
    sms: 1, // 短信充值
  },
  NOTIFICATION_TYPE: {
    temp: 'tempAndhumi',
    humi: 'tempAndhumi',
    exception: 'exception',
    light: 'lightAndShock',
    shock: 'lightAndShock',
    subTemp: 'tempAndhumi',
    subHumi: 'tempAndhumi',
    event: 'event',
  },
  EMAIL_ALERT_TITLE: {
    temp: 'Temperature',
    humi: 'Humidity',
    subTemp: 'Temperature2',
    subHumi: 'Humidity2',
    light: 'Light',
    shock: 'Shock',
  },
  // 0返回 结束时间前推24小时时间 1 返回完整时间取间
  DETAIL_QUERY_DATA_TYPE: {
    period24FromNow: 0,
    all: 1,
  },
});

export const PASS_ENCRYPT_ADD_LEN = 30; // 计划额外增加的脏数据个数

export const AlarmStatus = {
  HIGH: 2,
  LOW: 1,
  NORMAL: 0,
  EXCEPTION: -1, // 留给导出excel，pdf用的
};
export const makeAlert = (type, unit, min, max) => ({ type, unit, min, max });
export const RANGE_DEFAULT_TEMP = [-200, 99];
export const RANGE_DEFAULT_HUMI = [0, 100];
export const RANGE_DEFAULT_SHOCK = [0, 8];
export const RANGE_DEFAULT_ANGLE = [0, 180];
export const RANGE_DEFAULT_LIGHT = [0, 1700];
export const RANGE_DEFAULT_SUB_LIGHT = [0, 5000];
export const supportedAlerts = [
  makeAlert('temp', '℃', RANGE_DEFAULT_TEMP[0], RANGE_DEFAULT_TEMP[1]),
  makeAlert('subTemp', '℃', RANGE_DEFAULT_TEMP[0], RANGE_DEFAULT_TEMP[1]),
  makeAlert('humi', '%', RANGE_DEFAULT_HUMI[0], RANGE_DEFAULT_HUMI[1]),
  makeAlert('subHumi', '%', RANGE_DEFAULT_HUMI[0], RANGE_DEFAULT_HUMI[1]),
  makeAlert('light', 'lx', RANGE_DEFAULT_LIGHT[0], RANGE_DEFAULT_LIGHT[1]),
  makeAlert('subLight', 'lx', RANGE_DEFAULT_SUB_LIGHT[0], RANGE_DEFAULT_SUB_LIGHT[1]),
  makeAlert('shock', 'g', RANGE_DEFAULT_SHOCK[0], RANGE_DEFAULT_SHOCK[1]),
  makeAlert('angle', '°', RANGE_DEFAULT_ANGLE[0], RANGE_DEFAULT_ANGLE[1]),
];
export const supportedPreAlerts = [
  makeAlert('pre-temp', '℃', RANGE_DEFAULT_TEMP[0], RANGE_DEFAULT_TEMP[1]),
  makeAlert('pre-subTemp', '℃', RANGE_DEFAULT_TEMP[0], RANGE_DEFAULT_TEMP[1]),
  makeAlert('pre-humi', '%', RANGE_DEFAULT_HUMI[0], RANGE_DEFAULT_HUMI[1]),
];
export const ALERTS_DEFAULT = supportedAlerts.reduce((obj, a) => {
  const { type, unit, min, max } = a;
  obj[type] = { unit, min, max };
  return obj;
}, {});
export const PREALERTS_DEFAULT = supportedPreAlerts.reduce((obj, a) => {
  const { type, unit, min, max } = a;
  obj[type] = { unit, min, max };
  return obj;
}, {});
export const ALARM_HISTORY_TYPE = {
  EMAIL: 1,
  SMS: 2,
};
export const TEMP_UNIT = {
  CELS: 'cels',
  FAHR: 'fahr',
};

// 审计日志 start @{
export const PWD_UPDATE_TYPE = {
  OTHER: 0, // 其他方式，默认
  FORGET_PWD: 1, // 忘记密码修改的密码
  LOGIN_UPDATE: 2, // 登录后用户管理修改的密码
};
export const OP_FROM = {
  OTHER: 0,
  WEB: 10,
  WAP: 20,
  API: 30,
  CMS: 40,
};
export const AUDIT_RESULT = {
  DEFAULT: 0, // 默认,仅表示执行了操作的动作(不涉及结果)
  SUCCESS: 1,
  FAIL: 2,
};
export const AUDIT_TYPE = {
  SYSTEM_AUDIT: 1, // 系统审计痕迹(登录登出、修改信息等，)
  ANALYSE_AUDIT: 2, // 分析审计痕迹 (签名签注)
  SYSTEM_EVENT: 3, // 系统事件(与设备主动通讯，设备回复的)
};
export const OPERATION_TYPE = {
  SYSTEM: 1, // 系统事件
  USER_ADD: 2, // 新增用户
  USER_MODIFY: 3, // 编辑用户
  USER_LOCK: 4, // 锁定用户
  USER_UNLOCK: 5, // 解锁用户
  PWD_MODIFY: 6, // 修改密码
  LOGIN: 7, // 登录
  LOGOUT: 8, // 登出
  EST_ADD: 9, // 新增签注
  EST_MODIFY: 10, // 编辑签注
  EST_DEL: 11, // 删除签注
  EST_ENDORSE: 12, // 签名签注
  USER_LIMIT_MODIFY: 13, // 修改用户权限
  SECURITY_STRATEGY_MODIFY: 14, // 修改安全策略
  SYSTEM_SETTING_MODIFY: 15, // 修改系统设置
  PARAMS_SET: 16, // 配置设备参数
  DEVICES_ACTIVE: 17, // 激活设备
  DEVICES_IMPORT: 18, // 导入设备
  DATA_EXPORT: 19, // 导出数据
  DEVICE_DEL: 20, // 删除设备
  DATA_DEL: 21, // 删除数据
  EST_ENDORSE_ORDER_DEL: 22, // 删除签注在运单中的签注
  EST_ASSIGN: 23, // 分配签注
};
export const USER_LOCK_TYPE = {
  AUTO: 1, // 安全策略触发，自动锁定
  MANUAL: 2, // 人为手动锁定
};
// }@ 审计日志 end
