import { equipment } from '@/stores';
import { deviceOperate } from '@/utils/deviceOperation';
import { Col, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

const getTimeOptions = () => {
  const option: { value: string | number; label: string | number }[] = [];
  for (let i = 0; i <= 12; i++) {
    option.push({
      value: i * 3600,
      label: i,
    });
  }
  return option;
};

const getMinuteOptions = () => {
  const option: { value: string | number; label: string | number }[] = [];
  for (let i = 0; i < 60; i++) {
    option.push({
      value: i * 60,
      label: i,
    });
  }
  return option;
};
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
  const [time, setTime] = useState(0);
  const [minute, setMinute] = useState(0);
  const [minuteState, setMinuteState] = useState(false);
  const timeOptions = getTimeOptions();
  const minuteOptions = getMinuteOptions();

  const initTime = () => {
    const times = (device?.record.tempPeriod as number) ?? 0;
    if (times === 0) {
      setTime(0);
      setMinute(0);
    }
    // 秒数转时分
    const timePart = times / 60;
    const hour = Math.floor(timePart / 60);
    const minute = timePart % 60;
    setTime(hour * 3600);
    setMinute(minute * 60);
  };

  const timeChange = time => {
    setTime(time);
    if (time === 43200) {
      setMinuteState(true);
    } else {
      setMinuteState(false);
    }
  };

  const minuteChange = minute => {
    console.log(minute);
    setMinute(minute);
  };
  const setTempPeriod = async () => {
    const times = time === 43200 ? time : time + minute;
    if (times != device?.record.tempPeriod) {
      await deviceOperate.setTempPeriod(times);
    }
  };

  return (
    <>
      <div style={{ padding: '10px 0' }}>{t('deploy.recordInterval')}</div>
      <div className="deploy-select">
        <Select
          value={time}
          onChange={timeChange}
          options={timeOptions}
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
    </>
  );
};

// 启动模式
export const StartModeDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setTempPeriod();
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
    <>
      <div style={{ padding: '10px 0' }}>{t('home.startMode')}</div>
      <div className="deploy-select">
        <Select
          defaultValue={0}
          value={startMode}
          style={{ width: 120 }}
          onChange={handleChange}
          options={[
            { label: t('deploy.buttonStart'), value: 0 },
            { label: t('deploy.timingOn'), value: 1 },
          ]}
        />
      </div>
    </>
  );
};
