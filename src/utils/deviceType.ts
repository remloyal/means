export const instructRead: OperateType<OperateTypeItem> = {
  deviceType: {
    key: 'deviceType',
    name: '获取设备型号',
    order: () => 'AT+GETDEVTYPE:',
    getData: data => data,
  },
  multidUnit: {
    key: 'multidUnit',
    name: '读取温度单位',
    order: () => 'AT+GETMULTID:UNIT:',
    getData: data => {
      return data.split(':')[1];
    },
  },
  multId: {
    key: 'multId',
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
      return data.split(':')[1];
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
  //   batvol: {
  //     key: 'batvol',
  //     name: '读取设备电量',
  //     order: () => 'AT+GETBATVOL:',
  //     getData: data => {
  //       return data.split(':')[1].replaceAll(';', '');
  //     },
  //   },
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
      return data.split(':')[1].replaceAll(';', '');
    },
  },
  getTime: {
    key: 'getTime',
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
      return data.split(':')[1];
    },
  },

  lowtEmp: {
    key: 'lowtEmp',
    name: '读取温度阈值下限',
    order: () => 'AT+GETLOWTEMP:',
    getData: data => {
      return data.split(':')[1];
    },
  },

  highHumi: {
    key: 'highHumi',
    name: '读取湿度阈值上限',
    order: () => 'AT+GETHIGHHUMI:',
    getData: data => {
      return data.split(':')[1];
    },
  },
  lowHumi: {
    key: 'lowHumi',
    name: '读取湿度阈值下限',
    order: () => 'AT+GETLOWHUMI:',
    getData: data => {
      return data.split(':')[1];
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
      return data.split(':')[1];
    },
  },
  pdfPwd: {
    key: 'pdfPwd',
    name: '读取PDF密码',
    order: () => 'AT+GETPDFPWD:',
    getData: data => {
      return data;
    },
  },
};

export const instructSetup: OperateType<OperateTypeItem> = {
  setMultidUnit: {
    key: 'setMultidUnit',
    order: str => `AT+SETMULTID:UNIT:${str}`,
    name: '设置温度单位',
    getData: data => {
      return data;
    },
  },
};
