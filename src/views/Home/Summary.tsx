import {
  Button,
  ConfigProvider,
  Descriptions,
  DescriptionsProps,
  Radio,
  Tabs,
  TabsProps,
  Tooltip,
  Modal,
} from 'antd';
import React, { createRef, useEffect, useRef, useState } from 'react';
import {
  ShareChart,
  StandardLine,
  foldLine,
  standardLine,
} from '@/components/echarts/DisplayCharts';
import { useTranslation } from 'react-i18next';
import { MainBody, MainRight } from '@/components/main';
import { useRecoilState, useRecoilValue } from 'recoil';
import { equipment, historyDevice, language, screenList, screenTime, typePower } from '@/stores';
import DataSheet from './DataSheet';
import { FileJpgOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { ipcRenderer } from 'electron';
import HistoryRight from '../History/historyRight';
import { DataExport } from './DataExport';
import { c2f } from '@/utils/utils';
import { DataFilter } from './DataFilter';

// 温度单位
const MultidUnit = {
  0: '\u2103',
  1: '\u2109',
};

const Summary: React.FC = () => {
  const device = useRecoilValue(equipment);
  const [dataState, setDataState] = useState(true);
  const [deviceHistory, setDeviceHistory] = useRecoilState(historyDevice);

  useEffect(() => {
    if (device) {
      setDataState(true);
    } else {
      setDataState(false);
    }
  }, [device]);

  return dataState ? (
    <div className="summary">
      <SummaryMain></SummaryMain>
      {deviceHistory ? (
        <MainRight>
          <HistoryRight></HistoryRight>
        </MainRight>
      ) : (
        <SummaryRight></SummaryRight>
      )}
    </div>
  ) : (
    <div
      style={{
        width: '80%',
        height: '84vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
      }}
    >
      <h3>请插入Frigga记录仪</h3>
    </div>
  );
};

const SummaryMain: React.FC = () => {
  const { t } = useTranslation();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: t('home.graph'),
      children: <SummaryGraph></SummaryGraph>,
    },
    {
      key: '2',
      label: t('home.dataSheet'),
      children: <DataSheet />,
    },
    // {
    //   key: '3',
    //   label: t('home.signature'),
    //   children: 'Content of Tab Pane 3',
    // },
  ];

  return (
    <MainBody style={{ position: 'relative' }}>
      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              inkBarColor: '#f4860f',
              itemActiveColor: '#f4860f',
              itemSelectedColor: '#f4860f',
            },
          },
        }}
      >
        <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane={false} />
        <ExportData></ExportData>
      </ConfigProvider>
    </MainBody>
  );
};

