import dayjs from 'dayjs';
import { deviceType, DeviceTypeAT } from './deviceType';
import { convertTZ } from './time';
import { ipcRenderer } from 'electron';

export let instructRead;
export let instructSetup;
export let DeviceAttribute;
export const setTypePower = (type?) => {
  if (type) {
    if (type.indexOf('#') != -1) {
      type = type.split('#')[0];
    }
    DeviceAttribute = DeviceTypeAT[type];
    instructRead = DeviceAttribute.read;
    instructSetup = DeviceAttribute.setup;
    window.eventBus.emit('typePower', [
      ...Object.keys(instructRead),
      ...Object.keys(instructSetup),
    ]);
  } else {
    instructRead = [];
    instructSetup = [];
    window.eventBus.emit('typePower', []);
  }
};
export const createDeviceInstance = async (deviceInfo): Promise<DeviceInstance> => {
  deviceExample.deviceInfo = deviceInfo;
  deviceExample.record = {};
  const { key, value } = await deviceExample.getType(deviceType);
  console.log('deviceExample =======>', key, value);
  setTypePower(value);
  await deviceExample?.init(deviceInfo);
  return deviceExample;
};

class DeviceInstance {
  device: any = null;
  deviceInfo: DeviceType | null = null;
  database: any = null;
  operate: OperateTypeItem | null = null;
  record: any = {};
  operateConfig: OperateType<any> = {};
  isComplete: boolean = true;
  actionList: OperateTypeItem[] = [];
  csvData: TimeType[] = [];
  csvName: string = '';
  drive: any = null;
  param: string | number = '';
  constructor(deviceInfo?: DeviceType) {
    // const operate = [...Object.keys(instructSetup)];
    // operate.forEach(item => {
    //   this.record[item] = null;
    // });
    // if (deviceInfo) {
    //   this.init(deviceInfo);
    // }
  }

  public initialize(data) {
    try {
      console.log(data);
      const { key, value } = data;
      const record = this.record;
      this.record = Object.assign({}, record, {
        [key]: this.operate?.getData(value),
      });
      this.repeatOperation();
    } catch (error) {
      console.log(error);
      this.repeatOperation();
    }
  }
  public repeatOperation() {
    try {
      if (this.actionList.length > 0) {
        this.write(this.actionList[0]);
      } else {
        this.operate = null;
        this.isComplete = true;
        this.actionList = [];
        this.close();
      }
    } catch (error) {
      this.operate = null;
      this.isComplete = true;
      this.actionList = [];
      this.close();
    }
  }
  async init(data: DeviceType) {
    this.deviceInfo = data;
    const operate: OperateTypeItem[] = Object.values(instructRead);
    this.actionList = operate;
    this.write(this.actionList[0]);
    return this;
  }
  async write(item: OperateTypeItem) {
    if (this.isComplete) {
      const actionList = [...this.actionList];
      actionList.push(item);
      this.actionList = actionList;
    }
    this.isComplete = false;
    var index = this.actionList.findIndex(res => res.name === item.name);
    this.actionList.splice(index, 1);
    this.operate = item;
    const todo = item.order(item.param);
    const data = await ipcRenderer.invoke('hidWrite', {
      path: this.deviceInfo?.path,
      value: todo,
      key: item.key,
    });
    this.initialize(data);
  }
  async getType(item) {
    const todo = item.order(item.param);
    const data = await ipcRenderer.invoke('hidWrite', {
      path: this.deviceInfo?.path,
      value: todo,
      key: item.key,
    });
    return data;
  }
  getData(key?: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const interval = setInterval(() => {
          if (this.isComplete) {
            clearInterval(interval); //清除定时器
            resolve(key != undefined ? this.record[key] : this.record);
          }
        }, 1000);
      } catch (error) {
        console.log('error', error);
        reject({});
      }
    }).catch(err => console.log('err', err));
  }
  public async close() {
    await ipcRenderer.invoke('hidClose', { path: '', value: '' });
    // this.device.close();
    this.device = null;
  }
  setCsvData(csvData: TimeType[]) {
    this.csvData = csvData;
    this.record.firstRecordTime = dayjs(csvData[0].timeStamp).format(
      `${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`
    );
    this.record.lastRecordedTime = dayjs(csvData[csvData.length - 1].timeStamp).format(
      `${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`
    );
    const { max, min } = findMinMax(csvData, 0, csvData.length - 1);
    this.record.maximumValue = max;
    this.record.minimumValue = min;
    this.record.timeZone = convertTZ(this.record.time);
    this.record.firmwareVersion = 'V1.02';
  }
}

