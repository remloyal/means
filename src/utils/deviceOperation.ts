import { instructRead } from './deviceType';

const HID = require('node-hid');

export const createDeviceInstance = (deviceInfo): DeviceInstanceType => {
  const deviceInstance: DeviceInstanceType = {
    device: null,
    deviceInfo: null,
    operate: null,
    record: {},
    isComplete: true,
    actionList: [],
    csvData: [],
    drive: null,
    initialize() {
      this.device = new HID.HID(this.deviceInfo?.path);
      this.device.on('data', res => {
        const todo = Uint8ArrayToString(res);
        this.record[this.operate!.key.toString()] = this.operate?.getData(todo);
        if (this.actionList.length > 0) {
          this.write(this.actionList[0]);
        } else {
          this.operate = null;
          this.isComplete = true;
          this.close();
        }
      });
      this.device.on('error', function (err) {
        console.error(err);
      });
    },
    async init(data: DeviceType) {
      this.deviceInfo = data;
      const operate: OperateTypeItem[] = Object.values(instructRead);
      this.actionList = operate;
      this.write(this.actionList[0]);
      return this;
    },
    write(item: OperateTypeItem, param?: string | number) {
      if (!this.device) {
        this.initialize();
      }
      this.isComplete = false;
      var index = this.actionList.findIndex(res => res.name === item.name);
      this.actionList.splice(index, 1);
      this.operate = item;
      const dataee = stringToUint8Array(item.order(param));
      this.device.write(dataee);
    },
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
    },
    close() {
      this.device.close();
      this.device = null;
    },
    setCsvData(csvData: TimeType[]) {
      this.csvData = csvData;
      this.record.firstRecordTime = csvData[0].timeStamp;
      this.record.lastRecordedTime = csvData[csvData.length - 1].timeStamp;
      const { max, min } = findMinMax(csvData, 0, csvData.length - 1);
      this.record.maximumValue = max;
      this.record.minimumValue = min;
    },
  };

  deviceInstance.init(deviceInfo);

  return deviceInstance;
};

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
