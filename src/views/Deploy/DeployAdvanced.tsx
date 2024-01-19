import { deviceConfigParam, equipment, importDeviceParam, typePower } from '@/stores';
import { Col, Input, Radio, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { deviceOperate } from '@/utils/deviceOperation';
import { useTranslation } from 'react-i18next';

const WIDTH = 200;

// 高级参数
export const DeployAdvanced = ({ state }: { state: boolean }) => {
  const power = useRecoilValue(typePower);
  const data = [
    TempUnitDom,
    PDFLanguageDom,
    SensorTypeDom,
    ScreenOffTimeDom,
    EquipmentName,
    PDFPasswordDom,

    DeviceSwitch,
    DeviceKeyStopDom,
    TemporaryPdfDom,
    RepetitionPrimingDom,
  ];
  return (
    <div style={{ padding: '0 20px' }}>
      <Row gutter={[16, 16]}>
        {data.map(Item => {
          if (!Item) return <></>;
          return <Item state={state} key={Item.name} />;
        })}
      </Row>
    </div>
  );
};

// 温度单位
export const TempUnitDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setTempPeriod();
    }
  }, [state]);

  const { t } = useTranslation();
  const [startMode, setStartMode] = useState(0);
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);

  const handleChange = value => {
    setStartMode(value);
    setDeviceConfig(item => {
      return {
        ...item,
        multidUnit: value,
      };
    });
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const multidUnit = device?.record.multidUnit;
    setStartMode(parseInt(multidUnit));
    setDeviceConfig(item => {
      return {
        ...item,
        multidUnit: parseInt(multidUnit),
      };
    });
  };

  const setTempPeriod = async () => {
    // console.log(startMode, device?.record.multidUnit);
    await deviceOperate.setMultidUnit(startMode);
  };

  const importConfig = useRecoilValue(importDeviceParam);
  useEffect(() => {
    if (importConfig && Object.keys(importConfig).includes('multidUnit')) {
      setStartMode(Number(importConfig.multidUnit));
    }
  }, [importConfig]);

  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('deploy.tempUnit')}</div>
      <div className="deploy-select">
        <Select
          size="small"
          defaultValue={0}
          value={startMode}
          style={{ width: WIDTH }}
          onChange={handleChange}
          options={[
            { label: '\u2103', value: 0 },
            { label: '\u2109', value: 1 },
          ]}
        />
      </div>
    </Col>
  );
};

// PDF语言
export const PDFLanguageDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setOperation();
    }
  }, [state]);

  const { t } = useTranslation();
  const [startValue, setStartValue] = useState(1);
  const [device, setDevice] = useRecoilState(equipment);
  const power = useRecoilValue(typePower);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    if (power.includes('pdfLan')) {
      init();
    } else {
      setDisabled(true);
    }
  }, []);
  const init = async () => {
    const value = device?.record.pdfLan || '';
    if (value) {
      setStartValue(parseInt(value));
    }
    setDeviceConfig(item => {
      return {
        ...item,
        pdfLan: parseInt(value),
      };
    });
    setDisabled(false);
  };
  const handleChange = e => {
    console.log(e);

    setStartValue(e);
    setDeviceConfig(item => {
      return {
        ...item,
        pdfLan: e,
      };
    });
  };

  const setOperation = async () => {
    if (disabled == false && startValue != device?.record.pdfLan) {
      await deviceOperate.setPdfLan(startValue);
    }
  };

  const importConfig = useRecoilValue(importDeviceParam);
  useEffect(() => {
    if (importConfig && Object.keys(importConfig).includes('pdfLan') && disabled == false) {
      setStartValue(Number(importConfig.pdfLan));
    }
  }, [importConfig]);
  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>PDF {t('home.language')}</div>
      <div className="deploy-select">
        <Select
          size="small"
          value={startValue}
          style={{ width: WIDTH }}
          onChange={handleChange}
          disabled={disabled}
          options={[
            { label: t('language.chinese'), value: 0 },
            { label: t('language.english'), value: 1 },
          ]}
        />
      </div>
    </Col>
  );
};

