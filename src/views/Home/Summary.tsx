import { Button, ConfigProvider, Descriptions, DescriptionsProps, Tabs, TabsProps } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { ShareChart } from '@/components/echarts/DisplayCharts';
import { useTranslation } from 'react-i18next';
import { MainBody, MainRight } from '@/components/main';
const Summary: React.FC = () => {
  return (
    <div className="summary">
      <SummaryMain></SummaryMain>
      <SummaryRight></SummaryRight>
    </div>
  );
};

const SummaryMain: React.FC = () => {
  const { t } = useTranslation();
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: t('home.graph'),
      children: <SummaryGraph></SummaryGraph>,
    },
    {
      key: '2',
      label: t('home.dataSheet'),
      children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: t('home.signature'),
      children: 'Content of Tab Pane 3',
    },
  ];

  return (
    <MainBody>
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
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          destroyInactiveTabPane={true}
        />
      </ConfigProvider>
    </MainBody>
  );
};

const SummaryGraph: React.FC = () => {
  const data = [
    ['2000-06-05', 116],
    ['2000-06-06', 129],
    ['2000-06-07', 135],
    ['2000-06-08', 86],
    ['2000-06-09', 73],
    ['2000-06-10', 85],
    ['2000-06-11', 73],
    ['2000-06-12', 68],
    ['2000-06-13', 92],
    ['2000-06-14', 130],
    ['2000-06-15', 245],
    ['2000-06-16', 139],
    ['2000-06-17', 115],
    ['2000-06-18', 111],
    ['2000-06-19', 309],
    ['2000-06-20', 206],
    ['2000-06-21', 137],
    ['2000-06-22', 128],
    ['2000-06-23', 85],
    ['2000-06-24', 94],
    ['2000-06-25', 71],
    ['2000-06-26', 106],
    ['2000-06-27', 84],
    ['2000-06-28', 93],
    ['2000-06-29', 85],
    ['2000-06-30', 73],
    ['2000-07-01', 83],
    ['2000-07-02', 125],
    ['2000-07-03', 107],
    ['2000-07-04', 82],
    ['2000-07-05', 44],
    ['2000-07-06', 72],
    ['2000-07-07', 106],
    ['2000-07-08', 107],
    ['2000-07-09', 66],
    ['2000-07-10', 91],
    ['2000-07-11', 92],
    ['2000-07-12', 113],
    ['2000-07-13', 107],
    ['2000-07-14', 131],
    ['2000-07-15', 111],
    ['2000-07-16', 64],
    ['2000-07-17', 69],
    ['2000-07-18', 88],
    ['2000-07-19', 77],
    ['2000-07-20', 83],
    ['2000-07-21', 111],
    ['2000-07-22', 57],
    ['2000-07-23', 55],
    ['2000-07-24', 60],
  ];
  const dateList = data.map(function (item) {
    return item[0];
  });
  const valueList = data.map(function (item) {
    return item[1];
  });

  const [option, setOption] = useState({});
  const graph = useRef(null);
  useEffect(() => {
    setOption({
      tooltip: {
        trigger: 'axis',
      },
      xAxis: [
        {
          data: dateList,
        },
      ],
      yAxis: [{}],
      grid: {
        x: 50,
        y: 30,
        x2: 30,
        y2: 35,
      },
      dataZoom: [
        {
          type: 'inside', // 放大和缩小
          orient: 'vertical',
        },
        {
          type: 'inside',
        },
        {
          // start: 0,//默认为0
          // end: 100,//默认为100
          type: 'slider',
          show: false,
          // xAxisIndex: [0],
          handleSize: 0, //滑动条的 左右2个滑动条的大小
          startValue: 0, // 初始显示值
          endValue: 500000, // 结束显示值,自己定
          height: 5, //组件高度
          left: '10%', //左边的距离
          right: '10%', //右边的距离
          bottom: 15, //底边的距离
          borderColor: '#ccc',
          fillerColor: '#4cccfe',
          borderRadius: 5,
          backgroundColor: '#efefef', //两边未选中的滑动条区域的颜色
          showDataShadow: false, //是否显示数据阴影 默认auto
          showDetail: false, //即拖拽时候是否显示详细数值信息 默认true
          realtime: true, //是否实时更新
          filterMode: 'filter',
        },
      ],
      series: [
        {
          type: 'line',
          showSymbol: false,
          data: valueList,
          smooth: true,
        },
      ],
    });
  }, []);

  return (
    <>
      <div className="summary-graph" ref={graph}>
        <ShareChart option={option} parent={graph} />
      </div>
      <ExportData></ExportData>
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
              marginLeft:"16px"
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
