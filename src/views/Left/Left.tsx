import { equipment, deviceState, resize } from '@/stores';
import disconnect from '@assets/MainForm/DeviceImage/disconnect.png';
import { Button, Descriptions, DescriptionsProps } from 'antd';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

const Left: React.FC = () => {
  const { t } = useTranslation();

  const [device, setDevice] = useRecoilState(equipment);
  const [deviceMent, setDeviceMent] = useRecoilState(deviceState);
  const [resizeData, setResizeData] = useRecoilState(resize);
  
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
      children: device != null ? device?.record.time : '---',
    },
    {
      label: t('left.batteryLevel'),
      children: device != null ? device?.record.mode : '---',
    },
    {
      label: t('left.DeviceStatus'),
      children: device != null ? device?.record.deviceType : '---',
    },
    {
      label: t('left.recordPoints'),
      children: device != null ? device?.record.deviceType : '---',
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
      children: device != null ? device?.record.maximumValue : '---',
    },
    {
      label: t('left.minimumValue'),
      children: device != null ? device?.record.minimumValue : '---',
    },
  ];
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
    </div>
  );
};

export default Left;
