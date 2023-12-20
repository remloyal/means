import { memo, useEffect, useState } from 'react';
import { Button, DatePicker, Input, Radio, Select, Space, Table, TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { pageHeight } from '@/stores';
import { useRecoilState } from 'recoil';

interface RecordType {
  id: number;
  time: string;
  heat: string | number;
}
export const AuditLog = () => {
  const { t } = useTranslation();
  const [height, setHight] = useRecoilState(pageHeight);
  const [axle, setAxle] = useState<number>(500);
  const [csvData, setCsvData] = useState<RecordType[]>();
  const columns: TableProps<RecordType>['columns'] = [
    {
      title: t('home.time'),
      dataIndex: 'id',
      width: 60,
      align: 'center',
    },
    {
      title: t('cfr.userName'),
      dataIndex: 'id',
      width: 60,
      align: 'center',
    },
    {
      title: t('history.operate'),
      dataIndex: 'time',
      width: 60,
      align: 'center',
    },
    {
      title: t('cfr.details'),
      dataIndex: 'heat',
      width: 160,
      align: 'center',
    },
  ];
  const getRowClassName = (record, index) => {
    let className = '';
    className = index % 2 === 0 ? 'oddRow' : 'evenRow';
    return className;
  };

  useEffect(() => {
    console.log(height);
    setAxle(height - 150);
  }, [height]);

  return (
    <Table
      bordered={false}
      virtual
      size="small"
      columns={columns}
      scroll={{ y: axle }}
      rowKey="id"
      dataSource={csvData}
      pagination={false}
      rowClassName={getRowClassName}
    />
  );
};
const { RangePicker } = DatePicker;

export const AuditLogRight = () => {
  const { t } = useTranslation();

  const handleChange = value => {
    // if (value == 0) {
    //   queryDevice();
    //   return;
    // }
    // const data = prevMonth(value);
    // queryDevice(data);
  };
  const timeChange = async (dates, dateStrings: [string, string]) => {
    // if (dateStrings[0] == '' && dateStrings[1] == '') {
    //   queryDevice();
    // } else {
    //   queryDevice(dateStrings);
    // }
  };
  const LogFiltering = memo(() => {
    const [value, setValue] = useState(1);
    const dataChange = e => {
      setValue(e.target.value);
    };
    return (
      <>
        <div style={{ paddingLeft: '4px', fontSize: '12px' }}>{t('cfr.categoryView')}：</div>
        <Radio.Group onChange={dataChange} value={value} size="small">
          <Space direction="vertical" className="categoryView">
            <Radio value={1}>{t('cfr.systemAuditTraces')}</Radio>
            <Radio value={2}>{t('cfr.analyzeAuditTraces')}</Radio>
            <Radio value={3}>{t('cfr.systemEvent')}</Radio>
          </Space>
        </Radio.Group>
      </>
    );
  });
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ paddingLeft: '4px', fontSize: '12px' }}>{t('history.timeOptions')}：</div>
      <RangePicker showTime size="small" onChange={timeChange} style={{ height: '30px' }} />
      {/* <Radio.Group value={checked} disabled>
            <Radio onClick={handleChangeCheck} value={true}>
            {t('history.alarmEquipment')}
            </Radio>
          </Radio.Group> */}
      <LogFiltering />
      <div style={{ paddingLeft: '4px', fontSize: '12px' }}>{t('cfr.operationType')}：</div>
      <div className="deploy-select" style={{ padding: '0' }}>
        <Select
          defaultValue={0}
          style={{ width: '100%' }}
          onChange={handleChange}
          popupClassName="deploy-select-popup"
          options={[
            { value: 0, label: t('history.all') },
            { value: 1, label: t('history.oneMonth') },
            { value: 3, label: t('history.threeMonths') },
            { value: 6, label: t('history.sixMonths') },
          ]}
        />
      </div>
    </div>
  );
};

const RoundDot = () => {
  return <span className="round-dot"></span>;
};
