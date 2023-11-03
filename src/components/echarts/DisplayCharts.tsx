import * as echarts from 'echarts';
import React, { useEffect, useRef, useState } from 'react';
import { ipcRenderer } from 'electron';

interface Chart {
  title?: string;
  xData?: string[];
  seriesData?: number[];
  option: any;
  className?: string;
  parent: React.MutableRefObject<HTMLDivElement | null>;
}

export const ShareChart: React.FC<Chart> = props => {
  const { option, parent } = props;
  const chartWrapper = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);

  useEffect(() => {
    const height = parent.current?.clientHeight;
    if (!chartWrapper.current) {
      return;
    }
    chartWrapper.current.style.height = `${height! - 100}px`;
    chart.current = echarts.init(chartWrapper.current, 'vintage');
    ipcRenderer.on('resizeEvent', data => {
      parent.current &&
        chart.current.resize({
          width: parent.current?.clientWidth,
          height: parent.current?.clientHeight - 100,
        });
    });
  }, []);

  useEffect(() => {
    if (chartWrapper != null && chart.current != null) {
      chart.current.setOption(option);
    }
  }, [option]);
  return <div ref={chartWrapper} />;
};

export const foldLine = (
  xList: string[],
  valueList: string[] | number[],
  lines: StandardLine[],
  humiList: string[] | number[],
  legend: string[]
) => {
  return {
    tooltip: {
      show: true,
      trigger: 'axis', //axis item
      // axisPointer: {
      //   type: 'cross',
      //   label: {
      //     backgroundColor: '#6a7985',
      //   },
      // },
      // formatter: params => {
      //   console.log(params);

      //   if (params.componentType === 'series') {
      //     return params.seriesName + '<br>' + params.marker + ' ' + params.data;
      //   } else if (params.componentType === 'markLine') {
      //     return params.marker + ' ' + params.data.label.formatter + '：' + params.value;
      //   }
      // },
    },
    legend: {
      data: legend,
    },
    xAxis: [
      {
        data: xList,
        type: 'category',
        splitLine: {
          show: true, // 显示横向网格线
          lineStyle: {
            type: 'dashed', // 设置网格线样式为实线
            color: '#666666', // 设置网格线颜色
          },
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: {
          show: true, // 显示横向网格线
          lineStyle: {
            type: 'dashed', // 设置网格线样式为实线
            color: '#666666', // 设置网格线颜色
          },
        },
      },
    ],
    grid: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 30,
      containLabel: true,
      show: true,
      backgroundColor: 'transparent',
      borderWidth: 2, // 设置边框宽度
      shadowColor: 'rgba(0, 0, 0, 0.5)', // 设置边框颜色
      zlevel: 1,
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
        name: legend[0],
        showSymbol: false,
        data: valueList,
        smooth: true,
        itemStyle: {
          color: 'red',
        },
        markLine: {
          symbol: 'none',
          data: [...lines],
        },
      },
      {
        type: 'line',
        name: legend[1],
        showSymbol: false,
        data: humiList,
        smooth: true,
        itemStyle: {
          color: '#1677FE',
        },
        markLine: {
          symbol: 'none',
          data: [...lines],
        },
      },
    ],
  };
};

export type StandardLine = ReturnType<typeof standardLine>;

export const standardLine = (data: string | number, name: string, color: string) => {
  return {
    yAxis: data,
    name: name,
    lineStyle: {
      type: 'dashed',
      color: color,
      width: 1,
    },
    label: {
      position: 'middle',
      fontSize: 12,
      formatter: name,
      show: false,
    },
  };
};
