import { Modal } from 'antd';
import Preferences from './Preferences';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deviceState, deviceTime, equipment, historyDevice, isFirstPage } from '@/stores';
import { useRecoilState, useRecoilValue } from 'recoil';
import { deviceExample } from '@/utils/deviceOperation';

import * as ImgMenu from './ImgMenu';

export const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState(0);
  const [firstPage, setFirstPage] = useRecoilState(isFirstPage);
  const menuConfig: MenuConfig[] = [
    {
      name: 'header.summary',
      clock: () => {
        if (device) {
          setKey(0);
          setFirstPage(true);
          navigate('/');
          if (deviceHistory) {
            restitution(0);
          }
        }
      },
      icon: () => <ImgMenu.SummaryImg />,
    },
    {
      name: 'header.configureDevices',
      clock: () => {
        if (device) {
          setKey(1);
          setFirstPage(false);
          navigate('deploy');
          if (deviceHistory) {
            restitution(1);
          }
        }
      },
      icon: () => <ImgMenu.DeviceImg />,
    },
    {
      name: 'header.data',
      clock: () => {
        setFirstPage(false);
        setKey(2);
        navigate('history');
        if (deviceHistory) {
          restitution(2);
        }
      },
      icon: () => <ImgMenu.HistoryImg />,
    },
    {
      name: 'header.cfr',
      clock: () => {
        setFirstPage(false);
        setKey(3);
      },
      icon: () => <ImgMenu.CfrImg />,
    },
    {
      name: 'header.preferences',
      clock: () => showModal(),
      icon: () => <ImgMenu.SetupImg />,
    },
    {
      name: 'header.help',
      clock: () => {},
      icon: () => <ImgMenu.HelpImg />,
    },
    {
      name: 'header.about',
      clock: () => {},
      icon: () => <ImgMenu.AboutImg />,
    },
  ];
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const [device, setDevice] = useRecoilState(equipment);
  const [deviceHistory, setDeviceHistory] = useRecoilState(historyDevice);
  const [deviceMent, setDeviceMent] = useRecoilState(deviceState);
  const [deviceStateTime, setDeviceStateTime] = useRecoilState(deviceTime);
  const restitution = (index?) => {
    if (deviceMent) {
      const data = Object.assign({}, deviceExample);
      setDevice(data);
    } else {
      setDevice(null);
      setKey(2);
      navigate('history');
    }
    setDeviceHistory(null);
  };
  // useEffect(() => {
  //   console.log(deviceStateTime);
  //   setKey(2);
  // }, [deviceStateTime]);
  useEffect(() => {
    if (deviceHistory) {
      navigate('/');
      return;
    }
    if (device) {
      setKey(0);
      if (!firstPage) {
        navigate('/');
      }
    } else {
      if (key === 0 || key === 1) {
        setKey(-1);
        setFirstPage(false);
      }
    }
  }, [device]);

  return (
    <>
      {menuConfig.map((item, index) => {
        return MenuItem(item, index, key);
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

export const MenuItem = (props: MenuConfig, index, key?) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="menu-item" key={index} onClick={props.clock}>
      <div className={`menu-son ${key == index ? 'menu-active' : ''}`}>
        <props.icon />
      </div>
      <div>{t(props.name)}</div>
    </div>
  );
};
