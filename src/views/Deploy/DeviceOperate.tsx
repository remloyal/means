import { HUMI_UNIT, OPERATE_CONFIG } from '@/config';
import { deviceConfigParam, equipment, importDeviceParam } from '@/stores';
import { deviceOperate } from '@/utils/deviceOperation';
import { c2f, f2c, dealInt } from '@/utils/utils';
import { Col, Input, InputNumber, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

const getTimeOptions = (index: number = 12) => {
  const option: { value: string | number; label: string | number }[] = [];
  for (let i = 0; i <= index; i++) {
    option.push({
      value: i * 3600,
      label: i,
    });
  }
  return option;
};

const getMinuteOptions = (startIndex = 0, endIndex = 60) => {
  const option: { value: string | number; label: string | number }[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    option.push({
      value: i * 60,
      label: i,
    });
  }
  return option;
};
const getOptions = (list: number[]) => {
  const option: { value: string | number; label: string | number }[] = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    option.push({
      value: item * 60,
      label: item,
    });
  }
  return option;
};
const PeriodDomTime: number[] = [60, 120, 300, 600, 1800, 3600];
// 记录间隔
export const TempPeriodDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      console.log('DeployBasic 更新...');
      setTempPeriod();
    }
  }, [state]);
  useEffect(() => {
    initTime();
  }, []);
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [minute, setMinute] = useState(0);
  const [minuteOptions, setMinuteOptions] = useState(getOptions([1, 2, 5, 10, 30, 60]));
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);

  const initTime = () => {
    let times = (device?.record.tempPeriod as number) ?? 60;
    if (times === 0) {
      times = 60;
    }
    if (times >= 3600) {
      times = 3600;
    }
    if (!PeriodDomTime.includes(times)) {
      times = 60;
    }
    setMinute(times);
    setDeviceConfig(item => {
      return {
        ...item,
        tempPeriod: times,
      };
    });
  };

  const minuteChange = val => {
    setMinute(val);
    setDeviceConfig(item => {
      return {
        ...item,
        tempPeriod: val,
      };
    });
  };

  const setTempPeriod = async () => {
    // const times = time === 43200 ? time : time + minute;
    if (minute != device?.record.tempPeriod) {
      await deviceOperate.setTempPeriod(minute);
    }
  };

  const initConfig = deviceData => {
    if (deviceData && Object.keys(deviceData).includes('tempPeriod')) {
      minuteChange(deviceData.tempPeriod);
    }
  };
  const importConfig = useRecoilValue(importDeviceParam);
  useEffect(() => {
    initConfig(importConfig);
  }, [importConfig]);

  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('deploy.recordInterval')}</div>
      <div className="deploy-select">
        <Select
          value={minute}
          onChange={minuteChange}
          options={minuteOptions}
          popupClassName="deploy-select-popup"
          size="small"
          style={{ width: '50%' }}
        />
        <span className="deploy-span">M</span>
      </div>
    </Col>
  );
};

// 启动模式
export const StartModeDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      // setTempPeriod();
    }
  }, [state]);

  const { t } = useTranslation();
  const [startMode, setStartMode] = useState(0);
  const [device, setDevice] = useRecoilState(equipment);

  const handleChange = value => {
    console.log(`selected ${value}`);
    setStartMode(value);
  };

  useEffect(() => {
    const multIdBootMode = device?.record.multIdBootMode;
    if (multIdBootMode) {
      setStartMode(parseInt(multIdBootMode));
    }
  }, []);

  const setTempPeriod = async () => {
    console.log(startMode, device?.record.multIdBootMode);
    await deviceOperate.setMultidBootMode(startMode);
  };

  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('home.startMode')}</div>
      <div className="deploy-select">
        <Select
          defaultValue={0}
          value={startMode}
          style={{ width: 120 }}
          onChange={handleChange}
          size="small"
          disabled
          options={[
            { label: t('deploy.buttonStart'), value: 0 },
            { label: t('deploy.timingOn'), value: 1 },
          ]}
        />
      </div>
    </Col>
  );
};

