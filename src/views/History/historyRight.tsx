import { deviceState, deviceTime, equipment, historyDevice } from '@/stores';
import { Button } from 'antd';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { deviceExample } from '@/utils/deviceOperation';
import { useTranslation } from 'react-i18next';

const HistoryRight = () => {
  const { t } = useTranslation();
  const [deviceHistory, setDeviceHistory] = useRecoilState(historyDevice);
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceMent, setDeviceMent] = useRecoilState(deviceState);
  const [deviceStateTime, setDeviceStateTime] = useRecoilState(deviceTime);
  const navigate = useNavigate();
  const toback = () => {
    setDeviceHistory(null);
    // 返回上一页
    if (deviceMent) {
      const data = Object.assign({}, deviceExample);
      setDevice(data);
    } else {
      setDevice(null);
    }

    setDeviceStateTime(Math.random().toString(36).slice(-6));
    navigate(-1);
  };
  return (
    <>
      <Button style={{ width: '100%' }} onClick={toback}>
        {t('home.goBack')}
      </Button>
    </>
  );
};

export default HistoryRight;
