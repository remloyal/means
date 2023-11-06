import { Button, ConfigProvider, Descriptions, DescriptionsProps, Tabs, TabsProps } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  ShareChart,
  StandardLine,
  foldLine,
  standardLine,
} from '@/components/echarts/DisplayCharts';
import { useTranslation } from 'react-i18next';
import { MainBody, MainRight } from '@/components/main';
import { useRecoilValue } from 'recoil';
import { equipment, language } from '@/stores';
import DataSheet from './DataSheet';
const Summary: React.FC = () => {
  const device = useRecoilValue(equipment);
  const [dataState, setDataState] = useState(true);
  useEffect(() => {
    if (device) {
      setDataState(true);
    } else {
      setDataState(true);
    }
  }, [device]);
  return dataState ? (
    <div className="summary">
      <SummaryMain></SummaryMain>
      <SummaryRight></SummaryRight>
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
    {
      key: '3',
      label: t('home.signature'),
      children: 'Content of Tab Pane 3',
    },
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
        <Tabs defaultActiveKey="1" items={items} />
        <ExportData></ExportData>
      </ConfigProvider>
    </MainBody>
  );
};

const SummaryGraph: React.FC = () => {
  const device = useRecoilValue(equipment);
  const [option, setOption] = useState({});
  const graph = useRef(null);
  const [dateList, setDateList] = useState<string[]>([]);
  const [valueList, setValueList] = useState<number[]>([]);
  const [humiList, setHumiList] = useState<number[]>([]);
  const [line, setLine] = useState<StandardLine[]>([]);

  const { t } = useTranslation();
  const tongue = useRecoilValue(language);

  useEffect(() => {
    setChat();
  }, [device]);

  useEffect(() => {
    const chat = foldLine(dateList, valueList, line, humiList, [
      t('home.temperature'),
      t('home.humidity'),
    ]);
    setOption(chat);
  }, [tongue]);

  const setChat = () => {
    const todo = device?.csvData;
    if (todo && todo?.length > 0) {
      const dateLists: string[] = [];
      const valueLists: number[] = [];
      const humiLists: number[] = [];
      todo.forEach((item, index) => {
        dateLists.push(item.timeStamp);
        valueLists.push(item.c);
        humiLists.push(item.humi);
      });
      const lines = setLines();
      const chat = foldLine(dateLists, valueLists, lines, humiLists, [
        t('home.temperature'),
        t('home.humidity'),
      ]);
      setOption(chat);
      setDateList(dateLists);
      setValueList(valueLists);
      setHumiList(humiLists);
      setLine(lines);
    } else {
      const lines = setLines();
      const chat = foldLine([], [], lines, [], []);
      setOption(chat);
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
      lines.push(standardLine(record.hightEmp, '温度阈值上限', '#FF0000'));
    }
    if (record?.lowtEmp) {
      lines.push(standardLine(record.lowtEmp, '温度阈值下限', '#0000FF'));
    }
    return lines;
  };

  return (
    <>
      <div className="summary-graph" ref={graph}>
        <ShareChart option={option} parent={graph} />
      </div>
    </>
  );
};

// 数据导出
const ExportData: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="summary-graph-labor">
      <Button type="primary" size="large">
        {t('home.exportData')}
      </Button>
      <Button size="large">{t('home.dataFilter')}</Button>
    </div>
  );
};

const SummaryRight: React.FC = () => {
  const { t } = useTranslation();
  const items: DescriptionsProps['items'] = [
    {
      label: t('home.startMode'),
      children: '---',
    },
    {
      label: t('home.stopMode'),
      children: '---',
    },
    {
      label: t('home.temperatureUnit'),
      children: '---',
    },
    {
      label: t('home.recordInterval'),
      children: '---',
    },
    {
      label: t('home.sensorType'),
      children: '---',
    },
    {
      label: t('home.startDelay'),
      children: '---',
    },
    {
      label: t('home.repetitionPriming'),
      children: '---',
    },
    {
      label: t('home.displayTime'),
      children: '---',
    },
    {
      label: t('home.temporaryPDF'),
      children: '---',
    },
    {
      label: t('home.timeZone'),
      children: '---',
    },
    {
      label: t('home.firmwareVersion'),
      children: '---',
    },
    {
      label: t('home.highTemperatureAlarm'),
      children: '---',
    },
    {
      label: t('home.lowTemperatureAlarm'),
      children: '---',
    },
    {
      label: t('home.runLengthCoding'),
      children: '---',
    },
    {
      label: t('home.journeyDescription'),
      children: '---',
    },
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
