import { MainLeft } from '@/components/main';
import { equipment, deviceState, resize, historyDevice, typePower } from '@/stores';
import { deviceOperate } from '@/utils/deviceOperation';
import { splitStringTime } from '@/utils/time';
import disconnect from '@/assets/img/disconnect.png';
import alarmPng from '@/assets/img/报警.png';
import { Button, Descriptions, DescriptionsProps, Modal } from 'antd';
import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';

import M2H from '@/assets/img/M2H.png';
import M1H from '@/assets/img/M2E.png';
import M2D from '@/assets/img/M2D.png';
const DeviceImg = {
  M2H: M2H,
  M1H: M1H,
  M2D: M2D,
};

const Left: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceMent, setDeviceMent] = useRecoilState(deviceState);
  const [resizeData, setResizeData] = useRecoilState(resize);
  const [deviceHistory, setDeviceHistory] = useRecoilState(historyDevice);

  const [power, setPower] = useRecoilState(typePower);
  // 设备状态
  // 0: 初始状态，1：工厂模式，2：静默状态，3：延迟状态，4：记录状态、5：停止状态、6：暂停状态
  const DeviceStatus = {
    0: t('device.initialstate'),
    1: t('device.factorymode'),
    2: t('device.silentstate'),
    3: t('device.delaystate'),
    4: t('device.recordingstate'),
    5: t('device.stopstate'),
    6: t('device.pausestate'),
  };

  const MultidUnit = {
    0: '\u2103',
    1: '\u2109',
  };

  useEffect(() => {
    window.eventBus.on('friggaDevice:in', deviceData => {
      if (deviceMent) return;
      setDevice(deviceData);
      setDeviceMent(true);
    });

    window.eventBus.on('friggaDevice:out', (...datas) => {
      console.log(window.location.href.includes('deploy'));
      if (window.location.href.includes('deploy')) {
        navigate('/');
      }
      setDeviceMent(false);
      setDevice(null);
    });
    ipcRenderer.on('resizeEvent', (event, data) => {
      setResizeData(data);
    });
    ipcRenderer.on('hidError', (event, err) => {
      alert(t('left.errotText'));
    });

    window.eventBus.on('typePower', res => {
      setPower(res);
    });
  }, []);

  const Time = ({ data }) => {
    const [deviceTime, setDeviceTime] = useState('');
    useEffect(() => {
      if (data) {
        const time = splitStringTime(data);
        const present = dayjs(time).format(
          `${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`
        );
        setDeviceTime(present);
      }
    }, []);
    let terval;
    useEffect(() => {
      if (deviceTime) {
        terval = setInterval(() => {
          const present = dayjs(deviceTime).valueOf();
          setDeviceTime(
            dayjs(present + 1000).format(
              `${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`
            )
          );
        }, 1000);
        return () => {
          terval && clearInterval(terval);
          terval = null;
        };
      }
    }, [deviceTime]);
    // return dayjs(time).format(`${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`);
    return <span>{deviceTime}</span>;
  };

  const items: DescriptionsProps['items'] = [
    {
      label: t('left.equipmentModel'),
      children: device != null ? device?.record.deviceType : '---',
    },
    {
      label: t('left.serialNumber'),
      children: device != null ? device?.record.getsn : '---',
    },
    {
      label: t('left.deviceTime'),
      children:
        device != null && device?.record.time != '' ? (
          <Time data={device?.record.time}></Time>
        ) : (
          '---'
        ),
    },
    {
      label: t('left.batteryLevel'),
      children: device != null ? device?.record.batteryLevel : '---',
    },
    {
      label: t('left.DeviceStatus'),
      children: device != null ? DeviceStatus[device?.record.mode] : '---',
    },
    {
      label: t('left.recordPoints'),
      children: device != null ? device?.csvData.length : '---',
    },
    {
      label: t('left.firstRecordTime'),
      children: device != null ? device?.record.firstRecordTime : '---',
    },
    {
      label: t('left.lastRecordedTime'),
      children: device != null ? device?.record.lastRecordedTime : '---',
    },
    {
      label: t('left.maximumValue'),
      children:
        device != null
          ? device?.record.maximumValue + MultidUnit[device?.record.multidUnit]
          : '---',
    },
    {
      label: t('left.minimumValue'),
      children:
        device != null
          ? device?.record.minimumValue + MultidUnit[device?.record.multidUnit]
          : '---',
    },
  ];
  const quickReset = () => {
    deviceOperate.resetDevice();
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    quickReset();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (deviceHistory) {
      setDevice(deviceHistory);
    }
  }, [deviceHistory]);

  return (
    <MainLeft>
      <div className="left">
        <div className="image">
          {device != null ? (
            <div className="image-device">
              <img src={DeviceImg[device?.record.deviceType || 'M2H']} alt="" />
            </div>
          ) : (
            <div className="disconnect">
              <img src={disconnect} alt="" />
            </div>
          )}
          {/* <span>报警</span> */}
          <img
            src={alarmPng}
            className={
              device == null
                ? 'image-alarm'
                : device?.database.alarm == 1
                ? 'image-alarm image-alarm-red'
                : 'image-alarm image-alarm-blue'
            }
          />
        </div>
        <Descriptions
          items={items}
          column={1}
          labelStyle={{
            color: '#FFFFFF',
          }}
          contentStyle={{
            color: '#FFFFFF',
          }}
          size="small"
        />
        <div className="record-operate">
          <Button type="primary" danger style={{ width: '45%' }}>
            {t('left.stopRecording')}
          </Button>
          <Button
            style={{
              width: '45%',
              backgroundColor: '#3577F1',
              color: '#fff',
              border: '1px #3577F1 solid',
            }}
          >
            {t('left.reload')}
          </Button>
        </div>
        {/* 快速重置 */}
        {/* <Button
          style={{ width: '100%', backgroundColor: '#4DAC53', color: '#fff', border: 0 }}
          onClick={showModal}
        >
          {t('left.quickReset')}
        </Button> */}
        <Modal
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          centered
          destroyOnClose={true}
          width={300}
        >
          <h3>{t('left.clearText')}</h3>
        </Modal>
      </div>
    </MainLeft>
  );
};

export default Left;
