import { equipment, screenTime } from '@/stores';
import { Button, DatePicker } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const setTimeFormat = (time: string): string => {
  return dayjs(time, `${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`).format(
    dateFormat
  );
};
const range = (start: number, end: number) => {
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

export const DataFilter = ({ onCancel }) => {
  const { t } = useTranslation();

  const device = useRecoilValue(equipment);
  const [filterTime, setFilterTime] = useRecoilState(screenTime);
  const [regionalTime, setRegionalTime] = useState({
    startTime: '',
    endTime: '',
  });
  useEffect(() => {
    initTime();
  }, []);

  const initTime = () => {
    const startTime = setTimeFormat(device?.record.firstRecordTime);
    const endTime = setTimeFormat(device?.record.lastRecordedTime);
    setRegionalTime({
      startTime,
      endTime,
    });
    setParam(item => ({ ...item, startTime, endTime }));
    //   setTime({ startTime: dayjs(startTime), endTime: dayjs(endTime) });
    setTime([dayjs(startTime), dayjs(endTime)]);
    if (filterTime.startTime && filterTime.endTime) {
      setScrub(false);
    }
  };

  const disabledDate: RangePickerProps['disabledDate'] = current => {
    const start = regionalTime.startTime.split(' ');
    const end = regionalTime.endTime.split(' ');
    return (current && current < dayjs(start[0])) || current > dayjs(end[0]).add(1, 'day');
  };
  const disabledRangeTime: RangePickerProps['disabledTime'] = (_, type) => {
    const start = regionalTime.startTime.split(' ');
    const end = regionalTime.endTime.split(' ');
    const startTime = start[1].split(':');
    const endTime = end[1].split(':');
    if (type === 'start') {
      const presentTime = _!.format('HH:mm:ss').split(':');
      const hours = parseInt(startTime[0]);
      let minutes = parseInt(startTime[1]);
      let seconds = parseInt(startTime[2]);
      if (parseInt(presentTime[0]) > parseInt(startTime[0])) {
        minutes = 0;
        seconds = 0;
      }
      if (parseInt(presentTime[1]) > parseInt(startTime[1])) {
        seconds = 0;
      }
      return {
        disabledHours: () => range(0, 60).splice(0, hours),
        disabledMinutes: () => range(0, 60).splice(0, minutes),
        disabledSeconds: () => range(0, 60).splice(0, seconds),
      };
    }
    if (_!.valueOf() > dayjs(end[0]).valueOf()) {
      const presentTime = _!.format('HH:mm:ss').split(':');
      const hours = parseInt(endTime[0]) + 1;
      let minutes = parseInt(endTime[1]) + 1;
      let seconds = parseInt(endTime[2]) + 1;
      if (parseInt(presentTime[0]) < parseInt(endTime[0])) {
        minutes = 60;
        seconds = 60;
      }
      if (parseInt(presentTime[1]) < parseInt(endTime[1])) {
        seconds = 60;
      }
      return {
        disabledHours: () => range(0, 60).splice(hours, 60),
        disabledMinutes: () => range(0, 60).splice(minutes, 60),
        disabledSeconds: () => range(0, 60).splice(seconds, 60),
      };
    }
    return {
      disabledHours: () => range(0, 60).splice(60, 60),
      disabledMinutes: () => range(0, 60).splice(60, 60),
      disabledSeconds: () => range(0, 60).splice(60, 60),
    };
  };
  const [param, setParam] = useState({
    startTime: '',
    endTime: '',
  });
  const [time, setTime] = useState<any>([dayjs(), dayjs()]);
  const timeChange = data => {
    setTime(data || [dayjs(regionalTime.startTime), dayjs(regionalTime.endTime)]);
    setParam(item => ({
      ...item,
      startTime: data ? data[0].format(dateFormat) : regionalTime.startTime,
      endTime: data ? data[1].format(dateFormat) : regionalTime.endTime,
    }));
  };
  const onConfirm = () => {
    setFilterTime(param);
    onCancel();
  };
  const [scrub, setScrub] = useState(true);
  const onScrub = () => {
    setFilterTime({});
    onCancel();
  };

  return (
    <>
      <div className="basic">
        <div>
          <label htmlFor="">{t('home.startTime')}：</label>
          <label style={{ marginLeft: '140px' }}>{t('home.endTime')}：</label>
        </div>
        <DatePicker.RangePicker
          format={dateFormat}
          showTime
          disabledDate={disabledDate}
          disabledTime={disabledRangeTime}
          onChange={timeChange}
          value={time}
        />
      </div>
      <div
        className="basic"
        style={{ display: 'flex', justifyContent: 'right', marginTop: '20px' }}
      >
        <Button type="primary" onClick={onConfirm}>
          {t('home.confirm')}
        </Button>
        <Button onClick={onCancel} style={{ marginLeft: '10px' }}>
          {t('home.cancellation')}
        </Button>
        <Button onClick={onScrub} style={{ marginLeft: '10px' }} disabled={scrub}>
          {t('home.cancellation')}
          {t('home.screen')}
        </Button>
      </div>
    </>
  );
};
