import { MainBody, MainRight } from '@/components/main';
import { Button, Col, Modal, Row, Tabs, TabsProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HightEmpDom,
  HightHumiDom,
  LowEmpDom,
  LowHumiDom,
  StartDelayDom,
  StartModeDom,
  TempPeriodDom,
} from './DeviceOperate';
import { ipcRenderer } from 'electron';
import { useRecoilState, useRecoilValue } from 'recoil';
import { deviceConfigParam, equipment, importDeviceParam, typePower } from '@/stores';
import { TimeZone } from './Timezone';
import { DeployAdvanced } from './DeployAdvanced';
import { ShipmentDescribeDom, ShipmentIdDom } from './Shipment';
import { MultipleAlarm } from './MultipleAlarm';
import { deviceOperate } from '@/utils/deviceOperation';

const Deploy: React.FC = () => {
  return (
    <div className="summary">
      <MainBody style={{ position: 'relative' }}>
        <DeployMain></DeployMain>
      </MainBody>
      <MainRight>
        <div></div>
      </MainRight>
    </div>
  );
};

const DeployMain: React.FC = () => {
  const { t } = useTranslation();
  // 是否更新
  const [isUpdate, setIsUpdate] = useState(false);
  const power = useRecoilValue(typePower);
  const device = useRecoilValue(equipment);
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: t('deploy.basicParameters'),
      children: <DeployBasic state={isUpdate} />,
    },
    {
      key: '2',
      label: t('deploy.advancedParameters'),
      children: <DeployAdvanced state={isUpdate} />,
    },
  ];
  if (device && device.record.hardwareVersion == 'V2' && power.includes('setHighTemp1')) {
    items?.push({
      key: '3',
      label: t('deploy.multipleAlarmSettings'),
      children: <MultipleAlarm state={isUpdate} />,
    });
  }
  const save = async () => {
    if (power.includes('setBootMode')) {
      window.eventBus.emit('saving', { text: t('deploy.configuringDevice') });
      const state = await deviceOperate.setBootMode();
      if (state) {
        setIsUpdate(true);
      } else {
        setIsUpdate(false);
        window.eventBus.emit('savingClose');
      }
    } else {
      setIsUpdate(true);
      window.eventBus.emit('saving', { text: t('deploy.configuringDevice') });
    }
    setTimeout(() => {
      setIsUpdate(false);
    }, 2000);
  };

  const [activeKey, setActiveKey] = useState(0);
  return (
    <>
      {/* <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane={true} /> */}
      <div className="deploy-title">
        {items.map((item, index) => {
          return (
            <div
              key={index}
              className={activeKey == index ? 'deploy-title-active' : ''}
              onClick={() => setActiveKey(index)}
            >
              {item.label}
            </div>
          );
        })}
      </div>
      {items.map((item, index) => {
        return (
          <div key={index} style={{ display: activeKey == index ? 'block' : 'none' }}>
            {item.children}
          </div>
        );
      })}
      <DataOperate save={save}></DataOperate>
    </>
  );
};

// 基本操作
const DeployBasic = ({ state }: { state: boolean }) => {
  const power = useRecoilValue(typePower);
  const data = [
    TempPeriodDom,
    TimeZone,
    StartModeDom,
    LowEmpDom,
    HightEmpDom,
    StartDelayDom,
    power.includes('setLowHumi') ? LowHumiDom : null,
    power.includes('setHighHumi') ? HightHumiDom : null,
    power.includes('setShipmentId') ? ShipmentIdDom : null,
    power.includes('setShipment1') ? ShipmentDescribeDom : null,
  ];
  return (
    <div style={{ padding: '0 20px' }}>
      <Row gutter={[16, 16]}>
        {data.map((Item, index) => {
          if (!Item) return <div key={Math.random().toString(36).slice(-6)}></div>;
          return <Item state={state} key={index} />;
        })}
      </Row>
    </div>
  );
};

// 数据操作
const DataOperate = ({ save }: { save: () => void }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);
  const [importConfig, setImportConfig] = useRecoilState(importDeviceParam);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    save();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const selectTemplate = () => {
    ipcRenderer.send('select-config');
  };
  const exportTemplate = () => {
    ipcRenderer.send('export-config', deviceConfig);
  };
  useEffect(() => {
    ipcRenderer.on('select-config-reply', (event, arg) => {
      window.eventBus.emit('deviceConfig', arg);
      setDeviceConfig(arg);
      setImportConfig(arg);
      setTimeout(() => {
        setImportConfig({});
      }, 1000);
    });
    return () => {
      ipcRenderer.removeAllListeners('select-config-reply');
    };
  }, []);
  return (
    <>
      <div className="summary-graph-labor">
        <Button type="primary" size="large" onClick={showModal}>
          {t('deploy.saveParameters')}
        </Button>
        <Button size="large" onClick={selectTemplate}>
          {t('deploy.importTemplate')}
        </Button>
        <Button size="large" onClick={exportTemplate}>
          {t('deploy.exportTemplate')}
        </Button>
      </div>
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        width={300}
        destroyOnClose={true}
        maskClosable={false}
      >
        <p>{t('deploy.currentConfiguration')}</p>
      </Modal>
    </>
  );
};
export default Deploy;
