import { MainBody, MainRight } from '@/components/main';
import { Button, Col, Modal, Row, Tabs, TabsProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StartModeDom, TempPeriodDom } from './DeviceOperate';

const Deploy: React.FC = () => {
  return (
    <div className="summary">
      <MainBody style={{ position: 'relative' }}>
        <DeployMain></DeployMain>
      </MainBody>
      <MainRight>
        <div>Deploy</div>
      </MainRight>
    </div>
  );
};

const DeployMain: React.FC = () => {
  const { t } = useTranslation();
  // 是否更新
  const [isUpdate, setIsUpdate] = useState(false);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: t('deploy.basicParameters'),
      children: <DeployBasic state={isUpdate} />,
    },
    // {
    //   key: '2',
    //   label: t('deploy.advancedParameters'),
    //   children: <DeployAdvanced state={isUpdate} />,
    // },
    // {
    //   key: '3',
    //   label: t('deploy.multipleAlarmSettings'),
    //   children: <DeployMultiple state={isUpdate} />,
    // },
  ];

  const save = () => {
    setIsUpdate(true);
    setTimeout(() => {
      setIsUpdate(false);
    }, 1000);
  };
  return (
    <>
      <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane={true} />
      <DataOperate save={save}></DataOperate>
    </>
  );
};

// 基本操作
const DeployBasic = ({ state }: { state: boolean }) => {
  // 记录周期
  const [cycle, setCycle] = useState(0);
  // 时区
  const [timezone, setTimezone] = useState(0);

  return (
    <div style={{ padding: '0 20px' }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <TempPeriodDom state={state} />
        </Col>
        <Col span={8}>
          <StartModeDom state={state} />
        </Col>
        {/* <Col span={8}>
          <div style={{ padding: '10px 0' }}>记录周期</div>
        </Col>
        <Col span={8}>
          <div style={{ padding: '10px 0' }}>时区</div>
        </Col>
        <Col span={8}>col-8</Col>
        <Col span={8}>col-8</Col>
        <Col span={8}>col-8</Col>
        <Col span={8}>col-8</Col>
        <Col span={8}>col-8</Col>
        <Col span={8}>col-8</Col> */}
      </Row>
    </div>
  );
};

// 高级参数
const DeployAdvanced = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      console.log('DeployAdvanced 更新...');
    }
  }, [state]);
  return <div>DeployAdvanced</div>;
};

// 多参数设置
const DeployMultiple = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      console.log('DeployMultiple 更新...');
    }
  }, [state]);
  return <div>DeployMultiple</div>;
};

// 数据操作
const DataOperate = ({ save }: { save: () => void }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  return (
    <>
      <div className="summary-graph-labor">
        <Button type="primary" size="large" onClick={showModal}>
          {t('deploy.saveParameters')}
        </Button>
        <Button size="large">{t('deploy.importTemplate')}</Button>
        <Button size="large">{t('deploy.exportTemplate')}</Button>
      </div>
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        destroyOnClose={true}
      >
        <p>{t('deploy.currentConfiguration')}</p>
      </Modal>
    </>
  );
};
export default Deploy;
