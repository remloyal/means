export const instructRead: OperateType<OperateTypeItem> = {
  deviceType: {
    key: 'deviceType',
    name: '获取设备型号',
    order: () => 'AT+GETDEVTYPE:',
    getData: data => {
      const todo = data.split('#');
      return todo;
    },
  },
  multidUnit: {
    key: 'multidUnit',
    name: '读取温度单位',
    order: () => 'AT+GETMULTID:UNIT:',
    getData: data => {
      return parseInt(data.split(':')[1]);
    },
  },
  multIdBootMode: {
    key: 'multIdBootMode',
    name: '读取启动模式',
    order: () => 'AT+GETMULTID:BootMode:',
    getData: data => {
      return data.split(':')[1];
    },
  },
  multIdBootTime: {
    key: 'multIdBootTime',
    name: '读取定时启动时间',
    order: () => 'AT+GETMULTID:BootTime:',
    getData: data => {
      return data.split(':')[1];
    },
  },
  multIdSleepTime: {
    key: 'multIdSleepTime',
    name: '读取灭屏时间',
    order: () => 'AT+GETMULTID:SLEEPTIME:',
    getData: data => {
      return parseInt(data.split(':')[1]);
    },
  },

  multIdExpTime: {
    key: 'multIdExpTime',
    name: '读取过期时间',
    order: () => 'AT+GETMULTID:EXPTIME:',
    getData: data => {
      return data.split(':')[1];
    },
  },

  getsn: {
    key: 'getsn',
    name: '读取设备编号',
    order: () => 'AT+GETSN:',
    getData: data => {
      return data.split(':')[1].replaceAll(';', '');
    },
  },
  startDelayTime: {
    key: 'startDelayTime',
    name: '读取StartDelay时间',
    order: () => 'AT+GETDSTARTTIME:',
    getData: data => {
      return data.split(':')[1].replaceAll(';', '');
    },
  },
  tempPeriod: {
    key: 'tempPeriod',
    name: '读取记录间隔',
    order: () => 'AT+GETTEMPPERIOD:',
    getData: data => {
      return parseInt(data.split(':')[1].replaceAll(';', ''));
    },
  },
  getTime: {
    key: 'time',
    name: '读取设备时间和时区',
    order: () => 'AT+GETTIME:',
    getData: data => {
      return data;
    },
  },

  hightEmp: {
    key: 'hightEmp',
    name: '读取温度阈值上限',
    order: () => 'AT+GETHIGHTEMP:',
    getData: data => {
      return (parseInt(data.split(':')[1]) / 10).toFixed(1);
    },
  },

  lowtEmp: {
    key: 'lowtEmp',
    name: '读取温度阈值下限',
    order: () => 'AT+GETLOWTEMP:',
    getData: data => {
      return (parseInt(data.split(':')[1]) / 10).toFixed(1);
    },
  },

  mode: {
    key: 'mode',
    name: '读取设备状态',
    order: () => 'AT+GETMODE:',
    getData: data => {
      return data.split(':')[1].replaceAll(';', '');
    },
  },
  keyStopEnableget: {
    key: 'keyStopEnableget',
    name: '读取按键停止状态',
    order: () => 'AT+KEYSTOPENABLEGET:',
    getData: data => {
      return parseInt(data.replaceAll(';', '').split(':')[1]);
    },
  },
  pdfPwd: {
    key: 'pdfPwd',
    name: '读取PDF密码',
    order: () => 'AT+GETPDFPWD:',
    getData: data => {
      return data.replaceAll(';', '').split(':')[1];
    },
  },
};

