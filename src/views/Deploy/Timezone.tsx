import { timeZoneCollection, timeZoneList } from '@/locale/timeZone';
import { deviceConfigParam, equipment, language } from '@/stores';
import { deviceOperate } from '@/utils/deviceOperation';
import { convertTZ, convertUTC } from '@/utils/time';
import { Col, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

const getTimeZones = (() => {
  // const data = timeZoneCollection[localStorage.getItem('language') || 'zh_CN'];
  const timeZones: { value: string | number; label: string | number; name: string | number }[] = [];
  timeZoneList.forEach((item, index) => {
    timeZones.push({
      label: item,
      value: index,
      name: item,
    });
  });
  return timeZones;
})();

// 设置时区
export const TimeZone = ({ state }: { state: boolean }) => {
  const { t } = useTranslation();
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);
  const [device, setDevice] = useRecoilState(equipment);
  const [timeZone, setTimeZone] = useState(0);
  const [timeOption, setTimeOption] = useState('');
  const [timeZoneList, setTimeZoneList] =
    useState<{ value: string | number; label: string | number; name: string | number }[]>(
      getTimeZones
    );
  const tongue = useRecoilValue(language);

  useEffect(() => {
    if (state) {
      setTimeZoneOperate();
    }
  }, [state]);

  useEffect(() => {
    init();
    window.eventBus.on('deviceConfig', deviceData => {
      if (deviceData.timeZone) {
        setTimeZone(deviceData.timeZone);
        setTime(dayjs(deviceData.time));
      }
    });
    const interval = setInterval(() => {
      timeChange(dayjs(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   const data = timeZoneCollection[tongue || localStorage.getItem('language') || 'zh_CN'];
  //   const todo: { value: string | number; label: string | number; name: string | number }[] = [];
  //   data.forEach((item, index) => {
  //     todo.push({
  //       label: item.DisplayName,
  //       value: index,
  //       name: getTimeZoneValue(item.DisplayName),
  //     });
  //   });
  //   setTimeZoneList(todo);
  // }, [tongue]);

  const init = async () => {
    const timeData = device?.record.time;
    if (!timeData) return;
    const todo = timeData.split('TZ:');

    // 设置时区
    const timeZoneData = convertTZ(timeData.substring(14, timeData.length));
    console.log(timeZoneData);

    const index = await getTimeZones.findIndex(item => item.name == timeZoneData);
    console.log(index);
    setTimeZone(index | 0);

    // 设置时间
    const times = splitString(todo[0]);

    setTime(dayjs(times));
    setDeviceConfig(item => {
      return {
        ...item,
        timeZone: index,
        time: times,
      };
    });
  };

  const timeZoneChange = (value, option) => {
    setTimeZone(value);
    setTimeOption(option);
    setDeviceConfig(item => {
      return {
        ...item,
        timeZone: value,
      };
    });
  };

  const setTimeZoneOperate = async () => {
    const times = time!.format('YYYYMMDDHHmmss');
    const timeZoneTZ = convertUTC(timeZoneList[timeZone].name as string);
    const text = `${times}${timeZoneTZ}`;
    if (text == device?.record.time) return;
    await deviceOperate.setTimeZone(`${times}${timeZoneTZ}`);
  };

  //   时间
  const [time, setTime] = useState<dayjs.Dayjs>();
  const disabledDate = current => {
    return current && current > dayjs().endOf('day');
  };
  const timeChange = value => {
    if (value) {
      setTime(value);
      setDeviceConfig(item => {
        return {
          ...item,
          time: value.format('YYYY-MM-DD HH:mm:ss'),
        };
      });
    }
  };

  return (
    <>
      <Col span={8}>
        <div style={{ padding: '10px 0' }}>{t('home.timeZone')}</div>
        <div className="deploy-select">
          <Select
            style={{ width: '100%' }}
            value={timeZone}
            onChange={timeZoneChange}
            options={timeZoneList}
            size="small"
          ></Select>
        </div>
      </Col>
      <Col span={8}>
        <div style={{ padding: '10px 0' }}>{t('home.time')}</div>
        <div className="deploy-select">
          <DatePicker
            value={time}
            onChange={timeChange}
            disabledDate={disabledDate}
            format="YYYY-MM-DD HH:mm:ss"
            size="small"
            disabled
            showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
          />
        </div>
      </Col>
    </>
  );
};

function splitString(str: string) {
  let time = '';
  time += str.substring(0, 4);
  time += `-${str.substring(4, 6)}`;
  time += `-${str.substring(6, 8)}`;
  time += ` ${str.substring(8, 10)}`;
  time += `:${str.substring(10, 12)}`;
  time += `:${str.substring(12, 14)}`;
  return time;
}

const getTimeZoneValue = (data: string) => {
  const todo = data.split(' ')[0].replace('(', '').replace(')', '');
  return todo;
};