// 启动延时
export const StartDelayDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setTempPeriod();
    }
  }, [state]);
  useEffect(() => {
    initTime();
    window.eventBus.on('deviceConfig', deviceData => {
      if (deviceData.startDelayTime) {
        initTime(deviceData.startDelayTime);
      }
    });
  }, []);
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState(0);
  const [minute, setMinute] = useState(0);
  const [timeState, setTimeState] = useState(false);
  const [minuteState, setMinuteState] = useState(false);
  const timeOptions = getTimeOptions(23);
  const minuteOptions = getMinuteOptions();
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);

  const initTime = (data = null) => {
    let times = (device?.record.startDelayTime as number) ?? 0;
    if (data) {
      times = data;
    }
    if (times == 86400) {
      setDay(86400);
      setTimeState(true);
      setMinuteState(true);
      return;
    }

    if (times === 0) {
      setDay(0);
      setTime(0);
      setMinute(0);
      return;
    }
    // 秒数转时分
    const timePart = times / 60;
    const hour = Math.floor(timePart / 60);
    const minute = timePart % 60;
    setTime(hour * 3600);
    setMinute(minute * 60);
    setDeviceConfig(item => {
      return {
        ...item,
        startDelayTime: times,
      };
    });
  };

  const dayChange = day => {
    setDay(day);
    if (day === 86400) {
      setTimeState(true);
      setMinuteState(true);
      setTime(0);
      setMinute(0);
    } else {
      setTimeState(false);
      setMinuteState(false);
    }
  };

  const timeChange = time => {
    setTime(time);
  };

  const minuteChange = minute => {
    setMinute(minute);
  };

  const setTempPeriod = async () => {
    const times = day === 86400 ? day : time + minute;
    if (times != device?.record.startDelayTime) {
      await deviceOperate.setStartDelay(times);
    }
  };

  useEffect(() => {
    const times = day === 86400 ? day : time + minute;
    setDeviceConfig(item => {
      return {
        ...item,
        startDelayTime: times,
      };
    });
  }, [day, time, minute]);
  const initConfig = deviceData => {
    if (deviceData && Object.keys(deviceData).includes('startDelayTime')) {
      initTime(deviceData.startDelayTime);
    }
  };
  const importConfig = useRecoilValue(importDeviceParam);
  useEffect(() => {
    initConfig(importConfig);
  }, [importConfig]);
  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('home.startDelay')}</div>
      <div className="deploy-select">
        <Select
          value={day}
          onChange={dayChange}
          options={[
            {
              value: 0,
              label: 0,
            },
            {
              value: 86400,
              label: 1,
            },
          ]}
          popupClassName="deploy-select-popup"
          size="small"
        />
        <span className="deploy-span">D</span>
        <Select
          value={time}
          onChange={timeChange}
          options={timeOptions}
          disabled={timeState}
          popupClassName="deploy-select-popup"
          size="small"
        />
        <span className="deploy-span">H</span>
        <Select
          value={minute}
          onChange={minuteChange}
          options={minuteOptions}
          popupClassName="deploy-select-popup"
          size="small"
          disabled={minuteState}
        />
        <span className="deploy-span">M</span>
      </div>
    </Col>
  );
};

