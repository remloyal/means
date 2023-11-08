import { instructRead, instructSetup } from './deviceType';

const HID = require('node-hid');
export const createDeviceInstance = (deviceInfo): DeviceInstanceType => {
  deviceExample?.init(deviceInfo);
  return deviceExample;
};

class DeviceInstance implements DeviceInstanceType {
  device: any = null;
  deviceInfo: DeviceType | null = null;
  operate: OperateTypeItem | null = null;
  record: any = {};
  operateConfig: OperateType<any> = {};
  isComplete: boolean = true;
  actionList: OperateTypeItem[] = [];
  csvData: TimeType[] = [];
  drive: any = null;
  param: string | number = '';
  private repetitions: number = 3;
  private currentTimes: number = 0;
  constructor(deviceInfo?: DeviceType) {
    const operate = [...Object.keys(instructSetup)];
    operate.forEach(item => {
      this.record[item] = null;
    });
    if (deviceInfo) {
      this.init(deviceInfo);
    }
  }
  public initialize() {
    this.device = new HID.HID(this.deviceInfo?.path);
    this.device.on('data', res => {
      const todo = Uint8ArrayToString(res);
      console.log(todo);
      try {
        const record = this.record;
        this.record = Object.assign({}, record, {
          [this.operate!.key.toString()]: this.operate?.getData(todo),
        });
        this.repeatOperation();
      } catch (error) {
        console.log(error);
        this.repeatOperation();
      }
    });
    this.device.on('error', err => {
      console.error('Device error:  ', err);
      if (this.currentTimes >= this.repetitions) {
        this.currentTimes = 0;
        this.record[this.operate!.key.toString()] = null;
        this.repeatOperation();
      } else {
        this.currentTimes++;
        this.write(this.operate!);
      }
    });
  }
  public repeatOperation() {
    if (this.actionList.length > 0) {
      this.write(this.actionList[0]);
    } else {
      this.operate = null;
      this.isComplete = true;
      this.param = '';
      this.currentTimes = 0;
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
  write(item: OperateTypeItem) {
    if (this.isComplete) {
      const actionList = [...this.actionList];
      actionList.push(item);
      this.actionList = actionList;
    }
    this.isComplete = false;
    if (!this.device) {
      this.initialize();
    }
    var index = this.actionList.findIndex(res => res.name === item.name);
    this.actionList.splice(index, 1);
    this.operate = item;
    const todo = item.order(item.param);
    const dataee = stringToUint8Array(todo);
    this.device.write(dataee);
  }
  getData(key?: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const interval = setInterval(() => {
          if (this.isComplete) {
            clearInterval(interval); //清除定时器
            resolve(key != undefined ? this.record[key] : this.record);
          }
        }, 200);
      } catch (error) {
        console.log('error', error);
        reject({});
      }
    }).catch(err => console.log('err', err));
  }
  public close() {
    this.device.close();
    this.device = null;
  }
  setCsvData(csvData: TimeType[]) {
    this.csvData = csvData;
    this.record.firstRecordTime = csvData[0].timeStamp;
    this.record.lastRecordedTime = csvData[csvData.length - 1].timeStamp;
    const { max, min } = findMinMax(csvData, 0, csvData.length - 1);
    this.record.maximumValue = max;
    this.record.minimumValue = min;
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

// 深度复制类的实例，包括属性和方法
export function deepCloneObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const cloned = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepCloneObject(obj[key]);
    }
  }

  return cloned;
}

export let deviceExample: DeviceInstance = new DeviceInstance();

// 判断是否为OK
const isOk = (data: any) => {
  console.log(data);
  return data == 'OK' ? true : data;
};

const updateDevice = () => {
  setTimeout(() => {
    window.eventBus.emit('friggaDevice:in', Object.assign({}, deviceExample));
  }, 1000);
};

// 操作父类
const setOperateDevice = (item: OperateTypeItem, queryData: OperateTypeItem) => {
  return new Promise(async (resolve, reject) => {
    try {
      deviceExample.write(item);
      deviceExample.getData(item.key).then(res => {
        deviceExample.write(queryData);
        updateDevice();
        resolve(isOk(res) || false);
      });
    } catch (error) {
      reject(false);
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
  /**设置时区 */
  setTimeZone: async value => {
    console.log(value);
    const tempPeriod = instructSetup.setTime;
    tempPeriod.param = value;
    console.log(tempPeriod);
    const data = await setOperateDevice(tempPeriod, instructRead.getTime);
    return data;
  },
};