const SummaryGraph: React.FC = () => {
  const device = useRecoilValue(equipment);
  const filterTime = useRecoilValue(screenTime);
  const [option, setOption] = useState({});
  const graph = useRef(null);
  const [dateList, setDateList] = useState<string[]>([]);
  const [valueList, setValueList] = useState<number[]>([]);
  const [humiList, setHumiList] = useState<number[]>([]);
  const [line, setLine] = useState<StandardLine[]>([]);
  const [order, setOrder] = useState<string[]>([]);

  const { t } = useTranslation();
  const tongue = useRecoilValue(language);
  const power = useRecoilValue(typePower);
  const MultidUnit = {
    0: '\u2103',
    1: '\u2109',
  };

  useEffect(() => {
    setChat();
  }, [device]);

  useEffect(() => {
    const chat = foldLine(dateList, valueList, line, humiList, [
      t('home.temperature') + `(${MultidUnit[device?.record.multidUnit || 0]})`,
      power.includes('setHighHumi') ? t('home.humidity') : '',
    ]);
    setOption(chat);
  }, [tongue]);

  const setChat = (list?) => {
    const todo = list || device?.csvData;
    if (todo && todo?.length > 0) {
      const dateLists: string[] = [];
      const valueLists: number[] = [];
      const humiLists: number[] = [];
      const indexList: string[] = [];
      todo.forEach((item, index) => {
        dateLists.push(item.timeStamp);
        valueLists.push(MultidUnit[device?.record.multidUnit || 0] == '\u2109' ? item.f : item.c);
        power.includes('setHighHumi') && humiLists.push(item.humi);
        indexList.push((index + 1).toString());
      });
      const lines = setLines();
      setDateList(dateLists);
      setValueList(valueLists);
      setHumiList(humiLists);
      setLine(lines);
      setOrder(indexList);
    } else {
      setLine([]);
      setDateList([]);
      setValueList([]);
      setHumiList([]);
      setLine([]);
    }
  };

  const setLines = () => {
    const record = device?.record;
    const lines: StandardLine[] = [];
    if (record?.highHumi) {
      lines.push(standardLine(record.highHumi, '湿度阈值上限', '#FF0000'));
    }
    if (record?.lowHumi) {
      lines.push(standardLine(record.lowHumi, '湿度阈值下限', '#0000FF'));
    }
    if (record?.hightEmp) {
      lines.push(standardLine(setTempValue(record.hightEmp), '温度阈值上限', '#FF0000'));
    }
    if (record?.lowtEmp) {
      lines.push(standardLine(setTempValue(record.lowtEmp), '温度阈值下限', '#0000FF'));
    }
    return lines;
  };
  const setTempValue = data => {
    const unit = MultidUnit[device?.record.multidUnit];
    if (unit == '\u2109') {
      return c2f(data);
    }
    return data;
  };

  useEffect(() => {
    setChatOption();
  }, [valueList, humiList, dateList]);
  const setChatOption = (key = 1) => {
    const chat = foldLine(key == 1 ? dateList : order, valueList, line, humiList, [
      t('home.temperature') + `(${MultidUnit[device?.record.multidUnit || 0]})`,
      power.includes('setHighHumi') ? t('home.humidity') : '',
    ]);
    setOption(chat);
  };

  const [value, setValue] = useState(1);
  const onChange = e => {
    setValue(e.target.value);
    setChatOption(e.target.value);
  };
  const childRef = createRef<any>();
  const exportImage = () => {
    const baseData = childRef.current.exportImage();
    ipcRenderer.send('export-jpg', baseData);
  };

  const todoList = useRecoilValue(screenList);
  useEffect(() => {
    if (todoList.length > 0) {
      setChat(todoList);
    }
  }, [todoList]);
  return (
    <>
      <div className="summary-graph" ref={graph}>
        <div className="summary-graph-title">
          <div style={{ marginLeft: '20px' }}>
            <Radio.Group onChange={onChange} value={value}>
              <Radio value={1}>{t('home.time')}</Radio>
              <Radio value={2}>{t('home.serialNumber')}</Radio>
            </Radio.Group>
          </div>
          <div>
            {/* <Tooltip title={t('home.thresholdEditing')} destroyTooltipOnHide={true}>
              <UnorderedListOutlined
                style={{ fontSize: '28px', marginRight: '14px', cursor: 'pointer' }}
              />
            </Tooltip> */}
            <Tooltip title={t('home.exportGraph')} destroyTooltipOnHide={true}>
              <FileJpgOutlined
                onClick={exportImage}
                style={{ fontSize: '28px', marginRight: '14px', cursor: 'pointer' }}
              />
            </Tooltip>
          </div>
        </div>
        <ShareChart option={option} parent={graph} ref={childRef} />
      </div>
    </>
  );
};

