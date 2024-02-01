import { Modal, Spin, message } from 'antd';
import Preferences from './Preferences';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deviceState, deviceTime, equipment, historyDevice, isFirstPage, menuKey } from '@/stores';
import { useRecoilState, useRecoilValue } from 'recoil';
import { deviceExample, setTypePower } from '@/utils/deviceOperation';
import brand from '@/assets/brand.png';
import * as ImgMenu from './ImgMenu';
import { ipcRenderer } from 'electron';

export const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState(0);
  const [firstPage, setFirstPage] = useRecoilState(isFirstPage);
  const menuConfig: MenuConfig[] = [
    {
      name: 'header.summary',
      clock: () => {
        if (device) {
          setHeadKey(0);
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
          setHeadKey(1);
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
        setHeadKey(2);
        navigate('history');
        if (deviceHistory) {
          restitution(2);
        }
      },
      icon: () => <ImgMenu.HistoryImg />,
    },
    // {
    //   name: 'header.cfr',
    //   clock: () => {
    //     setFirstPage(false);
    //     setHeadKey(3);
    //   },
    //   icon: () => <ImgMenu.CfrImg />,
    // },
    {
      name: 'header.preferences',
      clock: () => showModal(),
      icon: () => <ImgMenu.SetupImg />,
    },
    {
      name: 'header.help',
      clock: async () => {
        setObtain(true);
        const state = await ipcRenderer.invoke('deviceHelp');
        if (state == false) {
          message.error(t('header.openPdfFailed'));
        }
        setTimeout(() => {
          setObtain(false);
        }, 1000);
      },
      icon: () => <ImgMenu.HelpImg />,
    },
    {
      name: 'header.about',
      clock: () => {
        setAboutState(true);
      },
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
  const [headKey, setHeadKey] = useRecoilState(menuKey);
  const [obtain, setObtain] = useState(false);
  const restitution = (index: any) => {
    if (deviceMent) {
      const data = Object.assign({}, deviceExample);
      setDevice(data);
      setTypePower(deviceExample.database.type, deviceExample?.record?.batvol);
    } else {
      setDevice(null);
      setHeadKey(2);
      navigate('history');
      setTypePower();
    }
    setDeviceHistory(null);
  };
  // useEffect(() => {
  //   console.log(deviceStateTime);
  //   setKey(2);
  // }, [deviceStateTime]);
  // useEffect(() => {
  //   if (deviceHistory) {
  //     navigate('/');
  //     return;
  //   }
  //   if (device) {
  //     setKey(0);
  //     if (!firstPage) {
  //       navigate('/');
  //     }
  //   } else {
  //     if (key === 0 || key === 1) {
  //       setKey(-1);
  //       setFirstPage(false);
  //     }
  //   }
  // }, [device]);

  useEffect(() => {
    setKey(headKey);
  }, [headKey]);
  //关于
  const [aboutState, setAboutState] = useState(false);
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
      <Modal
        title={t('header.about')}
        open={aboutState}
        footer={null}
        maskClosable={false}
        width={400}
        onOk={() => setAboutState(false)}
        onCancel={() => setAboutState(false)}
        destroyOnClose={true}
        centered
      >
        <About />
      </Modal>
      <Modal open={obtain} centered width={200} closeIcon={null} footer={null}>
        <div
          style={{ height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div style={{ height: 100, width: 100 }}>
            <Spin size="large" tip={`${t('header.obtaining')}...`} style={{ height: 100 }}>
              <div className="content" />
            </Spin>
          </div>
        </div>
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

const About = () => {
  const { t } = useTranslation();
  const [vesion, setVersion] = useState('1.0.0');
  useEffect(() => {
    getVersion();
  }, []);
  const getVersion = async () => {
    const value = await ipcRenderer.invoke('getVersion');
    setVersion(value);
  };
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <img src={brand} style={{ width: '250px' }} />
      <div>{t('header.dingwei')}</div>
      <div>
        {t('header.version')} V{vesion}
      </div>
      <div>
        {/* <span style={{ marginRight: '6px' }}>官网</span> */}
        <a
          onClick={url => {
            ipcRenderer.invoke('open-url', 'https://www.friggatech.com');
          }}
        >
          www.friggatech.com
        </a>
      </div>
    </div>
  );
};
