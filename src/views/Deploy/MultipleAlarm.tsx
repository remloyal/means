import { OPERATE_CONFIG } from '@/config';
import { deviceConfigParam, equipment } from '@/stores';
import { deviceOperate } from '@/utils/deviceOperation';
import { c2f, f2c } from '@/utils/utils';
import { Button, Checkbox, InputNumber, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

const keys = ['highTemp2', 'highTemp1', 'hightEmp', 'lowtEmp', 'lowTemp1', 'lowTemp2'];
// 多报警参数设置
export const MultipleAlarm = ({ state }: { state: boolean }) => {
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);
  const [unit, setUnit] = useState('\u2103');
  useEffect(() => {
    if (state) {
      setOperation();
    }
  }, [state]);
  // 报警值
  const [alarmInfo, setAlarmInfo] = useState({
    highTemp1: 0,
    highTemp2: 0,
    hightEmp: 0,
    lowTemp1: 0,
    lowTemp2: 0,
    lowtEmp: 0,
  });
  // 报警类型
  const [alarmType, setAlarmType] = useState({
    highTemp1: 0,
    highTemp2: 0,
    hightEmp: 0,
    lowTemp1: 0,
    lowTemp2: 0,
    lowtEmp: 0,
  });
  // 报警延时时间
  const [alarmDelayTime, setAlarmDelayTime] = useState({
    highTemp1: 0,
    highTemp2: 0,
    hightEmp: 0,
    lowTemp1: 0,
    lowTemp2: 0,
    lowtEmp: 0,
  });
  // 是否可选
  const [alarmState, setAlarmState] = useState({
    highTemp1: true,
    highTemp2: true,
    hightEmp: false,
    lowtEmp: false,
    lowTemp1: true,
    lowTemp2: true,
  });
  useEffect(() => {
    init();
    window.eventBus.on('deviceConfig', deviceData => {
      const {
        highTemp1 = [0, 0, 0, true],
        highTemp2 = [0, 0, 0, true],
        highTemp = [0, 0, 0, false],
        lowTemp1 = [0, 0, 0, true],
        lowTemp2 = [0, 0, 0, true],
        lowTemp = [0, 0, 0, false],
      } = deviceData || {};
      setAlarmInfo({
        highTemp1: highTemp1[0],
        highTemp2: highTemp2[0],
        hightEmp: highTemp[0],
        lowTemp1: lowTemp1[0],
        lowTemp2: lowTemp2[0],
        lowtEmp: lowTemp[0],
      });
      setAlarmType({
        highTemp1: highTemp1[1],
        highTemp2: highTemp2[1],
        hightEmp: highTemp[1],
        lowTemp1: lowTemp1[1],
        lowTemp2: lowTemp2[1],
        lowtEmp: lowTemp[1],
      });
      setAlarmDelayTime({
        highTemp1: highTemp1[2],
        highTemp2: highTemp2[2],
        hightEmp: highTemp[2],
        lowTemp1: lowTemp1[2],
        lowTemp2: lowTemp2[2],
        lowtEmp: lowTemp[2],
      });
      setAlarmState({
        highTemp1: highTemp1[3],
        highTemp2: highTemp2[3],
        hightEmp: highTemp[3],
        lowTemp1: lowTemp1[3],
        lowTemp2: lowTemp2[3],
        lowtEmp: lowTemp[3],
      });
    });

    return () => {
      window.eventBus.removeAllListeners('deviceConfig');
    };
  }, []);
  useEffect(() => {
    init();
  }, [device]);
  const init = async () => {
    const {
      highTemp1 = 0,
      highTemp2 = 0,
      hightEmp = 0,
      lowTemp1 = 0,
      lowTemp2 = 0,
      lowtEmp = 0,
      multidUnit = 0,
    } = device?.record || {};
    let c2fState = false;
    if (parseInt(multidUnit) == 0) {
      setUnit('\u2103');
    } else {
      c2fState = true;
      setUnit('\u2109');
    }
    const alarmData = {
      highTemp1: c2fState ? c2f(Number(highTemp1)) : Number(highTemp1),
      highTemp2: c2fState ? c2f(Number(highTemp2)) : Number(highTemp2),
      hightEmp: c2fState ? c2f(Number(hightEmp)) : Number(hightEmp),
      lowTemp1: c2fState ? c2f(Number(lowTemp1)) : Number(lowTemp1),
      lowTemp2: c2fState ? c2f(Number(lowTemp2)) : Number(lowTemp2),
      lowtEmp: c2fState ? c2f(Number(lowtEmp)) : Number(lowtEmp),
    };
    setAlarmInfo(alarmData);
    setAlarmState({
      highTemp1: highTemp1 != 0 ? false : true,
      highTemp2: highTemp2 != 0 ? false : true,
      hightEmp: hightEmp != 0 ? false : true,
      lowTemp1: lowTemp1 != 0 ? false : true,
      lowTemp2: lowTemp2 != 0 ? false : true,
      lowtEmp: lowtEmp != 0 ? false : true,
    });
  };

  const numberChange = (key, e) => {
    setAlarmInfo(item => {
      return {
        ...item,
        [key]: e,
      };
    });
  };

  const handleChange = (key, e) => {
    setAlarmType(item => {
      return {
        ...item,
        [key]: e,
      };
    });
  };

  const delayChange = (key, e) => {
    setAlarmDelayTime(item => {
      return {
        ...item,
        [key]: e,
      };
    });
  };

  useEffect(() => {
    setDeviceConfig(item => {
      return {
        ...item,
        highTemp1: [
          alarmInfo.highTemp1,
          alarmType.highTemp1,
          alarmDelayTime.highTemp1,
          alarmState.highTemp1,
        ],
        highTemp2: [
          alarmInfo.highTemp2,
          alarmType.highTemp2,
          alarmDelayTime.highTemp2,
          alarmState.highTemp2,
        ],
        highTemp: [
          alarmInfo.hightEmp,
          alarmType.hightEmp,
          alarmDelayTime.hightEmp,
          alarmState.hightEmp,
        ],
        lowTemp: [alarmInfo.lowtEmp, alarmType.lowtEmp, alarmDelayTime.lowtEmp, alarmState.lowtEmp],
        lowTemp1: [
          alarmInfo.lowTemp1,
          alarmType.lowTemp1,
          alarmDelayTime.lowTemp1,
          alarmState.lowTemp1,
        ],
        lowTemp2: [
          alarmInfo.lowTemp2,
          alarmType.lowTemp2,
          alarmDelayTime.lowTemp2,
          alarmState.lowTemp2,
        ],
      };
    });
  }, [alarmInfo, alarmType, alarmDelayTime, alarmState]);

  const keysLable = {
    highTemp2: `${t('deploy.overtop')}3:(${t('home.temperature')})`,
    highTemp1: `${t('deploy.overtop')}2:(${t('home.temperature')})`,
    hightEmp: `${t('deploy.overtop')}1:(${t('home.temperature')})`,
    lowtEmp: `${t('deploy.below')}1:(${t('home.temperature')})`,
    lowTemp1: `${t('deploy.below')}2:(${t('home.temperature')})`,
    lowTemp2: `${t('deploy.below')}3:(${t('home.temperature')})`,
  };

  const onChange = (key, e: any) => {
    const state = key == 'lowtEmp' ? false : key == 'hightEmp' ? false : !e.target.checked;
    if (key == 'highTemp2' && alarmState.highTemp1 == true) {
      setAlarmState(item => {
        return {
          ...item,
          [key]: state,
          highTemp1: state,
        };
      });
      return;
    }
    if (key == 'highTemp1' && alarmState.highTemp2 == false) {
      setAlarmState(item => {
        return {
          ...item,
          [key]: state,
          highTemp2: state,
        };
      });
      return;
    }
    if (key == 'lowTemp2' && alarmState.lowTemp1 == true) {
      setAlarmState(item => {
        return {
          ...item,
          [key]: state,
          lowTemp1: state,
        };
      });
      return;
    }
    if (key == 'lowTemp1' && alarmState.lowTemp2 == false) {
      setAlarmState(item => {
        return {
          ...item,
          [key]: state,
          lowTemp2: state,
        };
      });
      return;
    }
    setAlarmState(item => {
      return {
        ...item,
        [key]: state,
      };
    });
  };

  // 报警参数限制
  //   ['highTemp2', 'highTemp1', 'hightEmp', 'lowtEmp', 'lowTemp1', 'lowTemp2'];
  const onMin = (key): number => {
    if (['lowtEmp', 'lowTemp1', 'lowTemp2'].includes(key)) {
      return unit == '\u2109' ? c2f(OPERATE_CONFIG.MIN_TEMP) : OPERATE_CONFIG.MIN_TEMP;
    }
    if (key == 'highTemp2') {
      return alarmInfo.lowTemp2;
    }
    if (key == 'highTemp1') {
      return alarmInfo.lowTemp1;
    }
    if (key == 'hightEmp') {
      return alarmInfo.lowtEmp;
    }
    return unit == '\u2109' ? c2f(OPERATE_CONFIG.MIN_TEMP) : OPERATE_CONFIG.MIN_TEMP;
  };
  const onMax = (key): number => {
    if (['highTemp2', 'highTemp1', 'hightEmp'].includes(key)) {
      return unit == '\u2109' ? c2f(OPERATE_CONFIG.MAX_TEMP) : OPERATE_CONFIG.MAX_TEMP;
    }
    if (key == 'lowTemp2') {
      return alarmInfo.highTemp2;
    }
    if (key == 'lowTemp1') {
      return alarmInfo.highTemp1;
    }
    if (key == 'lowtEmp') {
      return alarmInfo.hightEmp;
    }
    return unit == '\u2109' ? c2f(OPERATE_CONFIG.MAX_TEMP) : OPERATE_CONFIG.MAX_TEMP;
  };
  const setOperation = async () => {
    const alarmData = {
      highTemp1: 0,
      highTemp2: 0,
      hightEmp: 0,
      lowTemp1: 0,
      lowTemp2: 0,
      lowtEmp: 0,
    };
    keys.forEach(key => {
      if (alarmState[key]) {
        alarmData[key] = 0;
      } else {
        if (parseInt(device?.record.multidUnit) == 0) {
          alarmData[key] = alarmInfo[key] * 10;
        } else {
          alarmData[key] = f2c(alarmInfo[key]) * 10;
        }
      }
    });
    deviceOperate.alarmSettings(alarmData);
  };
  return (
    <div style={{ padding: '10px 0' }}>
      {...keys.map(key => {
        return (
          <div
            style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}
            key={key}
          >
            <Checkbox checked={!alarmState[key]} onChange={e => onChange(key, e)}>
              {keysLable[key]}
            </Checkbox>
            <div>
              <InputNumber
                min={onMin(key)}
                max={onMax(key)}
                value={alarmInfo[key]}
                step={0.1}
                style={{ width: '90%' }}
                onChange={e => numberChange(key, e)}
                size="small"
                disabled={alarmState[key]}
              />
              {unit}
            </div>
            <Select
              style={{ width: 120 }}
              value={alarmType[key]}
              onChange={e => handleChange(key, e)}
              size="small"
              disabled={alarmState[key]}
              options={[
                { value: 0, label: t('deploy.monotypic') },
                { value: 1, label: t('deploy.accumulating') },
              ]}
            />
            <AlarmDelay
              onChange={e => delayChange(key, e)}
              disabled={alarmState[key]}
              value={alarmDelayTime[key]}
            />
          </div>
        );
      })}
    </div>
  );
};