function Uint8ArrayToString(fileData: Uint8Array) {
  var dataString = '';
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  console.log(dataString);

  return dataString.replace('\u0002', '').replaceAll('\u0000', '');
}

function stringToUint8Array(str): number[] {
  const tmpUint8Array = str.split('').map(e => e.charCodeAt(0));
  tmpUint8Array.unshift(1);
  return tmpUint8Array;
}

function findMinMax(arr, start, end) {
  if (start === end) {
    return { max: arr[start].c, min: arr[start].c };
  }

  if (end - start === 1) {
    const maxVal = Math.max(arr[start].c, arr[end].c);
    const minVal = Math.min(arr[start].c, arr[end].c);
    return { max: maxVal, min: minVal };
  }

  const mid = Math.floor((start + end) / 2);
  const leftResult = findMinMax(arr, start, mid);
  const rightResult = findMinMax(arr, mid + 1, end);

  const maxVal = Math.max(leftResult.max, rightResult.max);
  const minVal = Math.min(leftResult.min, rightResult.min);

  return { max: maxVal, min: minVal };
}

export let deviceExample: DeviceInstance = new DeviceInstance();

// 判断是否为OK
const isOk = (data: any) => {
  console.log(data);
  return data == 'OK' ? true : data;
};

let timeout;
const updateDevice = () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  timeout = setTimeout(() => {
    window.eventBus.emit('updateDevice', Object.assign({}, deviceExample));
  }, 1500);
};

// 操作父类
const setOperateDevice = (item: OperateTypeItem, queryData?: OperateTypeItem) => {
  return new Promise(async (resolve, reject) => {
    try {
      await deviceExample.write(item);
      deviceExample.getData(item.key).then(res => {
        if (queryData) {
          deviceExample.write(queryData);
        }
        updateDevice();
        resolve(isOk(res) || false);
      });
    } catch (error) {
      resolve(false);
    }
  }).catch(err => {
    console.log(err);
  });
};

// 设备操作方法
export const deviceOperate = {
  /**设置记录间隔*/
  setTempPeriod: async value => {
    const tempPeriod = instructSetup.setTempPeriod;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.tempPeriod);
    return data;
  },
  /**设置启动模式 */
  setMultidBootMode: async value => {
    const tempPeriod = instructSetup.setMultidBootMode;
    tempPeriod.param = value;
    console.log(tempPeriod, instructRead.multIdBootMode);
    const data = await setOperateDevice(tempPeriod, instructRead.multIdBootMode);
    return data;
  },
  /**设置启动延时 */
  setStartDelay: async value => {
    const tempPeriod = instructSetup.setStartDelay;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.startDelayTime);
    return data;
  },
  /**设置温度阈值上限 */
  setHightEmp: async value => {
    const tempPeriod = instructSetup.setHightEmp;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.hightEmp);
    return data;
  },
  /**设置温度阈值下限 */
  setLowtEmp: async value => {
    const tempPeriod = instructSetup.setLowtEmp;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.lowtEmp);
    return data;
  },
  /**设置湿度阈值上限 */
  setHightHumi: async value => {
    const tempPeriod = instructSetup.setHighHumi;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.highHumi);
    return data;
  },
  /**设置温度阈值下限 */
  setLowtHumi: async value => {
    const tempPeriod = instructSetup.setLowHumi;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.lowHumi);
    return data;
  },
  /**设置时区 */
  setTimeZone: async value => {
    console.log(value);
    const tempPeriod = instructSetup.setTime;
    tempPeriod.param = value;
    console.log(tempPeriod);
    const data = await setOperateDevice(tempPeriod, instructRead.getTime);
    return data;
  },
  /** 重置设备*/
  resetDevice: async () => {
    const tempPeriod = instructSetup.setDevreStore;
    const data = await setOperateDevice(tempPeriod);
    deviceExample.init(deviceExample.deviceInfo!);
    return data;
  },
  /** 设置温度单位*/
  setMultidUnit: async value => {
    const tempPeriod = instructSetup.setMultidUnit;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.multidUnit);
    return data;
  },
  /** 设置灭屏时间*/
  setMultidSleepTime: async value => {
    const tempPeriod = instructSetup.setMultidSleepTime;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.multIdSleepTime);
    return data;
  },
  /** 设置PDF密码*/
  setPdfPwd: async value => {
    const tempPeriod = instructSetup.setPdfPwd;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.pdfPwd);
    return data;
  },
  /** 设置PDF密码*/
  setKeyStopEnableset: async value => {
    const tempPeriod = instructSetup.setKeyStopEnableset;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.keyStopEnableget);
    return data;
  },
};
