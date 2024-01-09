import dayjs from 'dayjs';
import { deviceType, batvol, DeviceTypeAT, getNewInstruct } from './deviceType';
import { convertTZ, sleep } from './time';
import { ipcRenderer } from 'electron';

// 指令读取
export let instructRead;

// 指令设置
export let instructSetup;

// 设备属性变量
export let DeviceAttribute;
// 导出一个函数，用于设置设备类型
export const setTypePower = (type: any = null, batvolVal = '') => {
  // 如果type参数存在
  if (type) {
    // 如果type参数中包含#号，则将#号分割
    if (type.indexOf('#') != -1) {
      type = type.split('#')[0];
    }
    // 如果DeviceTypeAT中不存在type参数，则抛出错误
    if (!DeviceTypeAT[type]) {
      throw new Error('DeviceTypeAT is null');
    }
    DeviceAttribute = DeviceTypeAT[type];
    instructRead = DeviceAttribute.read;
    instructSetup = DeviceAttribute.setup;
    if (batvolVal != '') {
      const newInstruct = getNewInstruct();
      instructRead = Object.assign({}, DeviceAttribute.read, newInstruct.read);
      instructSetup = Object.assign({}, DeviceAttribute.setup, newInstruct.setup);
    }
    // 向window.eventBus发送一个typePower事件，参数为instructRead和instructSetup中的属性
    window.eventBus.emit('typePower', [
      ...Object.keys(instructRead),
      ...Object.keys(instructSetup),
    ]);
  } else {
    // 如果type参数不存在，则将instructRead和instructSetup赋值为空数组
    instructRead = [];
    instructSetup = [];
    // 向window.eventBus发送一个typePower事件，参数为空数组
    window.eventBus.emit('typePower', []);
  }
};
// 导出一个异步函数，用于创建设备实例
export const createDeviceInstance = async (deviceInfo): Promise<DeviceInstance> => {
  // 将设备信息赋值给deviceExample
  deviceExample.deviceInfo = deviceInfo;
  // 初始化设备记录
  deviceExample.record = {};
  // 获取设备类型
  const deviceTypeDate = await deviceExample.getType(deviceType);
  // 根据是否有电量参数判断配置
  const batvolData = await deviceExample.getType(batvol);
  // 设置设备操作类型
  setTypePower(deviceTypeDate.value, batvolData.value);
  // 初始化设备
  await deviceExample?.init(deviceInfo);
  return deviceExample;
};

class DeviceInstance {
  // 设备实例
  device: any = null;
  // 设备信息
  deviceInfo: DeviceType | null = null;
  // 数据库
  database: any = null;
  // 操作类型
  operate: OperateTypeItem | null = null;
  // 记录
  record: any = {};
  // 操作配置
  operateConfig: OperateType<any> = {};
  // 是否完成
  isComplete: boolean = true;
  // 操作列表
  actionList: OperateTypeItem[] = [];
  // csv数据
  csvData: TimeType[] = [];
  // csv名称
  csvName: string = '';
  markList: any[] = [];
  // 驱动
  drive: any = null;
  // 参数
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
      // 打印data
      console.log(data);
      // 解构data
      const { key, value } = data;

