import { MainLeft } from '@/components/main';
import { equipment, deviceState, resize, historyDevice, typePower, menuKey } from '@/stores';
import { deviceOperate, setTypePower } from '@/utils/deviceOperation';
import { splitStringTime } from '@/utils/time';
import disconnect from '@/assets/img/disconnect.png';
import alarmPng from '@/assets/img/报警.png';
import { Button, Descriptions, DescriptionsProps, Modal, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';

import M2H from '@/assets/img/M2H.png';
import M1H from '@/assets/img/M2E.png';
import M2D from '@/assets/img/M2D.png';
import DianLiangImg from '@/assets/img/dianliang.png';
import { loadUsbData, reIdentification, setDeviceError, usbData } from '@/utils/detectDevice';
import { c2f, f2c } from '@/utils/utils';
import { QuitPrompt } from './ExitPrompt';
import { HUMI_UNIT } from '@/config';
const DeviceImg = {
  M2H,
  M1H,
  M2D,
};
const setTimeFormat = (time: string): string => {
  return dayjs(time).format(`${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`);
};
let errorModal;
let deviceStates = false;
let timeout;
// 清除延时
const clearTimeSave = () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
};

const Left: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceMent, setDeviceMent] = useRecoilState(deviceState);
  const [resizeData, setResizeData] = useRecoilState(resize);
  const [deviceHistory, setDeviceHistory] = useRecoilState(historyDevice);
  const leftRef = useRef<HTMLDivElement>(null);
  const [power, setPower] = useRecoilState(typePower);
  const [headKey, setHeadKey] = useRecoilState(menuKey);
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
    if (leftRef.current) {
      window.eventBus.on('friggaDevice:in', deviceData => {
        if (deviceMent) return;
        deviceStates = true;
        setDevice(deviceData);
        setDeviceMent(true);
        navigate('/');
        setHeadKey(0);
      });

      window.eventBus.on('friggaDevice:out', (...datas) => {
        if (window.location.href.includes('deploy')) {
          setHeadKey(0);
          navigate('/');
        }
        deviceStates = false;
        setDeviceMent(false);
        setDevice(null);
        setSaving(false);
        setLoading(false);
        clearTimeSave();
      });
      ipcRenderer.on('resizeEvent', (event, data) => {
        setResizeData(data);
      });
      ipcRenderer.on('hidError', (event, err) => {
        setLoading(false);
        // alert(t('left.errotText'));
        if (errorModal == null) {
          // errorModal = message.error(t('left.errotText'));
          // console.log(errorModal);
          ipcRenderer.invoke('setLog', {
            data: t('left.errotText'),
            type: 'error',
          });
          errorModal = setTimeout(() => {
            deviceStates = false;
            setDeviceError();
            setSaving(false);
            setLoading(false);
            setDevice(null);
            clearTimeSave();
            errorModal = null;
            reIdentification();
          }, 1000);
          // errorModal = Modal.error({
          //   centered: true,
          //   content: t('left.errotText'),
          //   cancelButtonProps: { style: { display: 'none' } },
          //   zIndex: 8888,
          //   onOk() {
          //     deviceStates = false;
          //     setDeviceError();
          //     setSaving(false);
          //     setLoading(false);
          //     setDevice(null);
          //     clearTimeSave();
          //     errorModal = null;
          //   },
          // });
        }
      });

      window.eventBus.on('typePower', res => {
        setPower(res);
      });
      // 加载中
      window.eventBus.on('loading', res => {
        setLoading(true);
        setTimeout(() => {
          if (loading) {
            message.error(t('left.errotText'));
            setLoading(false);
          }
        }, 10000);
      });
      // 加载完成
      window.eventBus.on('loadingCompleted', res => {
        setLoading(false);
        if (res && res?.error) {
          setTimeout(() => {
            message.error(res.error.toString());
          }, 1000);
        }
      });

      window.eventBus.on('updateDevice', deviceData => {
        console.log('updateDevice', deviceStates, deviceData);
        if (deviceStates) {
          message.success(t('history.dataUpdateSuccessful'));
          setDevice(deviceData);
          setSaving(false);
          clearTimeSave();
        }
      });
      window.eventBus.on('saving', res => {
        if (res && res.text) {
          setSavingText(res.text);
        } else {
          setSavingText('');
        }
        setSaving(true);
        timeout = setTimeout(() => {
          setSaving(false);
          clearTimeSave();
        }, 20000);
      });
      window.eventBus.on('savingClose', res => {
        setSaving(false);
      });
    }

    return () => {
      window.eventBus.removeAllListeners('friggaDevice:in');
      window.eventBus.removeAllListeners('friggaDevice:out');
      window.eventBus.removeAllListeners('typePower');
      window.eventBus.removeAllListeners('loading');
      window.eventBus.removeAllListeners('loadingCompleted');
      window.eventBus.removeAllListeners('updateDevice');
      window.eventBus.removeAllListeners('saving');
      window.eventBus.removeAllListeners('savingClose');
      ipcRenderer.removeAllListeners('resizeEvent');
      ipcRenderer.removeAllListeners('hidError');
    };
  }, []);

  const Time = ({ data }) => {
    const [deviceTime, setDeviceTime] = useState('');
    const format = localStorage.getItem('dateFormat') || 'YYYY-MM-DD';
    useEffect(() => {
      if (data) {
        const time = splitStringTime(data);
        const present = dayjs(time).format(`${format} HH:mm:ss`);
        setDeviceTime(present);
      }
    }, []);
    let terval;
    useEffect(() => {
      if (deviceTime) {
        if (!terval) {
          terval = setInterval(() => {
            const present = dayjs(deviceTime, `${format} HH:mm:ss`).valueOf();
            setDeviceTime(dayjs(present + 1000).format(`${format} HH:mm:ss`));
          }, 1000);
        }
        return () => {
          terval && clearInterval(terval);
          terval = null;
        };
      }
    }, [deviceTime]);
    // return dayjs(time).format(`${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`);
    return <span>{deviceTime}</span>;
  };

  const setTempValue = value => {
    const unit = MultidUnit[device?.record.multidUnit];
    if (unit == '\u2109') {
      return `${c2f(value)} ${unit}`;
    }
    return `${value} ${unit}`;
  };

  const DianLiang = val => {
    if (val && val != '') {
      return (
        <div className="dianliang" style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src={DianLiangImg}
            alt=""
            style={{
              width: '36px',
              height: '16px',
              paddingTop: '4px',
              transform: 'translateY(-50px)',
              filter: `drop-shadow(${parseInt(val) == 0 ? 'red' : '#6EB442'} 0 50px)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '36px',
              height: '16px',
              top: '4px',
              left: 0,
              padding: '2px',
              display: 'flex',
            }}
          >
            {...[...new Array(parseInt(val) || 0)].map((item, i) => {
              return (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    marginTop: '1px',
                    width: '8px',
                    height: '10px',
                    backgroundColor: '#6EB442',
                    marginLeft: '1px',
                    borderRadius: '1px',
                  }}
                ></span>
              );
            })}
          </div>
        </div>
      );
    } else {
      return <span>---</span>;
    }
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
      children: device != null ? DianLiang(device?.record.batvol) : '---',
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
      children: device != null ? setTimeFormat(device?.record.firstRecordTime) : '---',
    },
    {
      label: t('left.lastRecordedTime'),
      children: device != null ? setTimeFormat(device?.record.lastRecordedTime) : '---',
    },
    {
      label: `${t('home.temperature')} ${t('left.maximumValue')}`,
      children: device != null ? setTempValue(device?.record.maximumValue) : '---',
    },
    {
      label: `${t('home.temperature')} ${t('left.minimumValue')}`,
      children: device != null ? setTempValue(device?.record.minimumValue) : '---',
    },
  ];
  if (device && device?.record.highHumi != null && device?.record.lowHumi != null) {
    items.push(
      {
        label: `${t('home.humidity')} ${t('left.maximumValue')}`,
        children: device != null ? `${device?.database.humidity.max || 0} ${HUMI_UNIT}` : '---',
      },
      {
        label: `${t('home.humidity')} ${t('left.minimumValue')}`,
        children: device != null ? `${device?.database.humidity.min || 0} ${HUMI_UNIT}` : '---',
      }
    );
  }
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
      setTypePower(deviceHistory.database.type);
      setDevice(deviceHistory);
      setHeadKey(0);
      navigate('/');
    }
  }, [deviceHistory]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingText, setSavingText] = useState<string>('');
  const reloading = () => {
    loadUsbData(usbData);
  };

  const getImageClass = () => {
    let imageClass = 'image-alarm';
    if (device == null) {
      imageClass = 'image-alarm';
      return imageClass;
    }
    if (device?.record.mode == 2) {
      return 'image-alarm image-alarm-green';
    }
    if (device?.record.lowtEmp == 0 && device?.record.hightEmp == 0) {
      imageClass = 'image-alarm image-alarm-green';
      return imageClass;
    }
    if (
      device?.database.temperature.max > device?.record.hightEmp ||
      device?.database.temperature.min < device?.record.lowtEmp
    ) {
      imageClass = 'image-alarm image-alarm-red';
    } else {
      imageClass = 'image-alarm image-alarm-green';
    }
    if (device?.record.highHumi && device?.record.lowHumi) {
      if (device?.record.highHumi == 0 && device?.record.lowHumi == 0) {
        imageClass = 'image-alarm image-alarm-green';
        return imageClass;
      }
      if (
        device?.database.humidity.max > device?.record.highHumi ||
        device?.database.humidity.min < device?.record.lowHumi
      ) {
        imageClass = 'image-alarm image-alarm-red';
      } else {
        imageClass = 'image-alarm image-alarm-green';
      }
    }
    // return 'image-alarm image-alarm-green';
    return imageClass;
  };
  return (
    <MainLeft>
      <div className="left" ref={leftRef}>
        <div className="image">
          {device != null ? (
            <div className="image-device">
              <img
                src={
                  DeviceImg[
                    Object.keys(DeviceImg).includes(device?.record.deviceType)
                      ? device?.record.deviceType
                      : 'M2H'
                  ]
                }
                alt=""
              />
            </div>
          ) : (
            <div className="disconnect">
              <img src={disconnect} alt="" />
            </div>
          )}
          {/* <span>报警</span> */}
          <img src={alarmPng} className={getImageClass()} />
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
          <Button type="primary" danger style={{ width: '45%' }} disabled>
            {t('left.stopRecording')}
          </Button>
          <Button
            style={{
              width: '45%',
              backgroundColor: '#3577F1',
              color: '#fff',
              border: '1px #3577F1 solid',
            }}
            disabled={device == null ? true : false}
            onClick={reloading}
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
      <Modal open={loading} centered width={200} closeIcon={null} footer={null}>
        <div
          style={{ height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div style={{ height: 100, width: 100 }}>
            <Spin size="large" tip={`${t('left.reading')}...`} style={{ height: 100 }}>
              <div className="content" />
            </Spin>
          </div>
        </div>
      </Modal>
      <Modal open={saving} centered width={200} closeIcon={null} footer={null}>
        <div
          style={{ height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div style={{ height: 100, width: 100 }}>
            <Spin
              size="large"
              tip={`${savingText != '' ? savingText : t('left.saving')}...`}
              style={{ height: 100 }}
            >
              <div className="content" />
            </Spin>
          </div>
        </div>
      </Modal>
      <QuitPrompt />
    </MainLeft>
  );
};

const deviceFirst = async () => {
  const data = await ipcRenderer.invoke('deviceFirst');
  console.log(data);
  if (data) {
    loadUsbData(data);
  }
};
setTimeout(() => {
  deviceFirst();
}, 3000);

export default Left;
