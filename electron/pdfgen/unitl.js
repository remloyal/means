/* eslint-disable */
'use strict';

import Request from './request';
const qs = require('querystring');
import _log from '../unitls/log';
const crypto = require('crypto');
const moment = require('dayjs');
const fs = require('fs');
const path = require('path');

import * as _common from './gloable/common';
import { text } from './gloable/language';
import _config from './gloable/config';
import {
  ModelLowPowerRange,
  WorkTimeRelated,
  ModelUnUsedShowVoltage100,
  SETTING_LIMIT,
  LIMITATION,
  DEFAULT_ALERTS_TIME,
  MD5_SALTS,
  ALERT_STRATEGY_TYPE,
  ALERT_LABEL,
  DEFAULT_PDF_LANGUAGE,
  EVENT_TYPE,
  ALTER_STATUS,
  DEVICE_STATS,
  DETECTOR_STATUS,
  SEARCH_LIKE_MODEL,
  SENSORS,
  EXC_TEMP,
  EXC_HUMI,
  PASS_ENCRYPT_ADD_LEN,
  DEFAULT_PUBLIC_LIMIT,
  USER_INFO,
  SENSOR_EXC_DEFAULT,
  PDF_CONFIG,
  EXPORT_TYPE,
  ALERTS_DEFAULT,
  TEMP_UNIT,
  DEFAULT_SUPPORT_OPENBOX,
} from './gloable/gloable';
import { NOVALUE } from './templates/constants';

const { ROLE } = USER_INFO;
const { MD5_SALT_HOUDUA, MD5_SALT_CMS } = MD5_SALTS;

export const prom = runnable =>
  new Promise((resolve, reject) => {
    runnable((err, result) => (!err ? resolve(result) : reject(err)));
  });