// 传感器类型
export const SensorTypeDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      //   setTempPeriod();
    }
  }, [state]);

  const { t } = useTranslation();
  const [startMode, setStartMode] = useState('');
  const [device, setDevice] = useRecoilState(equipment);
  const handleChange = value => {
    setStartMode(value);
  };
  const sensorType = {
    M2H: `${t('home.internal')}${t('home.temperature')}、${t('home.humidity')}`,
    M2D: t('home.internal') + t('home.temperature'),
    M2E: t('home.probe') + t('home.humidity'),
  };
  useEffect(() => {
    if (device?.record.deviceType) {
      setStartMode(sensorType[device?.record.deviceType]);
    }
  }, []);
  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('home.sensorType')}</div>
      <div className="deploy-select">
        <Input
          value={startMode}
          style={{ width: WIDTH }}
          onChange={handleChange}
          disabled
          size="small"
        />
      </div>
    </Col>
  );
};

// 设置灭屏时间
export const ScreenOffTimeDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setMultidSleepTime();
    }
  }, [state]);

  const { t } = useTranslation();
  const [startMode, setStartMode] = useState(5);
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);

  const handleChange = value => {
    setStartMode(value);
    setDeviceConfig(item => {
      return {
        ...item,
        multIdSleepTime: value,
      };
    });
  };

  useEffect(() => {
    init();
  }, []);
  const init = async () => {
    const multIdSleepTime = device?.record.multIdSleepTime;
    setStartMode(parseInt(multIdSleepTime));
    setDeviceConfig(item => {
      return {
        ...item,
        multIdSleepTime,
      };
    });
  };

  const setMultidSleepTime = async () => {
    if (startMode != device?.record.multIdSleepTime) {
      await deviceOperate.setMultidSleepTime(startMode);
    }
  };

  const initConfig = deviceData => {
    if (deviceData && Object.keys(deviceData).includes('multIdSleepTime')) {
      setStartMode(deviceData.multIdSleepTime);
    }
  };
  const importConfig = useRecoilValue(importDeviceParam);
  useEffect(() => {
    initConfig(importConfig);
  }, [importConfig]);

  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('home.displayTime')}</div>
      <div className="deploy-select">
        <Select
          size="small"
          defaultValue={5}
          value={startMode}
          style={{ width: WIDTH }}
          onChange={handleChange}
          options={timeOption()}
        />
      </div>
    </Col>
  );
};

const timeOption = () => {
  const options: { label: string; value: number }[] = [];
  for (let i = 5; i <= 60; i++) {
    options.push({ label: `${i} S`, value: i });
  }
  return options;
};

//设备名称
const EquipmentName = ({ state }: { state: boolean }) => {
  const [startValue, setStartValue] = useState('');
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  useEffect(() => {
    const getsn = device?.record.getsn;
    if (getsn) {
      setStartValue(getsn);
    }
  }, []);
  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('deploy.deviceName')}</div>
      <div className="deploy-select">
        <Input value={startValue} disabled style={{ width: WIDTH }} size="small" />
      </div>
    </Col>
  );
};

//设置PDF密码
const PDFPasswordDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setOperation();
    }
  }, [state]);
  const [startValue, setStartValue] = useState('');
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);
  const handleChange = e => {
    setStartValue(e.target.value);
    setDeviceConfig(item => {
      return {
        ...item,
        pdfPwd: e.target.value,
      };
    });
  };

  const [checked, setChecked] = useState(false);
  const handleChangeCheck = e => {
    setChecked(!checked);
  };
  useEffect(() => {
    const pdfPwd = device?.record.pdfPwd;
    if (pdfPwd != '') {
      setStartValue(pdfPwd);
      setChecked(true);
    }
    setDeviceConfig(item => {
      return {
        ...item,
        pdfPwd,
      };
    });
  }, []);

  const setOperation = async () => {
    if (!checked) {
      await deviceOperate.setPdfPwd('');
      setStartValue('');
      return;
    }
    if (startValue != device?.record.pdfPwd) {
      await deviceOperate.setPdfPwd(startValue);
    }
  };

  const initConfig = deviceData => {
    if (Object.keys(deviceData).includes('pdfPwd')) {
      setStartValue(deviceData.pdfPwd);
      if (deviceData.pdfPwd != '') {
        setChecked(true);
      } else {
        setChecked(false);
      }
    }
  };

  const importConfig = useRecoilValue(importDeviceParam);
  useEffect(() => {
    console.log(importConfig);

    initConfig(importConfig);
  }, [importConfig]);

  return (
    <Col span={8}>
      {/* <div style={{ padding: '10px 0' }}>{t('home.displayTime')}</div> */}
      <Radio.Group value={checked} style={{ padding: '10px 0' }}>
        <Radio onClick={handleChangeCheck} value={true}>
          {t('deploy.setPassword')}
        </Radio>
      </Radio.Group>
      <div className="deploy-select">
        <Input.Password
          value={startValue}
          disabled={!checked}
          onChange={handleChange}
          style={{ width: WIDTH }}
          size="small"
          maxLength={6}
        />
      </div>
    </Col>
  );
};