export const instructSetup: OperateType<OperateTypeItem> = {
  setMultidUnit: {
    key: 'setMultidUnit',
    name: '设置温度单位',
    order: str => `AT+SETMULTID:UNIT:${str}`,
    getData: data => {
      return data;
    },
  },
  setMultidBootMode: {
    key: 'setMultidBootMode',
    name: '设置启动模式',
    order: str => `AT+SETMULTID:BootMode:${str}`,
    getData: data => {
      return data;
    },
  },
  setMultidBootTime: {
    key: 'setMultidBootTime',
    name: '设置定时开启时间',
    order: str => `AT+SETMULTID:BootTime:${str}`,
    getData: data => {
      return data;
    },
  },
  setMultidSleepTime: {
    key: 'setMultidSleepTime',
    name: '设置灭屏时间',
    order: str => `AT+SETMULTID:SLEEPTIME:${str}`,
    getData: data => {
      return data;
    },
  },

  setMultidExpTime: {
    key: 'setMultidExpTime',
    name: '设置过期时间',
    order: str => `AT+SETMULTID:EXPTIME:${str}`,
    getData: data => {
      return data;
    },
  },
  setStartDelay: {
    key: 'setStartDelay',
    name: '设置StartDelay时间',
    order: str => `AT+SETDSTARTTIME:${str}`,
    getData: data => {
      return data;
    },
  },

  setTempPeriod: {
    key: 'setTempPeriod',
    name: '设置记录间隔',
    order: str => `AT+SETTEMPPERIOD:${str}`,
    getData: data => {
      return data;
    },
  },
  setTime: {
    key: 'setTime',
    name: '设置设备时间和时区',
    order: str => `AT+SETTIME:${str}`,
    getData: data => {
      return data;
    },
  },
  setHightEmp: {
    key: 'setHightEmp',
    name: '设置温度阈值上限',
    order: str => `AT+SETHIGHTEMP:${str}`,
    getData: data => {
      return data;
    },
  },
  setLowtEmp: {
    key: 'setLowtEmp',
    name: '设置温度阈值下限',
    order: str => `AT+SETLOWTEMP:${str}`,
    getData: data => {
      return data;
    },
  },
  setKeyStopEnableset: {
    key: 'setKeyStopEnableset',
    name: '设置按键停止',
    order: str => `AT+KEYSTOPENABLESET:${str}`,
    getData: data => {
      return data;
    },
  },
  setPdfPwd: {
    key: 'setPdfPwd',
    name: '设置PDF密码',
    order: str => `AT+SETPDFPWD:${str}`,
    getData: data => {
      return data;
    },
  },
  setAdjustTime: {
    key: 'setAdjustTime',
    name: '调整时间和时区',
    order: str => `AT+ADJUSTTIME:${str}`,
    getData: data => {
      return data;
    },
  },

  setDevreStore: {
    key: 'setDevreStore',
    name: '重置设备(恢复静默)',
    order: str => `AT+DEVRESTORE:${str}`,
    getData: data => {
      return data;
    },
  },

  setDevreSet: {
    key: 'setDevreSet',
    name: '重启设备',
    order: str => `AT+DEVRESET:${str}`,
    getData: data => {
      return data;
    },
  },
};

export const deviceType = {
  key: 'deviceType',
  name: '获取设备型号',
  order: () => 'AT+GETDEVTYPE:',
  getData: data => data,
};
export const batvol = {
  key: 'batvol',
  name: '读取设备电量',
  order: () => 'AT+GETBATVOL:',
  getData: data => {
    return data.split(':')[1].replaceAll(';', '');
  },
};