// 数据导出
const ExportData: React.FC = () => {
  const { t } = useTranslation();
  const device = useRecoilValue(equipment);
  const filterTime = useRecoilValue(screenTime);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
    console.log(device);
  };
  const filterate = () => {};
  const [screen, setScreen] = useState(false);

  return (
    <>
      <div className="summary-graph-labor">
        <Button type="primary" size="large" onClick={showModal}>
          {t('home.exportData')}
        </Button>
        <Button size="large" onClick={() => setScreen(true)}>
          {t('home.dataFilter')}
        </Button>
      </div>
      <div className="summary-graph-screen">
        {filterTime.startTime != '' && filterTime.endTime ? (
          <span>
            {filterTime.startTime} ~ {filterTime.endTime}
          </span>
        ) : (
          <></>
        )}{' '}
      </div>
      <Modal
        title={t('home.exportData')}
        open={isModalOpen}
        footer={null}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose={true}
        centered
        maskClosable={false}
      >
        <DataExport onCancel={() => setIsModalOpen(false)} />
      </Modal>
      <Modal
        title={t('home.dataFilter')}
        open={screen}
        footer={null}
        width={400}
        onOk={() => setScreen(false)}
        onCancel={() => setScreen(false)}
        destroyOnClose={true}
        centered
        maskClosable={false}
      >
        <DataFilter onCancel={() => setScreen(false)} />
      </Modal>
    </>
  );
};

const SummaryRight: React.FC = () => {
  const { t } = useTranslation();
  const device = useRecoilValue(equipment);
  // 启动模式  0：按键开启，1：定时开启，2：温度范围
  const MultIdBootMode = {
    0: t('device.keyon'),
    1: t('device.timingon'),
    2: t('device.temperaturerange'),
  };

  const setTempValue = value => {
    const unit = MultidUnit[device?.record.multidUnit];
    if (unit == '\u2109') {
      return `${c2f(value)} ${unit}`;
    }
    return `${value} ${unit}`;
  };

  const setSensor = () => {
    const sensorType = {
      M2H: (
        <div>
          {t('home.temperature')}、{t('home.humidity')}
        </div>
      ),
      M2D: <div>{t('home.temperature')}</div>,
      M2E: <div>{t('home.humidity')}</div>,
    };
    return device?.record.deviceType ? sensorType[device?.record.deviceType] : '---';
  };

  const items: DescriptionsProps['items'] = [
    {
      label: t('home.startMode'),
      children: device != null ? MultIdBootMode[device?.record.multIdBootMode] : '---',
    },
    {
      label: t('home.stopMode'),
      children: device != null ? device?.record.stopMode : '---',
    },
    {
      label: t('home.temperatureUnit'),
      children: device != null ? MultidUnit[device?.record.multidUnit] : '---',
    },
    {
      label: t('home.recordInterval'),
      children: device != null ? `${device?.record.tempPeriod} S` : '---',
    },
    {
      label: t('home.sensorType'),
      children: device != null ? setSensor() : '---',
    },
    {
      label: t('home.startDelay'),
      children: device != null ? `${device?.record.startDelayTime} S` : '---',
    },
    // {
    //   label: t('home.repetitionPriming'),
    //   children: device != null ? device?.record.repetitionPriming : '---',
    // },
    {
      label: t('home.displayTime'),
      children: device != null ? `${device?.record.multIdSleepTime} S` : '---',
    },
    // {
    //   label: t('home.temporaryPDF'),
    //   children: device != null ? device?.record.temporaryPDF : '---',
    // },
    {
      label: t('home.timeZone'),
      children: device != null ? device?.record.timeZone : '---',
    },
    {
      label: t('home.firmwareVersion'),
      children: device != null ? device?.record.firmwareVersion : '---',
    },
    {
      label: t('home.highTemperatureAlarm'),
      children: device != null ? setTempValue(device?.record.hightEmp) : '---',
    },
    {
      label: t('home.lowTemperatureAlarm'),
      children: device != null ? setTempValue(device?.record.lowtEmp) : '---',
    },
    // {
    //   label: t('home.runLengthCoding'),
    //   children: device != null ? device?.record.runLengthCoding : '---',
    // },
    // {
    //   label: t('home.journeyDescription'),
    //   children: device != null ? device?.record.journeyDescription : '---',
    // },
  ];

  return (
    <MainRight>
      <div>
        <div style={{ textAlign: 'left' }}>{t('home.summary')}</div>
        <div className="record">
          <Descriptions
            items={items}
            column={1}
            labelStyle={{
              color: '#000000',
              marginLeft: '16px',
            }}
            contentStyle={{
              color: '#000000',
            }}
            size="small"
          />
        </div>
      </div>
    </MainRight>
  );
};

export default Summary;