      this.formatParam(key, value);
      // 调用repeatOperation方法
      this.repeatOperation();
    } catch (error) {
      // 打印错误信息
      console.log(error);
      // 调用repeatOperation方法
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
    const index = this.actionList.findIndex(res => res.name === item.name);
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
    await ipcRenderer.invoke('hidClose', { path: '', value: '' });
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
        }, 300);
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
    // 设置csvData
    this.csvData = csvData;

    if (csvData.length > 0) {
      // 设置第一条记录的时间
      const firstRecordTime = dayjs(csvData[0].timeStamp).format('YYYY-MM-DD HH:mm:ss');
      this.record.firstRecordTime = firstRecordTime;

      // 设置最后一条记录的时间
      const lastRecordTime = dayjs(csvData[csvData.length - 1].timeStamp).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      this.record.lastRecordedTime = lastRecordTime;

      // 查找最大值和最小值
      const { max, min } = findMinMax(csvData, 0, csvData.length - 1);

      // 设置最大值和最小值
      this.record.maximumValue = max;
      this.record.minimumValue = min;
    } else {
      this.record.firstRecordTime = dayjs().format(
        `${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`
      );
      this.record.lastRecordedTime = dayjs().format(
        `${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`
      );
      this.record.maximumValue = 0;
      this.record.minimumValue = 0;
    }

    // 转换时区
    this.record.timeZone = convertTZ(this.record.time);
    // 设置固件版本
    if (!this.record.firmwareVersion) {
      this.record.firmwareVersion = 'V1.02';
    }
    if (!this.record.hardwareVersion) {
      this.record.hardwareVersion = 'M2MR21';
    }
    if (this.record.shipment1 || this.record.shipment) {
      this.record.shipment =
        this.record.shipment1 +
        this.record.shipment2 +
        this.record.shipment3 +
        this.record.shipment4 +
        this.record.shipment5 +
        this.record.shipment6 +
        this.record.shipment7;
    }
  }
  private formatParam(key, val: string) {
    const { record } = this;
    if (key == 'deviceType') {
      const todo = this.operate?.getData(val) || '';
      this.record = Object.assign({}, record, {
        [key]: todo[0],
        hardwareVersion: todo[1],
        firmwareVersion: todo[2],
      });
      return;
    }
    this.record = Object.assign({}, record, {
      [key]: val != '' ? this.operate?.getData(val) : val,
    });
  }
}
// 寻找数组中的最大值和最小值
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

export const deviceExample: DeviceInstance = new DeviceInstance();

// 判断是否为OK
const isOk = (data: any) => {
  return data == 'OK' ? true : data;
};

let timeout;
const updateDevice = () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  timeout = setTimeout(() => {
    deviceExample.setCsvData(deviceExample.csvData);
    window.eventBus.emit('updateDevice', Object.assign({}, deviceExample));
  }, 3000);
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
  /** 设置行程id*/
  setShipmentId: async value => {
    const tempPeriod = instructSetup.setShipmentId;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.shipmentId);
    return data;
  },
  /** 设置行程描述*/
  setShipmentDescribe: async (val: string[]) => {
    const readList = [
      instructRead.shipment1,
      instructRead.shipment2,
      instructRead.shipment3,
      instructRead.shipment4,
      instructRead.shipment5,
      instructRead.shipment6,
      instructRead.shipment7,
    ];
    for (let i = 0; i < 7; i++) {
      const str = val[i] || ' ';
      const tempPeriod = instructSetup[`setShipment${i + 1}`];
      tempPeriod.param = str;
      await setOperateDevice(tempPeriod);
    }
    for (let i = 0; i < readList.length; i++) {
      const read = readList[i];
      read && (await deviceExample.write(read));
      await updateDevice();
    }
  },
  /** 设置重复启动*/
  setMultIdMulton: async value => {
    const tempPeriod = instructSetup.setMultIdMulton;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.multIdMulton);
    return data;
  },
  /** 设置PDF语言*/
  setPdfLan: async value => {
    const tempPeriod = instructSetup.setPdfLan;
    tempPeriod.param = value;
    const data = await setOperateDevice(tempPeriod, instructRead.pdfLan);
    return data;
  },
  /** 多级报警设置 */
  alarmSettings: async alarmData => {
    const highTemp1Setup = instructSetup.setHighTemp1;
    highTemp1Setup.param = alarmData.highTemp1;
    await setOperateDevice(highTemp1Setup);
    const highTemp2Setup = instructSetup.setHighTemp2;
    highTemp2Setup.param = alarmData.highTemp2;
    await setOperateDevice(highTemp2Setup);
    const lowTemp1Setup = instructSetup.setLowTemp1;
    lowTemp1Setup.param = alarmData.lowTemp1;
    await setOperateDevice(lowTemp1Setup);
    const lowTemp2Setup = instructSetup.setLowTemp2;
    lowTemp2Setup.param = alarmData.lowTemp2;
    await setOperateDevice(lowTemp2Setup);
    await deviceOperate.setLowtEmp(alarmData.lowtEmp);
    await deviceOperate.setHightEmp(alarmData.hightEmp);
    // 防止设备还未写入
    await sleep(500);
    await deviceExample.write(instructRead.highTemp1);
    await updateDevice();
    await sleep(500);
    await deviceExample.write(instructRead.highTemp2);
    await updateDevice();
    await sleep(500);
    await deviceExample.write(instructRead.lowTemp1);
    await updateDevice();
    await sleep(500);
    await deviceExample.write(instructRead.lowTemp2);
    await updateDevice();
  },
};
