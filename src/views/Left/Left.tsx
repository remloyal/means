import disconnect from '@assets/MainForm/DeviceImage/disconnect.png';
import { Button, Descriptions, DescriptionsProps } from 'antd';
import { useTranslation } from 'react-i18next';

const Left: React.FC = () => {
  const { t } = useTranslation();
  const items: DescriptionsProps['items']  = [
    {
      label: t('left.equipmentModel'),
      children: '---',
    },
    {
      label: t('left.serialNumber'),
      children: '---',
    },
    {
      label: t('left.deviceTime'),
      children: '---',
    },
    {
      label: t('left.batteryLevel'),
      children: '---',
    },
    {
      label: t('left.DeviceStatus'),
      children: '---',
    },
    {
      label: t('left.recordPoints'),
      children: '---',
    },
    {
      label: t('left.firstRecordTime'),
      children: '---',
    },
    {
      label: t('left.lastRecordedTime'),
      children: '---',
    },
    {
      label: t('left.maximumValue'),
      children: '---',
    },
    {
      label: t('left.minimumValue'),
      children: '---',
    },
  ];

  return (
    <div className="left">
      <div className="image">
        <img src={disconnect} alt="" />
        <span>报警</span>
      </div>
      <div className="record">
        {/* <div className="record-nature">
          <div>{t('left.equipmentModel')}：</div>
          <div>{t('left.serialNumber')}：</div>
          <div>{t('left.deviceTime')}：</div>
          <div>{t('left.batteryLevel')}：</div>
          <div>{t('left.DeviceStatus')}：</div>
          <div>{t('left.recordPoints')}：</div>
          <div>{t('left.firstRecordTime')}：</div>
          <div>{t('left.lastRecordedTime')}：</div>
          <div>{t('left.maximumValue')}：</div>
          <div>{t('left.minimumValue')}：</div>
        </div>
        <RecordPrice></RecordPrice> */}
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
        size='small'
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