// 温度阈值上限
export const HightEmpDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setHightEmp();
    }
  }, [state]);
  useEffect(() => {
    init();
    return () => {
      setDeviceConfig({});
    };
  }, []);
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);
  const importConfig = useRecoilValue(importDeviceParam);
  const [emp, setEmp] = useState(0);
  const [unit, setUnit] = useState(0);
  const [configState, setConfigState] = useState(false);
  const empChange = num => {
    num = dealInt(num, deviceConfig.lowtEmp, 1);
    setEmp(num);
    setDeviceConfig(item => {
      return {
        ...item,
        hightEmp: num,
      };
    });
  };
  const init = () => {
    const multidUnit = device?.record.multidUnit;
    const hightEmp = device?.record.hightEmp;
    let value = hightEmp || 0;
    if (parseInt(multidUnit) == 0) {
      value = hightEmp;
    } else {
      value = c2f(hightEmp);
    }
    setEmp(value);
    setDeviceConfig(item => {
      return {
        ...item,
        hightEmp: value,
      };
    });
    setUnit(multidUnit);
    setConfigState(true);
  };

  const initConfig = deviceData => {
    if (deviceData && Object.keys(deviceData).includes('hightEmp') && configState) {
      setTimeout(() => {
        empChange(deviceData.hightEmp);
      });
    }
  };

  const setHightEmp = async () => {
    if (emp != device?.record.hightEmp) {
      if (unit == 0) {
        await deviceOperate.setHightEmp(emp * 10);
      } else {
        await deviceOperate.setHightEmp(f2c(emp) * 10);
      }
    }
  };
  useEffect(() => {
    init();
  }, [device]);

  useEffect(() => {
    initConfig(importConfig);
  }, [importConfig]);

  useEffect(() => {
    if (deviceConfig && Object.keys(deviceConfig).includes('multidUnit') && configState) {
      const unity = unit;
      const data = emp;
      // 1 ==> 0
      if (unity > deviceConfig.multidUnit) {
        const num = f2c(data);
        setUnit(deviceConfig.multidUnit);
        setEmp(num);
        setDeviceConfig(item => {
          return {
            ...item,
            hightEmp: num,
          };
        });
      }
      // 0 ==> 1
      if (unity < deviceConfig.multidUnit) {
        const num = c2f(data);
        setUnit(deviceConfig.multidUnit);
        setEmp(num);
        setDeviceConfig(item => {
          return {
            ...item,
            hightEmp: num,
          };
        });
      }
    }
  }, [deviceConfig.multidUnit]);
  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('deploy.heatUpperLimit')}</div>
      <div className="deploy-select">
        <InputNumber
          size="small"
          min={deviceConfig.lowtEmp}
          max={unit == 1 ? c2f(OPERATE_CONFIG.MAX_TEMP) : OPERATE_CONFIG.MAX_TEMP}
          onChange={empChange}
          value={emp}
          style={{ width: '80%' }}
          step="0.1"
        />
        <span className="deploy-span">{unit == 0 ? '\u2103' : '\u2109'}</span>
      </div>
    </Col>
  );
};

// 温度阈值下限
export const LowEmpDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setLowtEmp();
    }
  }, [state]);
  useEffect(() => {
    init();
  }, []);
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);
  const importConfig = useRecoilValue(importDeviceParam);
  const [emp, setEmp] = useState(0.0);
  const [unit, setUnit] = useState(0);
  const [configState, setConfigState] = useState(false);
  const empChange = num => {
    num = dealInt(num, 0, 1);
    setEmp(num);
    setDeviceConfig(item => {
      return {
        ...item,
        lowtEmp: num,
      };
    });
  };

  const init = () => {
    const multidUnit = device?.record.multidUnit;
    const lowtEmp = device?.record.lowtEmp;
    let value = lowtEmp || 0;
    if (parseInt(multidUnit) == 0) {
      value = lowtEmp;
    } else {
      value = c2f(lowtEmp);
    }
    setUnit(parseInt(multidUnit));
    setEmp(value);
    setDeviceConfig(item => {
      return {
        ...item,
        lowtEmp: value,
      };
    });
    setConfigState(true);
  };

  const initConfig = deviceData => {
    if (deviceData && Object.keys(deviceData).includes('lowtEmp') && configState) {
      // const unity = deviceData.multidUnit;
      setTimeout(() => {
        empChange(deviceData.lowtEmp);
      });
    }
  };

  const setLowtEmp = async () => {
    if (emp != device?.record.lowtEmp) {
      if (unit == 0) {
        await deviceOperate.setLowtEmp(emp * 10);
      } else {
        await deviceOperate.setLowtEmp(f2c(emp) * 10);
      }
    }
  };

  useEffect(() => {
    init();
  }, [device]);
  useEffect(() => {
    initConfig(importConfig);
  }, [importConfig]);

  useEffect(() => {
    if (deviceConfig && Object.keys(deviceConfig).includes('multidUnit') && configState) {
      const unity = unit;
      const data = emp;
      // 1 ==> 0
      if (unity > deviceConfig.multidUnit) {
        const num = f2c(data);
        setUnit(deviceConfig.multidUnit);
        setEmp(num);
        setDeviceConfig(item => {
          return {
            ...item,
            lowtEmp: num,
          };
        });
      }
      // 0 ==> 1
      if (unity < deviceConfig.multidUnit) {
        const num = c2f(data);
        setUnit(deviceConfig.multidUnit);
        setEmp(num);
        setDeviceConfig(item => {
          return {
            ...item,
            lowtEmp: num,
          };
        });
      }
    }
  }, [deviceConfig.multidUnit]);
  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('deploy.heatLowerLimit')}</div>
      <div className="deploy-select">
        <InputNumber
          size="small"
          max={deviceConfig.hightEmp}
          min={unit == 1 ? c2f(OPERATE_CONFIG.MIN_TEMP) : OPERATE_CONFIG.MIN_TEMP}
          onChange={empChange}
          value={emp}
          style={{ width: '80%' }}
          step="0.1"
        />
        <span className="deploy-span">{unit == 0 ? '\u2103' : '\u2109'}</span>
      </div>
    </Col>
  );
};