export const getNewInstruct = () => {
  const read = {
    batvol: {
      key: 'batvol',
      name: '读取设备电量',
      order: () => 'AT+GETBATVOL:',
      getData: data => {
        return data.split(':')[1].replaceAll(';', '');
      },
    },
    multIdMulton: {
      key: 'multIdMulton',
      name: '获取重复启动',
      order: () => 'AT+GETMULTID:MULTON:',
      getData: data => {
        return data.replaceAll(';', '').split(':')[2];
      },
    },
    shipmentId: {
      key: 'shipmentId',
      name: '获取shipment ID',
      order: () => 'AT+GETMULTID:SID:',
      getData: data => {
        return data.replaceAll(';', '').split(':')[2];
      },
    },
    pdfLan: {
      key: 'pdfLan',
      name: '读取PDF语言',
      order: () => 'AT+GETPDFLAN:',
      getData: data => {
        return data.replaceAll(';', '').split(':')[1];
      },
    },
    highTemp1: {
      key: 'highTemp1',
      name: '获读温度2阈值上限',
      order: () => 'AT+GETHIGHT2:',
      getData: data => {
        console.log('highTemp1 ===============>', data);

        return (parseInt(data.split(':')[1]) / 10).toFixed(1);
      },
    },
    highTemp2: {
      key: 'highTemp2',
      name: '获读温度3阈值上限',
      order: () => 'AT+GETHIGHT3:',
      getData: data => {
        return (parseInt(data.split(':')[1]) / 10).toFixed(1);
      },
    },
    lowTemp1: {
      key: 'lowTemp1',
      name: '读取温度2阈值下限',
      order: () => 'AT+GETLOWT2:',
      getData: data => {
        return (parseInt(data.split(':')[1]) / 10).toFixed(1);
      },
    },
    lowTemp2: {
      key: 'lowTemp2',
      name: '读取温度3阈值下限',
      order: () => 'AT+GETLOWT3:',
      getData: data => {
        return (parseInt(data.split(':')[1]) / 10).toFixed(1);
      },
    },
    // lowtEmp
  };

  const setup = {
    setMultIdMulton: {
      key: 'setMultIdMulton',
      name: '设置重复启动',
      order: str => `AT+SETMULTID:MULTON:${str}`,
      getData: data => {
        return data.replaceAll(';', '').split(':')[2];
      },
    },
    setShipmentId: {
      key: 'setShipmentId',
      name: '设置Shipment ID',
      order: str => `AT+SETMULTID:SID:${str}`,
      getData: data => {
        return data;
      },
    },
    setPdfLan: {
      key: 'setPdfLan',
      name: '设置PDF语言',
      order: str => `AT+SETPDFLAN:${str}`,
      getData: data => {
        return data;
      },
    },
    setHighTemp1: {
      key: 'setHighTemp1',
      name: '设置温度2阈值上限',
      order: str => `AT+SETHIGHT2:${str}`,
      getData: data => {
        return data;
      },
    },
    setLowTemp1: {
      key: 'setLowTemp1',
      name: '设置温度2阈值下限',
      order: str => `AT+SETLOWT2:${str}`,
      getData: data => {
        return data;
      },
    },
    setHighTemp2: {
      key: 'setHighTemp2',
      name: '设置温度3阈值上限',
      order: str => `AT+SETHIGHT3:${str}`,
      getData: data => {
        return data;
      },
    },
    setLowTemp2: {
      key: 'setLowTemp2',
      name: '设置温度3阈值下限',
      order: str => `AT+SETLOWT3:${str}`,
      getData: data => {
        return data;
      },
    },
  };

  [...new Array(7).keys()].map((_, i) => {
    i += 1;
    read[`shipment${i}`] = {
      key: `shipment${i}`,
      name: `获取shipment描述${i}`,
      order: () => `AT+GETMULTID:SD${i}:`,
      getData: (data: string) => {
        return data.replaceAll(';', '').split(':')[2];
      },
    };
    setup[`setShipment${i}`] = {
      key: `setShipment${i}`,
      name: `设置shipment描述${i}`,
      order: str => `AT+SETMULTID:SD${i}:${str}`,
      getData: (data: string) => {
        return data;
      },
    };
  });
  return { read, setup };
};

const humi = {
  highHumi: {
    key: 'highHumi',
    name: '读取湿度阈值上限',
    order: () => 'AT+GETHIGHHUMI:',
    getData: data => {
      return parseInt(data.split(':')[1]);
    },
  },
  lowHumi: {
    key: 'lowHumi',
    name: '读取湿度阈值下限',
    order: () => 'AT+GETLOWHUMI:',
    getData: data => {
      return parseInt(data.split(':')[1]);
    },
  },
};
const humiSet = {
  setHighHumi: {
    key: 'setHighHumi',
    name: '设置湿度阈值上限：',
    order: str => `AT+SETHIGHHUMI:${str}`,
    getData: data => {
      return data;
    },
  },
  setLowHumi: {
    key: 'setLowHumi',
    name: '设置湿度阈值下限',
    order: str => `AT+SETLOWHUMI:${str}`,
    getData: data => {
      return data;
    },
  },
};

export const DeviceTypeAT = {
  M2H: { read: { ...instructRead, ...humi }, setup: { ...instructSetup, ...humiSet } },
  M1H: { read: { ...instructRead, ...humi }, setup: { ...instructSetup, ...humiSet } },
  M2D: { read: instructRead, setup: instructSetup },
  M2E: { read: instructRead, setup: instructSetup },
};
