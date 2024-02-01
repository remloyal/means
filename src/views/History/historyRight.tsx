import { deviceState, deviceTime, equipment, historyDevice, menuKey, screenTime } from '@/stores';
import { Button } from 'antd';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { deviceExample, setTypePower } from '@/utils/deviceOperation';
import { useTranslation } from 'react-i18next';

const HistoryRight = () => {
  const { t } = useTranslation();
  const [deviceHistory, setDeviceHistory] = useRecoilState(historyDevice);
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceMent, setDeviceMent] = useRecoilState(deviceState);
  const [deviceStateTime, setDeviceStateTime] = useRecoilState(deviceTime);
  const [headKey, setHeadKey] = useRecoilState(menuKey);
  const [filterTime, setFilterTime] = useRecoilState(screenTime);
  const navigate = useNavigate();
  const toback = () => {
    setDeviceHistory(null);
    setFilterTime({
      startTime: '',
      endTime: '',
    });
    // 返回上一页
    if (deviceMent) {
      const data = Object.assign({}, deviceExample);
      setTypePower(deviceExample.database.type, deviceExample?.record?.batvol);
      setDevice(data);
    } else {
      setTypePower();
      setDevice(null);
    }

    setDeviceStateTime(Math.random().toString(36).slice(-6));
    navigate(-1);
    setHeadKey(2);
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
