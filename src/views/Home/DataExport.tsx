import { equipment } from '@/stores';
import { Button, Checkbox, DatePicker, Select, message } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

const range = (start: number, end: number) => {
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
export const DataExport = ({ onCancel }) => {
  const { t } = useTranslation();
  const device = useRecoilValue(equipment);

  useEffect(() => {
    initTime();
  }, []);
  const [regionalTime, setRegionalTime] = useState({
    startTime: '',
    endTime: '',
  });
  const options = [
    { label: t('home.temperature'), value: 'temp' },
    { label: t('home.humidity'), value: 'humi' },
  ];
  const initTime = () => {
    const startTime = device?.record.firstRecordTime;
    const endTime = device?.record.lastRecordedTime;
    setRegionalTime({
      startTime,
      endTime,
    });
    setParam(item => ({ ...item, startTime: startTime, endTime: endTime }));
    setTime([dayjs(startTime), dayjs(endTime)]);
    console.log(startTime, endTime);
  };

  const onChange = checkedValues => {
    if (checkedValues.length === 0) {
      setExportState(true);
    } else {
      setExportState(false);
    }
    setParam(item => ({ ...item, data: checkedValues }));
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
      return {
        disabledHours: () => range(0, 60).splice(0, parseInt(startTime[0])),
        disabledMinutes: () => range(0, 60).splice(0, parseInt(startTime[1])),
        disabledSeconds: () => range(0, 60).splice(0, parseInt(startTime[2])),
      };
    }
    if (_!.valueOf() > dayjs(end[0]).valueOf()) {
      return {
        disabledHours: () => range(0, 60).splice(parseInt(endTime[0]) + 1, 60),
        disabledMinutes: () => range(0, 60).splice(parseInt(endTime[1]) + 1, 60),
        disabledSeconds: () => range(0, 60).splice(parseInt(endTime[2]) + 1, 60),
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
    tempUnit: '℃',
    pdfTongue: 'zh',
    data: ['temp', 'humi'],
  });
  const [time, setTime] = useState<any>();
  const timeChange = data => {
    setTime(data);
    setParam(item => ({
      ...item,
      startTime: data[0].format(dateFormat),
      endTime: data[1].format(dateFormat),
    }));
  };

  const tongueChange = val => {
    setParam(item => ({
      ...item,
      pdfTongue: val,
    }));
  };
  const unitChange = val => {
    setParam(item => ({
      ...item,
      tempUnit: val,
    }));
  };
  const [exportState, setExportState] = useState(false);
  const onExport = async () => {
    const data = { ...device, param: param };
    const res = await ipcRenderer.invoke('exportDevice', data);
    if (res) {
      onCancel();
    } else {
      message.error(t('home.exportFailed'));
    }
  };
  return (
    <>
      <div className="basic">
        <label htmlFor="">{t('home.date')}：</label>
        <DatePicker.RangePicker
          format={dateFormat}
          showTime
          disabledDate={disabledDate}
          disabledTime={disabledRangeTime}
          onChange={timeChange}
          value={time}
        />
      </div>
      <div className="basic">
        <label htmlFor="">{t('home.sensorData')}：</label>
        <Checkbox.Group options={options} defaultValue={param.data} onChange={onChange} />
      </div>
      <div className="basic">
        <label htmlFor="">{t('home.exportAs')}：</label>
        <Select
          style={{ width: 200 }}
          defaultValue={'PDF'}
          options={[
            { value: 'PDF', label: 'PDF' },
            // { value: 'en_US', label: 'Excel' },
          ]}
        />
      </div>
      <div className="basic">
        <label htmlFor="">PDF{t('home.language')}：</label>
        <Select
          style={{ width: 200 }}
          defaultValue={param.pdfTongue}
          onChange={tongueChange}
          options={[
            { value: 'zh', label: '中文' },
            { value: 'en', label: '英文' },
          ]}
        />
      </div>
      <div className="basic">
        <label htmlFor="">{t('home.temperature')}：</label>
        <Select
          style={{ width: 200 }}
          defaultValue={param.tempUnit}
          onChange={unitChange}
          options={[
            { value: '℃', label: '℃' },
            { value: '℉', label: '℉' },
          ]}
        />
      </div>
      <div className="basic" style={{ display: 'flex', justifyContent: 'right' }}>
        <Button onClick={onCancel}>{t('home.cancellation')}</Button>
        <Button
          type="primary"
          style={{ marginLeft: '10px' }}
          disabled={exportState}
          onClick={onExport}
        >
          {t('home.exportData')}
        </Button>
      </div>
    </>
  );
};
