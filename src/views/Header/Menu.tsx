import { Button, Modal, Space } from 'antd';
import summary from '@assets/MainForm/btn.summary.png';
import { ExclamationCircleFilled, HomeOutlined } from '@ant-design/icons';
import { Popup } from '@/components/popup/Popup';
import Preferences from './Preferences';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const Menu: React.FC = () => {
  const { t } = useTranslation();

  const menuConfig: MenuConfig[] = [
    {
      name: 'header.summary',
      clock: () => {},
      icon: () => <HomeOutlined style={{ fontSize: '18px' }} />,
    },
    {
      name: 'header.configureDevices',
      clock: () => {},
      icon: () => <HomeOutlined style={{ fontSize: '18px' }} />,
    },
    {
      name: 'header.data',
      clock: () => {},
      icon: () => <HomeOutlined style={{ fontSize: '18px' }} />,
    },
    {
      name: 'header.cfr',
      clock: () => {},
      icon: () => <HomeOutlined style={{ fontSize: '18px' }} />,
    },
    {
      name: 'header.preferences',
      clock: () => showModal(),
      icon: () => <HomeOutlined style={{ fontSize: '18px' }} />,
    },
    {
      name: 'header.help',
      clock: () => {},
      icon: () => <HomeOutlined style={{ fontSize: '18px' }} />,
    },
    {
      name: 'header.about',
      clock: () => {},
      icon: () => <HomeOutlined style={{ fontSize: '18px' }} />,
    },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {menuConfig.map((item, index) => {
        return MenuItem(item, index);
      })}
      <Modal
        title={t('header.preferences')}
        open={isModalOpen}
        footer={null}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose={true}
        centered
      >
        <Preferences />
      </Modal>
    </>
  );
};

export const MenuItem = (props: MenuConfig, index) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="menu-item" key={index} onClick={props.clock}>
      <div className="menu-son">
        <props.icon />
      </div>
      <div>{t(props.name)}</div>
    </div>
  );
};