// 功能开关
const DeviceSwitch = ({ state }: { state: boolean }) => {
  const { t } = useTranslation();
  return (
    <Col span={24}>
      <h3>{t('deploy.functionSwitch')}</h3>
    </Col>
  );
};

// 按键停止
const DeviceKeyStopDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setOperation();
    }
  }, [state]);
  const [startValue, setStartValue] = useState(0);
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);

  const handleChange = e => {
    setStartValue(e);
    setDeviceConfig(item => {
      return {
        ...item,
        keyStopEnableget: e,
      };
    });
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const value = device?.record.keyStopEnableget;
    if (value) {
      setStartValue(parseInt(value));
    }
    setDeviceConfig(item => {
      return {
        ...item,
        keyStopEnableget: value,
      };
    });
  };

  const setOperation = async () => {
    if (startValue != device?.record.keyStopEnableget) {
      await deviceOperate.setKeyStopEnableset(startValue);
    }
  };

  const initConfig = deviceData => {
    if (deviceData && Object.keys(deviceData).includes('keyStopEnableget')) {
      setStartValue(deviceData.keyStopEnableget);
    }
  };
  const importConfig = useRecoilValue(importDeviceParam);
  useEffect(() => {
    initConfig(importConfig);
  }, [importConfig]);

  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('deploy.buttonStop')}</div>
      <div className="deploy-select">
        <Select
          size="small"
          defaultValue={0}
          value={startValue}
          style={{ width: WIDTH }}
          onChange={handleChange}
          options={[
            { label: t('deploy.prohibit'), value: 0 },
            { label: t('deploy.allow'), value: 1 },
          ]}
        />
      </div>
    </Col>
  );
};

// 临时PDF
const TemporaryPdfDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      //   setOperation();
    }
  }, [state]);
  const [startValue, setStartValue] = useState(0);
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const handleChange = e => {
    setStartValue(e);
  };

  useEffect(() => {
    // const value = device?.record.keyStopEnableget;
    // if (value) {
    //   setStartValue(parseInt(value));
    // }
  }, []);
  const setOperation = async () => {
    if (startValue != device?.record.keyStopEnableget) {
      await deviceOperate.setKeyStopEnableset(startValue);
    }
  };
  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('home.temporaryPDF')}</div>
      <div className="deploy-select">
        <Select
          size="small"
          disabled
          defaultValue={0}
          value={startValue}
          style={{ width: WIDTH }}
          onChange={handleChange}
          options={[
            { label: t('deploy.prohibit'), value: 0 },
            { label: t('deploy.allow'), value: 1 },
          ]}
        />
      </div>
    </Col>
  );
};

// 重复启动
const RepetitionPrimingDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setOperation();
    }
  }, [state]);
  const [startValue, setStartValue] = useState(1);
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const power = useRecoilValue(typePower);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    if (power.includes('multIdMulton')) {
      init();
    } else {
      setDisabled(true);
    }
  }, []);
  const init = async () => {
    const value = device?.record.multIdMulton || '';
    if (value) {
      setStartValue(parseInt(value));
    }
    setDeviceConfig(item => {
      return {
        ...item,
        multIdMulton: value,
      };
    });
    setDisabled(false);
  };
  const handleChange = e => {
    setStartValue(e);
    setDeviceConfig(item => {
      return {
        ...item,
        multIdMulton: e,
      };
    });
  };

  const setOperation = async () => {
    if (disabled == false) {
      await deviceOperate.setMultIdMulton(startValue);
    }
  };

  const initConfig = deviceData => {
    if (Object.keys(deviceData).includes('multIdMulton') && disabled == false) {
      setStartValue(Number(deviceData.multIdMulton));
    }
  };
  const importConfig = useRecoilValue(importDeviceParam);
  useEffect(() => {
    initConfig(importConfig);
  }, [importConfig]);

  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('home.repetitionPriming')}</div>
      <div className="deploy-select">
        <Select
          size="small"
          disabled={disabled}
          value={startValue}
          style={{ width: WIDTH }}
          onChange={handleChange}
          options={[
            { label: t('deploy.prohibit'), value: 0 },
            { label: t('deploy.allow'), value: 1 },
          ]}
        />
      </div>
    </Col>
  );
};
