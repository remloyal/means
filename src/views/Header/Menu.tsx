import { Button, Modal, Space } from 'antd';
import summary from '@assets/MainForm/btn.summary.png';
import { ExclamationCircleFilled, HomeOutlined } from '@ant-design/icons';
import { Popup } from '@/components/popup/Popup';
import Preferences from './Preferences';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Menu: React.FC = () => {
  const navigate = useNavigate();

  const menuConfig: MenuConfig[] = [
    {
      name: 'header.summary',
      clock: () => {
        navigate('/');
      },
      icon: () => <i className="iconfont icon-shu"></i>,
    },
    {
      name: 'header.configureDevices',
      clock: () => {
        navigate('deploy');
      },
      icon: () => <i className="iconfont icon-weibaopeizhi"></i>,
    },
    {
      name: 'header.data',
      clock: () => {},
      icon: () => <i className="iconfont icon-lishi"></i>,
    },
    {
      name: 'header.cfr',
      clock: () => {},
      icon: () => <i className="iconfont icon-fangyu"></i>,
    },
    {
      name: 'header.preferences',
      clock: () => showModal(),
      icon: () => <i className="iconfont icon-shezhi"></i>,
    },
    {
      name: 'header.help',
      clock: () => {},
      icon: () => <i className="iconfont icon-bangzhuye"></i>,
    },
    {
      name: 'header.about',
      clock: () => {},
      icon: () => <i className="iconfont icon-guanyu"></i>,
    },
  ];
  const { t } = useTranslation();
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
