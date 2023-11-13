import { equipment, deviceState, resize, historyDevice } from '@/stores';
import { deviceOperate } from '@/utils/deviceOperation';
import { splitStringTime } from '@/utils/time';
import disconnect from '@assets/MainForm/DeviceImage/disconnect.png';
import { Button, Descriptions, DescriptionsProps, Modal } from 'antd';
import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

const Left: React.FC = () => {
  const { t } = useTranslation();

  const [device, setDevice] = useRecoilState(equipment);
  const [deviceMent, setDeviceMent] = useRecoilState(deviceState);
  const [resizeData, setResizeData] = useRecoilState(resize);
  const [deviceHistory, setDeviceHistory] = useRecoilState(historyDevice);
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
      setDeviceMent(false);
      setDevice(null);
    });
    ipcRenderer.on('resizeEvent', (event, data) => {
      setResizeData(data);
    });
  }, []);

  useEffect(() => {
    console.log(device);
  }, [device]);
  const setTime = (data)=>{
    const time = splitStringTime(data);
    return dayjs(time).format(`${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`);
  }

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
      children: device != null ? setTime(device?.record.time) : '---',
    },
    {
      label: t('left.batteryLevel'),
      children: device != null ? device?.record.mode : '---',
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
      children: device != null ? device?.record.maximumValue + MultidUnit[device?.record.multidUnit]: '---',
    },
    {
      label: t('left.minimumValue'),
      children: device != null ? device?.record.minimumValue + MultidUnit[device?.record.multidUnit]: '---',
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

  useEffect(()=>{
    if (deviceHistory) {
      setDevice(deviceHistory)
    }
  },[deviceHistory])
  
  return (
    <div className="left">
      <div className="image">
        <img src={disconnect} alt="" />
        <span>报警</span>
      </div>
      <Descriptions
        items={items}
        column={1}
        labelStyle={{
          color: '#000000',
        }}
        contentStyle={{
          color: '#000000',
        }}
        size="small"
      />
      <div className="record-operate">
        <Button type="primary" danger>
          {t('left.stopRecording')}
        </Button>
        <Button type="primary">{t('left.reload')}</Button>
      </div>
      <Button type="primary" style={{ width: '100%' }} onClick={showModal}>
        {t('left.quickReset')}
      </Button>
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
  );
};

export default Left;
