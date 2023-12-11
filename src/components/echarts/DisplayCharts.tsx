import * as echarts from 'echarts';
import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { ipcRenderer } from 'electron';
import { useRecoilValue } from 'recoil';
import { resize } from '@/stores';

interface Chart {
  title?: string;
  xData?: string[];
  seriesData?: number[];
  option: any;
  className?: string;
  parent: React.MutableRefObject<HTMLDivElement | null>;
  style?: React.CSSProperties;
  hight?: number;
}
let sliderZoom;
export const ShareChart = forwardRef((props: Chart, ref) => {
  const { option, parent, style, hight } = props;
  const chartWrapper = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);

  useEffect(() => {
    const height = parent.current?.clientHeight;
    if (!chartWrapper.current) {
      return;
    }
    chartWrapper.current.style.height = `${height! - 100}px`;
    chart.current = echarts.init(chartWrapper.current, 'vintage');

    return () => {
      chart.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (chartWrapper != null && chart.current != null) {
      chart.current.setOption(option, true);
      sliderZoom = chart.current._componentsViews.find(
        (view: any) => view.type == 'dataZoom.slider'
      );
      if (sliderZoom) {
        let leftP = sliderZoom._displayables.handleLabels[0].style.text.length * 8;
        let rightP = -sliderZoom._displayables.handleLabels[1].style.text.length * 8;
        sliderZoom._displayables.handleLabels[0].x = option.dataZoom.start < 10 ? leftP : 0;
        sliderZoom._displayables.handleLabels[1].x = option.dataZoom.start > 90 ? rightP : 0;
        chart.current.on('datazoom', (e: any) => {
          console.log(e);
          if (e.start < 10) {
            leftP = sliderZoom._displayables.handleLabels[0].style.text.length * 8;
          } else {
            leftP = 0;
          }
          if (e.end > 90) {
            rightP = -sliderZoom._displayables.handleLabels[1].style.text.length * 8;
          } else {
            rightP = 0;
          }
          sliderZoom._displayables.handleLabels[0].x = leftP;
          sliderZoom._displayables.handleLabels[1].x = rightP;
        });
      }
    }
  }, [option]);

  const resizeData = useRecoilValue(resize);
  useEffect(() => {
    parent.current &&
      chart.current.resize({
        width: parent.current?.clientWidth,
        height: hight ? hight : parent.current?.clientHeight - 100,
      });
  }, [resizeData]);
  useImperativeHandle(ref, () => ({
    // onFinish,
    exportImage,
  }));
  const exportImage = () => {
    const data = chart.current.getDataURL({
      type: 'jpg',
    });
    return data;
  };
  return <div ref={chartWrapper} style={style} />;
});

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
        max(value) {
          return Math.ceil(value.max + 10);
        },
        min(value) {
          return Math.ceil(value.min - 10);
        },
      },
    ],
    grid: {
      left: 10,
      right: 10,
      bottom: 10,
      top: 40,
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
        symbol: 'circle',
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
        symbol: 'circle',
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
    name,
    lineStyle: {
      type: 'dashed',
      color,
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

export const createFoldLine = (seriesList: CreateSeries[]) => {
  return {
    tooltip: {
      show: true,
      confine: true,
      trigger: 'axis', //axis item
    },
    grid: {
      left: 10,
      right: 10,
      bottom: 50,
      top: 10,
      containLabel: true,
      show: true,
      backgroundColor: 'transparent',
      borderWidth: 2, // 设置边框宽度
      shadowColor: 'rgba(0, 0, 0, 0.3)', // 设置边框颜色
      zlevel: 1,
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: true, // 显示横向网格线
        lineStyle: {
          type: 'dashed', // 设置网格线样式为实线
          color: 'rgba(0, 0, 0, 0.3)', // 设置网格线颜色
        },
      },
    },
    // 设置 y 轴的类型为值轴
    yAxis: {
      type: 'value',
      splitLine: {
        show: true, // 显示横向网格线
        lineStyle: {
          type: 'dashed', // 设置网格线样式为实线
          color: 'rgba(0, 0, 0, 0.3)', // 设置网格线颜色
        },
      },
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
        type: 'slider',
        show: true,
        height: 30, //组件高度
        left: 14, //左边的距离
        right: 14, //右边的距离
        bottom: 15, //底边的距离
        borderRadius: 5,
        filterMode: 'filter',
      },
    ],
    // 设置系列（series）数据
    series: seriesList,
  };
};

export type CreateSeries = ReturnType<typeof createSeries>;
export const createSeries = (list, color, name) => {
  return {
    type: 'line',
    name,
    data: list.map(item => {
      return [new Date(item[0]), item[1]];
    }),
    sampling: 'lttb',
    lineStyle: {
      width: 1,
    },
    symbol: 'circle',
    showSymbol: false,
    itemStyle: {
      color,
    },
  };
};
