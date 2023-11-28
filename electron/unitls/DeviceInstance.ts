const HID = require('node-hid');
import { instructRead, instructSetup } from '../../src/utils/deviceType';
import { convertTZ } from '../../src/utils/time';
import dayjs from 'dayjs';
import log from '../pdfgen/log'
export const createDeviceInstance = deviceInfo => {
  deviceExample?.init(deviceInfo);
  return deviceExample;
};
class DeviceInstance {
  device: any = null;
  deviceInfo: any = null;
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
    console.log(this.deviceInfo);
    
    this.device = new HID.HID(this.deviceInfo.deviceDescriptor.idVendor, this.deviceInfo?.deviceDescriptor.idProduct);
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
    try {
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
    } catch (error) {
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
    try {
      
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
    } catch (error) {
      log.error(error);
      this.device.close()
    }
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
  public close() {
    this.device.close();
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
let deviceExample: DeviceInstance = new DeviceInstance();
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
