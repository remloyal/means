import { equipment, typePower } from '@/stores';
import { Button, Checkbox, DatePicker, InputNumber, Select, message } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';
import { c2f, f2c } from '../../utils/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { HUMI_UNIT, OPERATE_CONFIG } from '@/config';

const range = (start: number, end: number) => {
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};
const MultidUnit = {
  0: '℃',
  1: '℉',
};
const Language = {
  zh_CN: 'zh',
  en_US: 'en',
};

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const setTimeFormat = (time: string): string => {
  return dayjs(time).format(dateFormat);
};
export const DataExport = ({ onCancel }) => {
  const { t } = useTranslation();
  const device = useRecoilValue(equipment);
  const power = useRecoilValue(typePower);

  useEffect(() => {
    initTime();
  }, []);
  const [regionalTime, setRegionalTime] = useState({
    startTime: '',
    endTime: '',
  });
  const [options, setOptions] = useState<any[]>([
    { label: t('home.temperature'), value: 'temp' },
    { label: t('home.humidity'), value: 'humi' },
  ]);
  const initTime = () => {
    const startTime = setTimeFormat(device?.record.firstRecordTime);
    const endTime = setTimeFormat(device?.record.lastRecordedTime);
    let data: string[] = [];
    if (power.includes('setHighHumi')) {
      setOptions([
        { label: t('home.temperature'), value: 'temp' },
        { label: t('home.humidity'), value: 'humi' },
      ]);
      data = ['temp', 'humi'];
    } else {
      setOptions([{ label: t('home.temperature'), value: 'temp' }]);
      data = ['temp'];
    }
    setRegionalTime({
      startTime,
      endTime,
    });
    const tempUnit = MultidUnit[device?.record.multidUnit | 0];
    const lang = localStorage.getItem('language') || 'en';
    setParam(item => ({
      ...item,
      startTime,
      endTime,
      tempUnit,
      data,
      pdfTongue: lang,
      hightEmp:
        device?.record.multidUnit == 0 ? device?.record.hightEmp : c2f(device?.record.hightEmp),
      lowtEmp:
        device?.record.multidUnit == 0 ? device?.record.lowtEmp : c2f(device?.record.lowtEmp),
      highHumi: device?.record.highHumi || 0,
      lowHumi: device?.record.lowHumi || 0,
    }));
    setTime([dayjs(startTime), dayjs(endTime)]);
  };

  const onChange = checkedValues => {
    // 必须有温度
    if (!checkedValues.includes('temp')) {
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
    tempUnit: '℃',
    pdfTongue: 'zh',
    data: ['temp', 'humi'],
    lowtEmp: 0,
    hightEmp: 0,
    highHumi: 0,
    lowHumi: 0,
  });
  const [time, setTime] = useState<any>();
  const timeChange = data => {
    setTime(data || [dayjs(regionalTime.startTime), dayjs(regionalTime.endTime)]);
    setParam(item => ({
      ...item,
      startTime: data ? data[0].format(dateFormat) : regionalTime.startTime,
      endTime: data ? data[1].format(dateFormat) : regionalTime.endTime,
    }));
  };

  const tongueChange = val => {
    setParam(item => ({
      ...item,
      pdfTongue: val,
    }));
  };
  const unitChange = val => {
    if (val == '℃') {
      setParam(item => ({
        ...item,
        tempUnit: val,
        hightEmp: device?.record.hightEmp,
        lowtEmp: device?.record.lowtEmp,
      }));
    } else {
      setParam(item => ({
        ...item,
        tempUnit: val,
        hightEmp: c2f(device?.record.hightEmp),
        lowtEmp: c2f(device?.record.lowtEmp),
      }));
    }
  };
  const [exportState, setExportState] = useState(false);
  const onExport = async () => {
    const data = { ...device, param: { ...param } };
    if (data.param.tempUnit == '℉') {
      data.param.hightEmp = f2c(param.hightEmp);
      data.param.lowtEmp = f2c(param.lowtEmp);
    }
    const res = await ipcRenderer.invoke('exportDevice', data);
    if (res) {
      message.success(t('home.exportSuccess'));
      onCancel();
    } else {
      message.error(t('home.exportFailed'));
    }
  };

  const hightEmpChange = num => {
    setParam(item => {
      return {
        ...item,
        hightEmp: num,
      };
    });
  };

  const lowtEmpChange = num => {
    setParam(item => {
      return {
        ...item,
        lowtEmp: num,
      };
    });
  };

  const highHumiChange = num => {
    setParam(item => {
      return {
        ...item,
        highHumi: num,
      };
    });
  };

  const lowHumiChange = num => {
    setParam(item => {
      return {
        ...item,
        lowHumi: num,
      };
    });
  };
  return (
    <>
      <div className="basic">
        <label htmlFor="">{t('home.date')}：</label>
        <DatePicker.RangePicker
          format={`${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`}
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
          onChange={tongueChange}
          value={param.pdfTongue}
          options={[
            { value: 'zh', label: t('language.chinese') },
            { value: 'en', label: t('language.english') },
          ]}
        />
      </div>
      <div className="basic">
        <label htmlFor="">{t('home.temperature')}：</label>
        <Select
          style={{ width: 200 }}
          onChange={unitChange}
          value={param.tempUnit}
          options={[
            { value: '℃', label: '℃' },
            { value: '℉', label: '℉' },
          ]}
        />
      </div>
      <div className="basic">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="">{t('home.temperature') + t('deploy.threshold')}：</label>
          <InputNumber
            max={param.hightEmp}
            min={param.tempUnit == '℉' ? c2f(OPERATE_CONFIG.MIN_TEMP) : OPERATE_CONFIG.MIN_TEMP}
            onChange={lowtEmpChange}
            value={param.lowtEmp}
            style={{ width: 100 }}
            step="0.1"
          />
          <span className="tilde">~</span>
          <InputNumber
            min={param.lowtEmp}
            max={param.tempUnit == '℉' ? c2f(OPERATE_CONFIG.MAX_TEMP) : OPERATE_CONFIG.MAX_TEMP}
            onChange={hightEmpChange}
            value={param.hightEmp}
            style={{ width: 100 }}
            step="0.1"
          />
          <span style={{ margin: '0 10px' }}>({param.tempUnit})</span>
        </div>
      </div>
      {/* 湿度阈值配置 */}
      {device && device?.record.highHumi != null && device?.record.lowHumi != null ? (
        <div className="basic">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label htmlFor="">{t('home.humidity') + t('deploy.threshold')}：</label>
            <InputNumber
              max={param.highHumi}
              min={0}
              onChange={lowHumiChange}
              value={param.lowHumi}
              style={{ width: 100 }}
              step="1"
            />
            <span className="tilde">~</span>
            <InputNumber
              min={param.lowHumi}
              max={100}
              onChange={highHumiChange}
              value={param.highHumi}
              style={{ width: 100 }}
              step="1"
            />
            <span style={{ margin: '0 10px' }}>({HUMI_UNIT})</span>
          </div>
        </div>
      ) : (
        <div></div>
      )}

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