// 湿度阈值上限
export const HightHumiDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setHighHumi();
    }
  }, [state]);
  useEffect(() => {
    init();
  }, []);
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);
  const importConfig = useRecoilValue(importDeviceParam);
  const [emp, setEmp] = useState(0);
  const empChange = num => {
    num = dealInt(num, deviceConfig.lowHumi, 0);
    setEmp(num);
    setDeviceConfig(item => {
      return {
        ...item,
        highHumi: num,
      };
    });
  };
  const init = () => {
    const highHumi = device?.record.highHumi;
    setEmp(highHumi);
    setDeviceConfig(item => {
      return {
        ...item,
        highHumi,
      };
    });
  };
  const initConfig = (deviceData: any) => {
    if (deviceData && Object.keys(deviceData).includes('highHumi')) {
      setEmp(deviceData.highHumi);
    }
  };
  const setHighHumi = async () => {
    if (emp != parseInt(device?.record.highHumi)) {
      await deviceOperate.setHightHumi(emp);
    }
  };
  useEffect(() => {
    initConfig(importConfig);
  }, [importConfig]);
  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('deploy.humiUpperLimit')}</div>
      <div className="deploy-select">
        <InputNumber
          size="small"
          min={deviceConfig.lowHumi}
          max={OPERATE_CONFIG.MAX_HUMI}
          onChange={empChange}
          value={emp}
          style={{ width: '70%' }}
        />
        <span className="deploy-span">{HUMI_UNIT}</span>
      </div>
    </Col>
  );
};

// 湿度阈值下限
export const LowHumiDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setLowHumi();
    }
  }, [state]);
  useEffect(() => {
    init();
  }, []);
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);
  const importConfig = useRecoilValue(importDeviceParam);
  const [emp, setEmp] = useState(0);
  const empChange = num => {
    num = dealInt(num, OPERATE_CONFIG.MIN_HUMI, 0);
    setEmp(num);
    setDeviceConfig(item => {
      return {
        ...item,
        lowHumi: num,
      };
    });
  };
  const init = () => {
    const lowHumi = device?.record.lowHumi;
    setEmp(lowHumi);
    setDeviceConfig(item => {
      return {
        ...item,
        lowHumi,
      };
    });
  };
  const initConfig = (deviceData: any) => {
    if (deviceData && Object.keys(deviceData).includes('lowHumi')) {
      setEmp(deviceData.lowHumi);
    }
  };
  const setLowHumi = async () => {
    if (emp != parseInt(device?.record.lowHumi)) {
      await deviceOperate.setLowtHumi(emp);
    }
  };
  useEffect(() => {
    initConfig(importConfig);
  }, [importConfig]);
  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('deploy.humiLowerLimit')}</div>
      <div className="deploy-select">
        <InputNumber
          size="small"
          min={OPERATE_CONFIG.MIN_HUMI}
          max={deviceConfig.highHumi}
          onChange={empChange}
          value={emp}
          style={{ width: '70%' }}
        />
        <span className="deploy-span">{HUMI_UNIT}</span>
      </div>
    </Col>
  );
};
