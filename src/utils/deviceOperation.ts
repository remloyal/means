import { instructRead, instructSetup } from './deviceType';

const HID = require('node-hid');

export const createDeviceInstance = (deviceInfo): DeviceInstanceType => {
  const deviceInstance: DeviceInstanceType = new DeviceInstance(deviceInfo);
  return deviceInstance;
};

class DeviceInstance implements DeviceInstanceType {
  device: any = null;
  deviceInfo: DeviceType | null = null;
  operate: OperateTypeItem | null = null;
  record: OperateType<any> = {};
  isComplete: boolean = true;
  actionList: OperateTypeItem[] | [] = [];
  csvData: TimeType[] = [];
  drive: any = null;
  param: string | number = '';
  private repetitions: number = 3;
  private currentTimes: number = 0;
  constructor(deviceInfo: DeviceType) {
    const operate = [...Object.keys(instructRead), ...Object.keys(instructSetup)];
    operate.forEach(item => {
      this.record[item] = null;
    });
    this.init(deviceInfo);
  }
  public initialize() {
    this.device = new HID.HID(this.deviceInfo?.path);
    this.device.on('data', res => {
      const todo = Uint8ArrayToString(res);
      this.record[this.operate!.key.toString()] = this.operate?.getData(todo);
      this.repeatOperation();
    });
    this.device.on('error', err => {
      console.error('Device error:  ', err);
      if (this.currentTimes >= this.repetitions) {
        this.currentTimes = 0;
        this.record[this.operate!.key.toString()] = null;
        this.repeatOperation();
      } else {
        this.currentTimes++;
        this.write(this.operate!, this.param);
      }
    });
  }
  public repeatOperation() {
    if (this.actionList.length > 0) {
      this.write(this.actionList[0], this.param);
    } else {
      this.operate = null;
      this.isComplete = true;
      this.param = '';
      this.currentTimes = 0;
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
  write(item: OperateTypeItem, param?: string | number) {
    if (!this.device) {
      this.initialize();
    }
    this.isComplete = false;
    if (param !== undefined && param !== null) {
      this.param = param;
    }
    var index = this.actionList.findIndex(res => res.name === item.name);
    this.actionList.splice(index, 1);
    this.operate = item;
    const dataee = stringToUint8Array(item.order(param));
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