interface AlarmDelayProps {
  onChange: (e: any) => void;
  disabled: boolean;
  value: number;
}

// 报警延时
const AlarmDelay = ({ onChange, disabled, value }: AlarmDelayProps) => {
  const [time, setTime] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [total, setTotal] = useState(0);
  const timeChange = time => {
    setTime(time);
  };

  const minuteChange = minute => {
    setMinute(minute);
  };
  const secondChange = second => {
    setSecond(second);
  };
  useEffect(() => {
    setTotal(time + minute + second);
  }, [time, minute, second]);
  useEffect(() => {
    onChange(total);
  }, [total]);
  useEffect(() => {
    if (value != total) {
      init();
    }
  }, [value]);
  const init = () => {
    if (value < 60) {
      setSecond(value);
      return;
    }
    if (3600 > value && value >= 60) {
      const minuteVal = Math.floor(value / 60);
      const secs = value - minuteVal * 60;
      setMinute(minuteVal * 60);
      setSecond(secs);
      return;
    }
    const hourVal = Math.floor(value / 3600);
    const minuteVal = Math.floor((value - hourVal * 3600) / 60);
    const secs = value - hourVal * 3600 - minuteVal * 60;
    setTime(hourVal * 3600);
    setMinute(minuteVal * 60);
    setSecond(secs);
  };
  return (
    <div className="deploy-select">
      <Select
        disabled={disabled}
        value={time}
        onChange={timeChange}
        options={[
          ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(item => {
            return {
              value: item * 3600,
              label: item,
            };
          }),
        ]}
        popupClassName="deploy-select-popup"
        size="small"
      />
      <span className="deploy-span">H</span>
      <Select
        disabled={disabled}
        value={minute}
        onChange={minuteChange}
        options={[
          ...[...new Array(60).keys()].map(item => {
            return {
              value: item * 60,
              label: item,
            };
          }),
        ]}
        popupClassName="deploy-select-popup"
        size="small"
      />
      <span className="deploy-span">M</span>
      <Select
        disabled={disabled}
        value={second}
        onChange={secondChange}
        options={[
          ...[10, 20, 30, 40, 50].map(item => {
            return {
              value: item,
              label: item,
            };
          }),
        ]}
        popupClassName="deploy-select-popup"
        size="small"
      />
      <span className="deploy-span">S</span>
    </div>
  );
};