export const normalizeObj = obj => {
  if (typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((pre, k) => {
        pre[k] = normalizeObj(obj[k]);
        return pre;
      }, {});
  } else if (obj instanceof Array) {
    return obj.sort().map(normalizeObj);
  }
  return obj;
};
export const get = (opts, query, callback) => {
    const options = opts || {};

    // if (_mockApi[options.path]) {
    //   callback(null, _mockApi[options.path](query.startTime, query.endTime));
    //   return;
    // }
    const { routeParams } = options || {};
    if (routeParams && Object.prototype.toString.call(routeParams) === '[object Object]') {
      Object.keys(routeParams).forEach(key => {
        options.path = options.path.replace(
          new RegExp(`:${key}(/|$)`, 'g'),
          `${routeParams[key]}$1`
        );
      });
    }

    options.method = 'GET';
    if (options.path && query) {
      options.path += (options.path.indexOf('?') < 0 ? '?' : '&') + qs.stringify(query);
    }
    _log.info('远程get请求url ：', options.path);

    new Request(options, null, callback).invoke();
  },
  post = (opts, data, callback, showLog = true) => {
    const options = opts || {};

    options.method = 'POST';
    // if (_mockApi[options.path]) {
    //   callback(null, _mockApi[options.path](data.startTime, data.endTime));
    //   return;
    // }

    if (options.path && options.query) {
      options.path += (options.path.indexOf('?') < 0 ? '?' : '&') + qs.stringify(options.query);
    }
    const postBody = typeof data === 'object' ? JSON.stringify(data) : data;
    if (showLog) {
      _log.info('远程post请求url ：', options.path, ' --请求postBody ：', postBody);
    }
    new Request(options, postBody, callback).invoke();
  },
  put = (opts, data, callback) => {
    const options = opts || {};

    options.method = 'PUT';

    if (options.path && options.query) {
      options.path += (options.path.indexOf('?') < 0 ? '?' : '&') + qs.stringify(options.query);
    }
    _log.info('options.path', options.path);
    const postBody = typeof data === 'object' ? JSON.stringify(data) : data;
    _log.info('postBody', postBody);
    new Request(options, postBody, callback).invoke();
  },
  parallel = (array, getKey, handler, next) => {
    let total = array.length;
    const results = {};
    const _func = (key, err, result) => {
      if (!err && typeof result !== 'undefined') results[key] = result;
      if (--total === 0) next(null, results);
    };
    array.forEach(a => handler(a, _func.bind(null, getKey ? getKey(a) : a)));
  },
  step = (array, handler, next) => {
    const total = array.length;
    const results = [];
    let index = 0;

    const _fun = (err, result) => {
      if (!err) {
        if (index && typeof result !== 'undefined') results.push(result);
        if (index < total) return handler(array[index++], _fun);
      }
      next(err, results);
    };
    _fun(null, null);
  },
  arrayCheck = (array1, array2, check) => {
    const results = [];
    array1.forEach(a => {
      for (let j = 0, cnt = array2.length; j < cnt; j += 1) {
        if (check(a, array2[j])) {
          results.push(a);
          break;
        }
      }
    });
    return results.length > 0 && results;
  },
  // prom,

  /**
   * Async running step by step
   * @param {Array[Function(object, next)]} handlers array of handlers
   * @param {Function(Error, object)} callback callback of executor
   */
  promStep = (handlers, callback) => {
    const { pro } = handlers.reduce(
      (obj, handler) => {
        obj.pro = obj.pro
          ? obj.pro.then(res => prom.bind(null, next => handler(res, next)), callback)
          : prom(next => handler(null, next), null);
        return obj;
      },
      { pro: null }
    );

    return (pro || prom(next => next(null, null)))
      .then(callback.bind(null, null), callback)
      .catch(callback);
  },
  /**
   * Polling until the caller end it (return endNext true)
   * @param {Function(object, next)} handler polling handler
   * @param {Function(Error, object)} callback callback of executor with the last result
   */
  promPoll = (handler, callback) => {
    let endNext = false;
    const _func = (err, lastResult) => {
      // 出现error后，余下的循环也继续跑下去
      // if (!err && !endNext && handler) {
      if (!endNext && handler) {
        try {
          endNext = handler(lastResult, _func);
          return;
        } catch (e) {
          err = e;
        }
      }
      if (callback) {
        callback(err, lastResult);
      }
    };
    process.nextTick(() => _func(null, null));
  },
  // normalizeObj,

  compareObj = (o1, o2) => {
    if ((!o1 && o2) || (o1 && !o2)) return false;
    return (!o1 && !o2) || JSON.stringify(normalizeObj(o1)) === JSON.stringify(normalizeObj(o2));
  },
  encode = (secret, str) => {
    const cipher = crypto.createCipher('aes192', secret);
    let enc = cipher.update(str, 'utf8', 'hex'); // 编码方式从utf-8转为hex;
    enc += cipher.final('hex'); // 编码方式从转为hex;
    return enc;
  },
  decode = (secret, enc) => {
    // let ss = enc; // 这是user加密后的结果 赋值给变量ss
    const decipher = crypto.createDecipher('aes192', secret);
    let dec = decipher.update(enc, 'hex', 'utf8'); // 编码方式从hex转为utf-8;
    dec += decipher.final('utf8'); // 编码方式从utf-8;
    return dec;
  },
  md5 = (data, salt = MD5_SALT_HOUDUA) => {
    // 以md5的格式创建一个哈希值
    const hash = crypto.createHash('md5');
    return hash.update(data + salt).digest('hex');
  },
  isMd5Pass = (md5Hash, data, salt = MD5_SALT_HOUDUA) => {
    return md5(data, salt) === md5Hash;
  },
  isRequestValid = ({
    data,
    hs,
    time,
    code,
    dataSalt = MD5_SALTS.MD5_SALT_QIANDUAN,
    codeSalt = MD5_SALTS.MD5_SALT_QIANDUAN,
  }) => {
    let isValid = false;
    isValid = md5(data, dataSalt) === hs && md5(time, codeSalt) === code;
    // 其次，time需要在当前utc 两分钟内
    const curTime = new Date().getTime();
    isValid = Math.abs(curTime - time) <= 30 * 60 * 1000;
    return isValid;
  },
  isMd5CmsPass = (md5Hash, data, salt = MD5_SALT_CMS) => {
    return isMd5Pass(md5Hash, data, salt);
  },
  isCmsRequestValid = (time, code) => {
    let isValid = true;
    // 首先time与code的md5校验需要通过
    isValid = isMd5CmsPass(code, time, MD5_SALTS.MD5_SALT_QIANDUAN);
    // 其次，time需要在当前utc 两分钟内
    const curTime = new Date().getTime();
    isValid = curTime >= time && curTime - time <= 2 * 60 * 1000;
    return isValid;
  },
  isNumber = v => {
    return typeof v === 'number' && isFinite(v);
  },
  /**
   * 摄氏 转成 华氏
   * @param {Number} c
   */
  c2f = c => {
    return Math.round((c * 1.8 + 32) * 10) / 10;
  },
  /**
   * 华氏 转成 摄氏
   * @param {Number} f
   */
  f2c = f => {
    return Math.round(((f - 32) / 1.8) * 10) / 10;
  },
  /**
   * Date 转 UTC
   * @param {Time} time
   */
  date2utcTime = time => {
    return Math.floor((time instanceof Date ? time.getTime() : time) / 1000);
  },
  timeNow = () => {
    return new Date().getTime() / 1000;
  },
  countTime = start => {
    return timeNow() - start;
  },
  generateVericationCode = () => {
    return `${Math.floor((Math.random() + 1) * 1000000)}`.substr(1);
  },
  _beforeRemoteStoreFilterFromHeader = (
    ctx,
    result,
    next,
    likeModel = SEARCH_LIKE_MODEL.HEAD_MATCH
  ) => {
    if (ctx.args) {
      // 统计执行时间用
      ctx.args.beginExcute = new Date().getTime() / 1000;
    }
    if (ctx.args.filter === undefined && ctx.req.headers.filter) {
      try {
        const filter = JSON.parse(ctx.req.headers.filter);
        const searchLike = obj => {
          if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i += 1) {
              const like = searchLike(obj[i]);
              if (like) {
                return like;
              }
            }
          } else if (obj) {
            const keys = Object.keys(obj);
            for (let i = 0; i < keys.length; i += 1) {
              if (keys[i] === 'like') {
                return obj;
              } else {
                if (typeof obj[keys[i]] == 'object') {
                  const like = obj[keys[i]];
                  if (like) {
                    return like;
                  }
                }
              }
            }
          }
        };
        const likeObj = searchLike(filter || {});
        if (likeObj) {
          const keys = Object.keys(likeObj);
          for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            const { like } = likeObj[key];
            if (like) {
              // 去除字串中的所有空格
              const content = decodeURI(like.substr(1).substring(0, like.length - 2)).replace(
                /\s*/g,
                ''
              );
              let likeValue = content;
              _log.info(content);
              switch (likeModel) {
                case SEARCH_LIKE_MODEL.HEAD_MATCH:
                  likeValue = `${content}%`;
                  break;
                case SEARCH_LIKE_MODEL.TAIL_MATCH:
                  likeValue = `%${content}`;
                  break;
                case SEARCH_LIKE_MODEL.ALL_MATCH:
                  likeValue = `%${content}%`;
                  break;
                default:
                  likeValue = `${content}%`;
              }

              if (key === 'terNo' && content.length >= 8) {
                if (content.length === 8 && !content.includes(',')) {
                  likeObj[keys[i]] = content;
                } else {
                  // 可能以，分割
                  likeObj[keys[i]] = {
                    inq: content.split(','),
                  };
                }
              } else {
                likeObj[keys[i]] = { like: likeValue };
              }
            }
          }
        }
        ctx.args.filter = filter;
      } catch (e) {
        _log.error(e);
      }
    }
    if (ctx.req.accessToken && ctx.args) {
      ctx.args.filter = ctx.args.filter || {};
      ctx.args.filter.userInfo = {};
      ctx.args.filter.userInfo.customerId = ctx.req.accessToken.userInfo.customerId;
      ctx.args.filter.userInfo.roleId = ctx.req.accessToken.userInfo.roleId;
      ctx.args.filter.userInfo.identity = ctx.req.accessToken.userInfo.identity;
      ctx.args.filter.userInfo.id = ctx.req.accessToken.userInfo.id;
      ctx.args.filter.userInfo.userLimit = ctx.req.accessToken.userInfo.userLimit;
      ctx.args.filter.userInfo.settingLimit =
        ctx.req.accessToken.userInfo.settingLimit || SETTING_LIMIT.ALL_PERMIT;
      ctx.args.filter.userInfo.endLimit =
        ctx.req.accessToken.userInfo.endLimit !== undefined
          ? ctx.req.accessToken.userInfo.endLimit
          : LIMITATION.PERMIT;
      ctx.args.filter.userInfo.startLimit =
        ctx.req.accessToken.userInfo.startLimit !== undefined
          ? ctx.req.accessToken.userInfo.startLimit
          : LIMITATION.PERMIT;
      ctx.args.filter.userInfo.dataExportLimit =
        ctx.req.accessToken.userInfo.dataExportLimit !== undefined
          ? ctx.req.accessToken.userInfo.dataExportLimit
          : LIMITATION.PERMIT;
      ctx.args.filter.userInfo.dataActiveExportLimit =
        ctx.req.accessToken.userInfo.dataActiveExportLimit !== undefined
          ? ctx.req.accessToken.userInfo.dataActiveExportLimit
          : LIMITATION.PERMIT;
    }
    next();
  },
  _beforeRemoteStoreUserId = (paramName, relation) => {
    return (ctx, result, next) => {
      if (ctx.args) {
        // 统计执行时间用
        ctx.args.beginExcute = new Date().getTime() / 1000;
      }
      if (ctx.req.accessToken && ctx.args) {
        ctx.args[paramName] = ctx.args[paramName] || {};
        // 获取当前用户id
        ctx.args[paramName][`${relation}Id`] = ctx.req.accessToken.userId;
        // 获取当前用户parentid
        const { __data } = ctx.req.accessToken.userInfo || {};
        const { customer } = __data || {};
        const { parentId } = customer || {};
        ctx.args[paramName].parentId = parentId;

        ctx.args[paramName].userLimit = ctx.req.accessToken.userInfo.userLimit;
        ctx.args[paramName].settingLimit =
          ctx.req.accessToken.userInfo.settingLimit || SETTING_LIMIT.ALL_PERMIT;
        ctx.args[paramName].endLimit = isNumber(ctx.req.accessToken.userInfo.endLimit)
          ? ctx.req.accessToken.userInfo.endLimit
          : LIMITATION.PERMIT;
        ctx.args[paramName].userInfo = ctx.req.accessToken.userInfo || {};
        // 获取用户权限id
        if (!ctx.args[paramName].role) {
          ctx.args[paramName].roleId = ctx.req.accessToken.userInfo.roleId;
          ctx.args[paramName].customerId = ctx.req.accessToken.userInfo.customerId;
        }
        // 获取用户当前所在客户id
      }
      next();
    };
  },
  _beforeRemoteNoteExcuteTime = () => {
    return (ctx, result, next) => {
      if (ctx.args) {
        // 统计执行时间用
        ctx.args.beginExcute = new Date().getTime() / 1000;
      }
      next();
    };
  },
  _afterRemoteNoteExcuteTime = functionName => {
    return (ctx, result, next) => {
      if (ctx.args) {
        const { originalUrl } = ctx.req || {};
        const { beginExcute } = ctx.args;
        _log.info(`[ ${originalUrl || functionName} ] excute time(s) ===>`, countTime(beginExcute));
      }
      next();
    };
  },
  getErrorMsg = e => {
    return (e && e.message) || 'unkwon';
  },
  dateStringToMsTimeStamp = dateString => {
    return dateString && new Date(dateString).getTime();
  },
  shockValueToShow = shock => {
    // return shock !== undefined && parseFloat((shock / 1000).toFixed(1));
    return shock;
  },
  stringOrNumToNum = stringOrNum => {
    return isNumber(stringOrNum) ? stringOrNum : parseFloat(stringOrNum);
  },
  stringFormat = (argumentsFormated = []) => {
    if (!Array.isArray(argumentsFormated) || argumentsFormated.length === 0) return null;
    let str = argumentsFormated[0]; // eslint-disable-line
    for (let i = 1; i < argumentsFormated.length; i += 1) {
      const re = new RegExp(`\\{${i - 1}\\}`, 'gm');
      str = str.replace(re, argumentsFormated[i]);
    }
    return str;
  },
  isLowBattery = voltage => {
    return voltage >= 0 && voltage <= 10;
  },
  isInLowPower = (model = '', voltage = -1) => {
    let isLow = false;
    let thresh = { min: 0, max: 10 };
    if (voltage >= 0) {
      if (Object.keys(ModelLowPowerRange).includes(model)) {
        Object.keys(ModelLowPowerRange).forEach(modelKey => {
          if (modelKey === model) {
            const voltageRound = Math.round(voltage / 10) * 10;
            const { min, max } = ModelLowPowerRange[modelKey];
            if (voltageRound >= min && voltageRound <= max) {
              isLow = true;
              thresh = { min, max };
            }
          }
        });
      } else {
        isLow = isLowBattery(voltage);
      }
    }
    return { isLow, thresh };
  },
  IsInArray = (array, item) => {
    let isIn = false;
    if (array && Array.isArray(array) && item !== undefined) {
      array.forEach(a => {
        if (a === item) {
          isIn = true;
        }
      });
    }
    return isIn;
  },
  getWorkTime = props => {
    const { reportInterval = -1, voltage = -1, model = '', timeConfig } = props;
    let baseTime;
    const voltageToCal =
      voltage < 0 ? (IsInArray(ModelUnUsedShowVoltage100, model) ? 100 : voltage) : voltage;

    const getTime = intervalVoltageList => {
      Object.keys(intervalVoltageList).forEach(intervalKey => {
        if (intervalKey === `${reportInterval}`) {
          const voltageTimeList = intervalVoltageList[intervalKey];
          Object.keys(voltageTimeList).forEach(voltageKey => {
            if (voltageKey === `${Math.round(voltageToCal / 10) * 10}`) {
              baseTime = voltageTimeList[voltageKey];
            }
          });
        }
      });
    };

    if (voltageToCal >= 0) {
      if (timeConfig) {
        getTime(timeConfig);
      } else {
        Object.keys(WorkTimeRelated).forEach(modelKey => {
          if (modelKey.split('__').indexOf(model) !== -1) {
            const intervalVoltageList = WorkTimeRelated[modelKey];
            getTime(intervalVoltageList);
          }
        });
      }
    }
    return baseTime !== undefined ? baseTime : -1;
  },
  // status :default idle
  settingEnabled = (status = 0, userlimitObj, settingLimit = SETTING_LIMIT.ALL_PERMIT) => {
    let enable = true;
    if (!userlimitObj) {
      enable =
        settingLimit === SETTING_LIMIT.ALL_PERMIT ||
        (settingLimit === SETTING_LIMIT.IDLE_PERMIT && status === 0);
    } else {
      const {
        allSettingPermit = true,
        idleSettingPermit = false,
        allSettingForbid = false,
        settingAndEndForbid = false,
      } = userlimitObj;

      if (allSettingPermit) {
        enable = true;
      } else if (idleSettingPermit) {
        enable = status === 0;
      } else if (allSettingForbid || settingAndEndForbid) {
        enable = false;
      }
    }
    return enable;
  },
  endEnabled = (userlimitObj, endLimit = LIMITATION.PERMIT) => {
    let enable = true;
    if (!userlimitObj) {
      enable = endLimit === LIMITATION.PERMIT;
    } else {
      const { settingAndEndForbid = false } = userlimitObj;
      enable = !settingAndEndForbid;
    }
    return (enable && 1) || 0;
  },
  getsettingLimitValue = (userlimitObj, settingLimit = SETTING_LIMIT.ALL_PERMIT) => {
    let value = SETTING_LIMIT.ALL_PERMIT;
    let valueArr = [settingLimit];
    // if userLimit exsits,we should know user has not setted limit with new format limit by setinglimit
    if (userlimitObj instanceof Object) {
      valueArr = Object.keys(userlimitObj)
        .map((key, index) =>
          userlimitObj[key]
            ? Object.keys(SETTING_LIMIT)
                .map(k => SETTING_LIMIT[k])
                .indexOf(index + 1) !== -1
              ? index + 1
              : SETTING_LIMIT.ALL_FORBIT
            : 0
        )
        .filter(val => val);
    }
    if (Array.isArray(valueArr) && valueArr.length === 1) value = valueArr[0]; // eslint-disable-line
    return value;
  },
  alertsTimeShouldAlert = (alertsTime = DEFAULT_ALERTS_TIME, timezone = 'UTC') => {
    let shouldAlert = true;
    const {
      from = DEFAULT_ALERTS_TIME.from,
      to = DEFAULT_ALERTS_TIME.to,
      weekList = DEFAULT_ALERTS_TIME.weekList,
      anyTimeAlert = DEFAULT_ALERTS_TIME.anyTimeAlert,
    } = alertsTime || {};
    if (alertsTime && from && to && weekList && Array.isArray(weekList) && weekList.length > 0) {
      if (!anyTimeAlert) {
        const curMoment = moment().utcOffset(_common.getTz(timezone));
        const curMinutes = curMoment.toObject().hours * 60 + curMoment.toObject().minutes;
        const fromMinutes = from.hour * 60 + from.minute;
        const toMinutes = to.hour * 60 + to.minute;
        const curWeek = curMoment.weekday();
        // 先判断属不属于weekList，如果到了本周，再去判断时间范围是否符合alert
        if (weekList.indexOf(`${curWeek}`) !== -1) {
          shouldAlert = curMinutes > fromMinutes && curMinutes < toMinutes;
        } else {
          shouldAlert = false;
        }
      }
    }
    return shouldAlert;
  },
  // 当前只有温度与温度2支持 医药类参数
  supportYiyaoFormatParams = type => {
    return type === 'temp' || type === 'subTemp';
  },
  // 统一下判断，目前只有果蔬类与医药类参数，日后，再多几种参数类型，此判断不成立
  isYiyaoFormatParams = (alertStrategy = ALERT_STRATEGY_TYPE.GUOSHU) => {
    return alertStrategy === ALERT_STRATEGY_TYPE.YIYAO;
  },
  // 获取判断报警的阈值{min,max}，重新封装下
  refinedMinMaxDifStrategy = (alertStrategy = ALERT_STRATEGY_TYPE.GUOSHU, alert = {}) => {
    let refinedAlert = alert;
    switch (alertStrategy) {
      case ALERT_STRATEGY_TYPE.GUOSHU:
        refinedAlert = alert;
        break;
      case ALERT_STRATEGY_TYPE.YIYAO:
        // 医药alert中是min1,max1,min2,max2的结构体，我们比较的话，取min1,min2的最大值，max1,max2的最小值去判断是否报警
        const { min1, max1, min2, max2, ...restAlert } = alert;
        if (min1 && max1 && min2 && max2) {
          const { value: min1Val = 0 } = min1;
          const { value: min2Val = 0 } = min2;
          const { value: max1Val = 0 } = max1;
          const { value: max2Val = 0 } = max2;
          // 如果min，max都为0，就没必要取最大最小值了
          if (min1Val === 0 && max1Val === 0 && !(min2Val === 0 && max2Val === 0)) {
            refinedAlert = { min: min2Val, max: max2Val, ...restAlert };
          } else if (min2Val === 0 && max2Val === 0 && !(min1Val === 0 && max1Val === 0)) {
            refinedAlert = { min: min1Val, max: max1Val, ...restAlert };
          } else if (!(min1Val === 0 && max1Val === 0) && !(min2Val === 0 && max2Val === 0)) {
            refinedAlert = {
              min: Math.max(min1Val, min2Val),
              max: Math.min(max1Val, max2Val),
              ...restAlert,
            };
          } else {
            refinedAlert = {
              min: 0,
              max: 0,
              ...restAlert,
            };
          }
        }
        break;
      default:
        refinedAlert = alert;
    }
    return refinedAlert;
  },
  formatTimeDuration = (timeDuration, language = _config.language) => {
    const ONE_SECOND = 1000; // primary unit (ms)
    const ONE_MINUTE = 60 * ONE_SECOND;
    const ONE_HOUR = 60 * ONE_MINUTE;
    const ONE_DAY = 24 * ONE_HOUR;
    const days = parseInt(timeDuration / ONE_DAY, 10);
    const hours = parseInt((timeDuration - days * ONE_DAY) / ONE_HOUR, 10);
    const minutes = parseInt((timeDuration - days * ONE_DAY - hours * ONE_HOUR) / ONE_MINUTE, 10);
    // const secends = parseInt((timeDuration / ONE_SECOND) % 60, 10);

    // const daysContent = days ? `${days}  ${text('KEY_DAY', language)}` : '';
    // const hoursContent = hours ? `${hours}  ${text('KEY_HOUR', language)}` : '';
    // const minutesContent = minutes ? `${minutes}  ${text('KEY_MINUTE', language)}` : '';
    // const secendsContent =
    //   days || hours || minutes || secends
    //     ? secends
    //       ? `${secends}  ${text('KEY_SECOND', language)}`
    //       : ''
    //     : 0;
    // return `${daysContent} ${hoursContent} ${minutesContent} ${secendsContent} `;
    return `${days}:${hours}:${minutes}`;
  },
  // index default 0
  getAlertLabelSign = (type, index, language = _config.language) => {
    let sign = '';
    if (type && index) {
      sign = ALERT_LABEL[type](language)[index];
    }
    return sign || '';
  },
  /**
   * 返回特定格式的数字的字串
   * @param {*} num
   * @param {*} decimal
   * @param {*} integerResWithDecimal  整数结果，是否显示小数点后的0占位符
   * @returns {string} 返回的是数字格式的字符串
   */
  formatDecimalString = (num, decimal, integerResWithDecimal = true, fixed = false) => {
    if (!isNumber(num)) {
      return NOVALUE;
    }
    num = (fixed ? parseFloat(num).toFixed(decimal) : num).toString();
    const index = num.indexOf('.');
    if (index !== -1) {
      num = num.substring(0, decimal + index + 1);
    } else {
      num = num.substring(0);
    }
    if (integerResWithDecimal) {
      return parseFloat(num).toFixed(decimal);
    } else {
      return parseFloat(parseFloat(num).toFixed(decimal)).toString();
    }
  },
  /**
   * 保留几位小数位，不四舍五入
   * @param {*} num
   * @param {*} decimal
   * @returns {number}
   */
  formatDecimal = (num, decimal) => {
    return parseFloat(formatDecimalString(num, decimal, false));
  },
  isTempSenosr = type => {
    return type && [SENSORS.TEMP, SENSORS.SUB_TEMP].includes(type);
  },
  transFahr = num => {
    return Number.parseFloat((num * 1.8 + 32).toFixed(1));
  },
  /**
   * 格式化sensor对应的值的返回值
   * @param {string} type sensor类型 temp、subTemp、humi、subHumi....
   * @returns {string} 字串
   */
  formatSensorValue = (type, options) => {
    // fixed : 是否四舍五入
    const { unit = TEMP_UNIT.CELS } = options || {};
    let withDecimal = false;
    switch (type) {
      case SENSORS.TEMP:
      case SENSORS.SUB_TEMP:
        withDecimal = true;
        break;
      case SENSORS.HUMI:
      case SENSORS.SUB_HUMI:
        withDecimal = false;
        break;
      default:
    }
    return (num, decimal, integerResWithDecimal = withDecimal) => {
      let value = num;
      let fixed = false;
      if (
        isNumber(num) &&
        (type === SENSORS.TEMP || type === SENSORS.SUB_TEMP) &&
        unit === TEMP_UNIT.FAHR
      ) {
        fixed = true; // 华氏摄氏度 需要四舍五入，跟前端保持一致
        // 摄氏度转华氏度参与计算
        value = transFahr(num);
      }
      return `${formatDecimalString(value, decimal, integerResWithDecimal, fixed)}`;
    };
  },
  // if params setted ,exist in order or payload ,use it ,or not ,use productModel default
  getPdfLanguage = (productLan, paramsLan) => {
    return paramsLan ? paramsLan : productLan ? productLan : DEFAULT_PDF_LANGUAGE;
  },
  // append params to url suffix
  getUrl = (url, paramsObj = {}) => {
    let newUrl = url;
    Object.keys(paramsObj).forEach(key => {
      const value = paramsObj[key];
      if (value !== undefined)
        newUrl += `${newUrl.indexOf('?') < 0 ? '?' : '&'}${key}=${encodeURI(value)}`;
    });
    return newUrl;
  },
  /**
   * 最新的状态判断策略：上报的sensor的状态 + 原表中的状态 ：相当于将最新的状态填充到表中，然后整体的状态
   * @param {*} alertStrategy 报警策略： 果蔬 or 医药 --- 有的sensor的报警状态值不用（temp，subTemp）
   * @param {*} originStatusObj 原表中的所有sensor状态
   * @param {*} uploadStatusObj  后端上报的sensor的状态集合
   */
  alertCheckStatus = (originStatusObj, uploadStatusObj) => {
    // 新状态覆盖到旧状态上，组合成最新的状态 集合
    const newStatusObj = Object.assign(originStatusObj, uploadStatusObj);
    // 以后新增sensor，还需要再修改此方法
    const {
      // 我们把设备探头的状态也判断上
      detectorStatus = DETECTOR_STATUS.normal,
      tempStatus = ALTER_STATUS.normal,
      subTempStatus = ALTER_STATUS.normal,
      humiStatus = ALTER_STATUS.normal,
      subHumiStatus = ALTER_STATUS.normal,
      shockStatus = ALTER_STATUS.normal,
      lightStatus = ALTER_STATUS.normal,
      subLightStatus = ALTER_STATUS.normal,
      openBoxStatus = ALTER_STATUS.openBoxDefault,
    } = newStatusObj;
    // 探头异常为第一位，即使其他sensor都正常了，只要探头还是异常的，那么就是异常状态
    return detectorStatus !== DETECTOR_STATUS.exception &&
      tempStatus === ALTER_STATUS.normal &&
      subTempStatus === ALTER_STATUS.normal &&
      humiStatus === ALTER_STATUS.normal &&
      subHumiStatus === ALTER_STATUS.normal &&
      shockStatus === ALTER_STATUS.normal &&
      lightStatus === ALTER_STATUS.normal &&
      subLightStatus === ALTER_STATUS.normal &&
      openBoxStatus === ALTER_STATUS.openBoxDefault
      ? DEVICE_STATS.active
      : DEVICE_STATS.warn;
  },
  sensorSupported = alerts => {
    return (
      alerts &&
      Array.isArray(alerts) &&
      alerts.map(alert => {
        const { type } = alert || {};
        return type || 'temp';
      })
    );
  },
  createdSqlForm = date => {
    return moment(date || new Date()).format('YYYY-MM-DD HH:mm:ss');
  },
  // terNo =>  `terNo`
  sqlForm = col => {
    return `\`${col.trim()}\``;
  },
  arrToSqlStr = arr => {
    const terStringFy = JSON.stringify(arr);
    return terStringFy.substring(terStringFy.indexOf('[') + 1, terStringFy.indexOf(']'));
  },
  orderToSqlStr = (order, tableAlias) => {
    const self = this;
    let alias = '';
    if (tableAlias) {
      alias = `${tableAlias}.`;
    }
    const orderStr =
      order && Array.isArray(order) && order.length > 0
        ? order
            .map(o => {
              const ascIndex = o.indexOf('ASC');
              const descIndex = o.indexOf('DESC');
              const orderSignIndex =
                ascIndex !== -1 ? ascIndex : descIndex !== -1 ? descIndex : o.length;
              return ` ${alias}${self.sqlForm(o.substring(0, orderSignIndex))} ${o.substring(
                orderSignIndex
              )}`;
            })
            .join(',')
        : undefined;
    return orderStr ? `ORDER BY ${orderStr}` : '';
  },
  limitSkipToSqlStr = (limit, skip) => {
    return limit || skip ? (skip ? `LIMIT ${skip},${limit}` : `LIMIT ${limit}`) : '';
  },
  fieldsToSqlStr = (fields, tableAlias) => {
    let alias = '';
    if (tableAlias) {
      alias = `${tableAlias}.`;
    }
    return fields ? fields.map(field => `${alias}${sqlForm(field)}`).join(',') : '*';
  },
  // {terNo:{inq:['']},personal:{like:"%aaa%"},id:10,unbounded:{neq:NULL}}
  whereToSqlStr = (where = {}, useAlias = false, connect = 'AND') => {
    const keys = Object.keys(where);
    let value;
    let alias = '';
    return keys
      .map(key => {
        // 如果使用别名，那么查询语句就不通,where结构体也不通
        if (useAlias) {
          // eslint-disable-next-line
          value = where[key].value;
          alias = `${where[key].alias}.`;
        } else {
          value = where[key];
        }
        const valueType = typeof value;
        let mark = '<';
        switch (valueType) {
          case 'object':
            //  得到 inq ,like ,
            const [valueKey] = Object.keys(value);
            switch (valueKey) {
              case 'inq':
                const inqArr = value.inq;
                if (inqArr.length > 0) {
                  return `${alias}${sqlForm(key)} in (${arrToSqlStr(inqArr)}) `;
                } else {
                  return `${alias}${sqlForm(key)} in (NULL)`;
                }
              case 'like':
                return `${alias}${sqlForm(key)} like '${value.like}'`;
              case 'neq':
                const neqValue = value.neq;
                if (neqValue === null) {
                  return `${alias}${sqlForm(key)} IS NOT NULL`;
                } else {
                  const neqValueType = typeof neqValue;
                  if (neqValueType === 'string') {
                    return `${alias}${sqlForm(key)} <> '${neqValue}'`;
                  } else if (neqValueType === 'number') {
                    return `${alias}${sqlForm(key)} <> ${neqValue}`;
                  }
                  return `${alias}${sqlForm(key)} <> ${neqValue}`;
                }
              case 'gte':
                mark = '>=';
              case 'lte':
                mark = '<=';
              case 'gt':
                mark = '>';
              case 'lt':
                const val = value[valueKey];
                const valueType = typeof val;
                if (valueType === 'number') {
                  return `${alias}${sqlForm(key)} ${mark} ${val}`;
                } else if (valueType === 'string') {
                  return `${alias}${sqlForm(key)} ${mark} '${val}'`;
                }
              default:
                return '';
            }

          case 'number':
            return `${alias}${sqlForm(key)}=${value}`;
          case 'string':
            return `${alias}${sqlForm(key)}='${value}'`;
          default:
            return `${alias}${sqlForm(key)}=${value}`;
        }
      })
      .join(` ${connect} `);
  },
  // 用sql语句查到的count结果，转化成count值
  countSqlResult = result => {
    if (!result) return 0;
    const totalObj = JSON.parse(JSON.stringify(result))[0] || {};
    return totalObj[Object.keys(totalObj)[0] || 0] || 0;
  },
  selectSqlResult = result => {
    return JSON.parse(JSON.stringify(result));
  },
  getUrlParams = (url, seq = '&') => {
    let params = {};
    if (url) {
      const began = url.trim().indexOf('?');
      params = began >= 0 ? qs.parse(url.trim().substr(began + 1), seq) : params;
    }
    return params;
  },
  // socket io
  getClientIp = socket => {
    let ip = null;
    if (socket) {
      const { address } = socket.handshake || {};
      if (address) {
        const parts = address.split(':');
        ip = parts[parts.length - 1] || null;
      }
    }
    return ip;
  },
  /**
   * 后端推送的报警数据，解析出来的都是字串
   * @param {*} valueFromTer 不带小数点的，实际值:温度 valueFromTer / 10
   * @param {*} type
   */
  emailSensorValue = (valueFromTer, type) => {
    let formated = '--';
    const valueNumber =
      valueFromTer !== null && valueFromTer !== undefined && valueFromTer !== ''
        ? Number(valueFromTer)
        : NaN;
    const isNumber = isNumber(valueNumber);
    if (!isNumber) return formated;
    let value = valueNumber;
    switch (type) {
      case SENSORS.TEMP:
      case SENSORS.SUB_TEMP:
        value = valueNumber / 10;
        formated = isNumber
          ? valueNumber != EXC_TEMP * 10
            ? `${value.toFixed(1)} °C(${(value * 1.8 + 32).toFixed(1)}°F)`
            : '---'
          : '--';
        break;
      case SENSORS.HUMI:
      case SENSORS.SUB_HUMI:
        formated = isNumber
          ? value != EXC_HUMI && value != SENSOR_EXC_DEFAULT
            ? `${value}%`
            : '---'
          : '--';
        break;
      case SENSORS.SHOCK:
        formated = isNumber ? `${value}g` : '--';
        break;
      case SENSORS.LIGHT:
      case SENSORS.SUB_LIGHT:
        formated = isNumber ? `${value}lx` : '--';
        break;
    }
    return formated;
  },
  passDecrypt = (encryptedPass, passAddLen = PASS_ENCRYPT_ADD_LEN) => {
    let password = '';
    const encrytLen = encryptedPass.length;
    const passLen = encrytLen - passAddLen;
    const blank = passLen - 1; // 每位密码放置好，中间共有 passLen-1个空位置，来放30个额外的脏数据
    const everyBlankCnt = Math.floor(passAddLen / blank);
    let index = 0;
    // 按照everyColCnt 拆出来真正的密码就行了
    for (let i = 0; i < passLen; i++) {
      index = i + i * everyBlankCnt;
      password += encryptedPass[index];
    }
    return password;
  },
  containsEmoji = value => {
    const regEmoj =
      /\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/g;
    return regEmoj.test(value);
  },
  /**
   * 获取public界面支持的view项
   * @param {*} limitObj publicLimit
   * return object
   */
  getPublicLimit = (limitObj = DEFAULT_PUBLIC_LIMIT) => {
    // 返回checkbox识别的数组
    let limits = [];
    if (limitObj instanceof Object) {
      limits = Object.keys(limitObj).filter(key =>
        limitObj[key] instanceof Object ? limitObj[key].checked : limitObj[key]
      );
    }
    // else if (limitObj instanceof Array) {
    //   limits = limitObj;
    // }
    else {
      limits = Object.keys(DEFAULT_PUBLIC_LIMIT).filter(key => DEFAULT_PUBLIC_LIMIT[key].checked);
    }
    const showGeneral = limits.indexOf('generalView') !== -1;
    const supportExcelExport = limits.indexOf('csvExport') !== -1 && showGeneral;
    const supportPdfExport = limits.indexOf('pdfExport') !== -1 && showGeneral;
    const showExport = (supportExcelExport || supportPdfExport) && showGeneral;
    const showMap = limits.indexOf('mapView') !== -1 && showGeneral;
    return {
      showGeneral,
      supportExcelExport,
      supportPdfExport,
      showExport,
      showMap,
    };
  },
  isSuperAdmin = ({
    customerId,
    roleId = ROLE.ADMIN,
    identity = USER_INFO.IDENTITY.DEFAULT_FRIGGA_COMMON,
  }) => {
    return (
      roleId === ROLE.ADMIN && (customerId === 1 || identity === USER_INFO.IDENTITY.SUPER_SUPPORT)
    );
  },
  // 递归创建目录 同步方法
  mkdirsSync = dirname => {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      if (mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
  },
  pdfApiStartEndTime = (bindOrUnbind, timeFromWeb, forRenewReport = false, timeFromTer) => {
    // forRenewReport is for report export pdf，user can modify startTime
    // if user not modify time,we use origin time
    return forRenewReport &&
      timeFromWeb &&
      timeFromTer &&
      new Date(timeFromWeb).getTime() !==
        (typeof timeFromTer === 'string' ? new Date(timeFromTer).getTime() : timeFromTer.getTime())
      ? new Date(timeFromWeb).getTime()
      : bindOrUnbind
        ? typeof bindOrUnbind === 'string'
          ? new Date(bindOrUnbind).getTime()
          : bindOrUnbind.getTime()
        : null;
  },
  /**
   * web端会传来起始时间，导出pdf时，需要参考页面端传来的时间
   * 与真实的绑定解绑时间不一致时，采用web端传来的时间戳，作为显示的绑定解绑时间
   * @param {string} bindOrUnbindStr 最终的默认时间戳，当所有条件都不满足时的备用：真实的绑定或者解绑时间，不存在时显示：'--'
   * @param {*} timeFromWeb web端传来的时间戳
   * @param {*} timeZone
   * @param {*} forRenewReport
   * @param {*} timeFromTer 真实的绑定或者解绑时间
   * @param {*} dateFormat
   */
  pdfShowTime = (
    bindOrUnbind,
    timeFromWeb,
    timeZone,
    forRenewReport = false,
    timeFromTer,
    dateFormat
  ) => {
    // forRenewReport is for report export pdf，user can modify startTime
    // if user not modify time,we use origin time
    return forRenewReport &&
      timeFromWeb &&
      timeFromTer &&
      new Date(timeFromWeb).getTime() !==
        (typeof timeFromTer === 'string' ? new Date(timeFromTer).getTime() : timeFromTer.getTime())
      ? _common.formatDate(new Date(timeFromWeb), timeZone, dateFormat)
      : bindOrUnbind;
  },
  isValidSensor = value => {
    return (
      isNumber(value) && value !== SENSOR_EXC_DEFAULT && value !== transFahr(SENSOR_EXC_DEFAULT)
    );
  },
  /**
   * pdf使用
   *  min max都为0，不绘制阈值线
   * @param {*} min
   * @param {*} max
   */
  isThresholdValid = (min, max) => {
    return !(min === max && min === 0);
  },
  /**
   * 不同的sensor数据，显示不同的格式
   * 温度 保留一位小数
   * 湿度 就是整数
   * @param {*} type
   * @param {*} val
   */
  refineSensorData = (type, val) => {
    let refinedVal = val;
    if (type === SENSORS.TEMP || type === SENSORS.SUB_TEMP) {
      refinedVal = val.toFixed(1);
    }
    return refinedVal;
  },
  getArchiveFolder = (time = Date.now()) => {
    return _common.formatDate(new Date(time), 8, PDF_CONFIG.PDF_ARCHIVE_FORMAT);
  },
  getDownloadUrl = (type, archiveFolder, fileName, downloadHost) => {
    let url = null;
    const refinedUrl = (urlPrefix, urlSign) =>
      `${downloadHost ? downloadHost : urlPrefix}/${urlSign}/${
        archiveFolder ? `${archiveFolder}/` : ''
      }${fileName}`;
    switch (type) {
      case EXPORT_TYPE.PDF:
        url = refinedUrl(_config.pdfUrlPrefix, 'download');
        break;
      case EXPORT_TYPE.EXCEL:
        // TODO: EXCEL导出路径配置一下
        url = refinedUrl(_config.excelUrlPrefix, 'excelDownLoad');
        break;
      case EXPORT_TYPE.CSV:
        url = refinedUrl(_config.downloadUrlPrefix, 'csvDownLoad');
        break;
    }
    return url;
  },
  formatCsvBuffer = rows => {
    return `\ufeff${rows.join('\r\n')}`;
  },
  // 定义删除非空目录的方法
  delDir = folder => {
    // 第一步读取文件内部的文件
    const arr = fs.readdirSync(folder);
    // console.log(arr);
    // 遍历数组
    for (let i = 0; i < arr.length; i++) {
      const itemPath = path.resolve(folder, arr[i]);
      // 获取文件的状态
      const stat = fs.statSync(itemPath);
      // 判断是文件还是文件夹
      if (stat.isDirectory()) {
        // 说明是文件夹  递归调用
        delDir(itemPath);
      } else {
        // 说明是文件
        fs.unlinkSync(itemPath);
      }
    }
    // 遍历完成之后 删除最外层的文件
    fs.rmdirSync(folder);
  },
  /**
   *  refine cargo alert params refer to alert params of productmodel
   * @param {*} modelAlertParams productmodel alerts params
   * @param {*} alerts real alerts params
   * @param {*} alertStrategy guoshu or yiyao
   */
  alertRefine = (modelAlertParams, realAlerts, alertStrategy = ALERT_STRATEGY_TYPE.GUOSHU) => {
    if (!Array.isArray(modelAlertParams) || modelAlertParams.length <= 0) return realAlerts;

    const refine = (option, value) => {
      const { initValue, range } = option || {};
      let val = value === undefined ? initValue : value;

      if (Array.isArray(range) && range.length > 0) {
        // 如果val 为undefined 返回最小值，设置值与最大值取小，在与最小值取大
        val =
          val === undefined ? range[0] : Math.max(range[0], Math.min(range[range.length - 1], val));
      } else if (initValue !== undefined) {
        val = initValue;
      }
      return val;
    };
    if (isYiyaoFormatParams(alertStrategy)) {
      return modelAlertParams.reduce((arr, modelAlert) => {
        const { type, range, receiveAlert } = modelAlert;
        const { min = 0, max = 0 } = range || {};
        let realAlert = (realAlerts || []).filter(a => a.type === type);
        realAlert = realAlert.length > 0 ? realAlert[0] : {};
        let refinedAlertsObj = {
          type,
          unit: (ALERTS_DEFAULT[type] && ALERTS_DEFAULT[type].unit) || '',
          receiveAlert:
            realAlert.receiveAlert !== undefined ? realAlert.receiveAlert : receiveAlert, // 是否告警
          // range,
        };
        if (supportYiyaoFormatParams(type)) {
          const { min1 = {}, max1 = {}, min2 = {}, max2 = {} } = modelAlert;
          const {
            min1: realMin1 = {},
            max1: realMax1 = {},
            min2: realMin2 = {},
            max2: realMax2 = {},
          } = realAlert;

          const { value: l1 = 0, ...restMin1 } = min1;
          const { value: h1 = 0, ...restMax1 } = max1;
          const { value: l2 = 0, ...restMin2 } = min2;
          const { value: h2 = 0, ...restMax2 } = max2;
          refinedAlertsObj = {
            ...refinedAlertsObj,
            min1: {
              ...restMin1,
              ...realMin1,
              value: refine(
                { initValue: l1, range: [min, max] },
                realAlert.min1 && realAlert.min1.value
              ),
            },
            max1: {
              ...restMax1,
              ...realMax1,
              value: refine(
                { initValue: h1, range: [min, max] },
                realAlert.max1 && realAlert.max1.value
              ),
            },
            min2: {
              ...restMin2,
              ...realMin2,
              value: refine(
                { initValue: l2, range: [min, max] },
                realAlert.min2 && realAlert.min2.value
              ),
            },
            max2: {
              ...restMax2,
              ...realMax2,
              value: refine(
                { initValue: h2, range: [min, max] },
                realAlert.max2 && realAlert.max2.value
              ),
            },
          };
        } else {
          const { initValue = {}, alert } = modelAlert;
          refinedAlertsObj.alert = realAlert.alert !== undefined ? realAlert.alert : alert;
          refinedAlertsObj.min = 0;
          refinedAlertsObj.max = refine(
            { initValue: initValue.max || 0, range: [min, max] },
            realAlert.max
          );
          if (Object.keys(initValue).length > 1) {
            refinedAlertsObj.min = refine(
              { initValue: initValue.min || 0, range: [min, max] },
              realAlert.min
            );
          }
        }
        return arr.concat(refinedAlertsObj);
      }, []);
    }
    return modelAlertParams.reduce((arr, modelAlert) => {
      const { type, initValue, range, receiveAlert } = modelAlert;
      let realAlert = (realAlerts || []).filter(a => a.type === type);
      realAlert = realAlert.length > 0 ? realAlert[0] : {};
      const refinedAlertsObj = {
        type,
        unit: (ALERTS_DEFAULT[type] && ALERTS_DEFAULT[type].unit) || '',
        min: 0,
        receiveAlert: realAlert.receiveAlert !== undefined ? realAlert.receiveAlert : receiveAlert, // 是否告警
        // range,
      };
      if (Array.isArray(initValue) && initValue.length > 1) {
        refinedAlertsObj.min = refine({ initValue: initValue[0], range }, realAlert.min);
        refinedAlertsObj.max = refine(
          { initValue: initValue[initValue.length - 1], range },
          realAlert.max
        );
      } else {
        refinedAlertsObj.max = refine({ initValue, range }, realAlert.max);
      }
      return arr.concat(refinedAlertsObj);
    }, []);
  },
  /**
   * 是否需要分批次加载数据（应对大数据量）
   * @param {array [startTimestamp,endTimestamp]} requestDuration 用户请求的起始结束时间（ms）
   * @param {array [startTimestamp,endTimestamp]} orderDuration 实际运单的起始结束时间（ms）
   * @param {number minutes} readInterval 记录间隔
   */
  // getDataLoadedConfig(requestDuration, orderDuration, readInterval) {
  //   const [requestStartTimestamp, requestEndTimestamp] = requestDuration || [];
  //   const [orderStartTimestamp, orderEndTimestamp] = orderDuration || [];
  //   const needSeperate = true;
  //   const turns = 1; // 分多少次去请求

  //   return { needSeperate, turns };
  // },
  /**
   * 是否需要分批次加载数据（应对大数据量）
   * 这里的start，end都是经过详情特殊处理过的，已经跟绑定解绑时间进行比较置换过的
   * @param {number ms} startTimestamp 请求的起始时间
   * @param {number ms} endTimestamp 请求的结束时间
   * @param {number minutes} readInterval 记录间隔
   */
  getDataLoadedConfig = (startTimestamp, endTimestamp, readInterval) => {
    // 约定一次请求多少条数据
    const itemsOneTime = 5000;
    // 这里做个限制，现在请求不可能请求未来时间的数据，因为还没发生
    let endTime = endTimestamp;
    if (endTimestamp > Date.now()) {
      _log.info('future endTimestamp :', endTimestamp, ', change end time to now');
      endTime = Date.now();
    }
    const turns = Math.ceil(
      Math.ceil((endTime - startTimestamp) / (readInterval * 60 * 1000)) / itemsOneTime
    ); // 分多少次去请求
    _log.info(
      'startTimestamp=',
      startTimestamp,
      ' endTime = ',
      endTime,
      ' readInterval = ',
      readInterval,
      'mins, takes turns = ',
      turns
    );
    return {
      turns,
      timestampInterval: Math.ceil((endTime - startTimestamp) / turns),
    };
  },
  getSupportedSensors = product => {
    const { supportOpenBoxAlert = DEFAULT_SUPPORT_OPENBOX, alerts = [SENSORS.TEMP] } =
      product || {};
    return (
      alerts &&
      Array.isArray(alerts) &&
      alerts
        .map(alert => {
          const { type } = alert || {};
          return type || 'temp';
        })
        .concat(supportOpenBoxAlert ? [SENSORS.OPEN_BOX] : [])
    );
  };
