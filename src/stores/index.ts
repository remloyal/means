import { useEffect, useState } from 'react';
import { RecoilState, atom, selector } from 'recoil';

// 应用语言
export const language = atom({
  key: 'language',
  default: 'zh',
});

// 设备信息主体
export const equipment = atom<any>({
  key: 'device',
  default: null,
});

// 设备历史记录
export const historyDevice = atom<any>({
  key: 'historyDevice',
  default: null,
});

// 设备时间
export const deviceTime = atom<string>({
  key: 'deviceTime',
  default: '',
});

// 设备读取状态
export const deviceState = atom<boolean>({
  key: 'deviceState',
  default: false,
});

// 判断是否在第一页
export const isFirstPage = atom<boolean>({
  key: 'isFirstPage',
  default: true,
});

// 设备列表
export const deviceList = selector<DeviceInstanceType[]>({
  key: 'deviceList',
  get: ({ get }) => {
    const device = get(equipment);
    if (device) {
      return [device];
    }
    return [];
  },
});

// 应用窗口大小
export const resize = atom<any>({
  key: 'resize',
  default: {},
});

// 设备配置参数
export const deviceConfigParam = atom<any>({
  key: 'deviceConfigParam',
  default: {},
});

// 设备数据
export const deviceData = atom<any>({
  key: 'deviceData',
  default: [],
});

// 历史数据选择键
export const deviceSelectKey = atom<any>({
  key: 'deviceSelectKey',
  default: [],
});

// 日期格式
export const dateFormat = atom<any>({
  key: 'dateFormat',
  default: '',
});

// 分析状态
export const analysisState = atom<boolean>({
  key: 'analysisState',
  default: true,
});

// 分析列表
export const analysisList = atom<any[]>({
  key: 'analysisList',
  default: [],
});

// 导出Excel时间
export const exportExcelTime = atom<string>({
  key: 'exportExcelTime',
  default: '',
});

// 设备显示权限，对应AT字段
export const typePower = atom<string[]>({
  key: 'typePower',
  default: [],
});

// 菜单键
export const menuKey = atom<number>({
  key: 'MenuKey',
  default: 0,
});

// 筛选时间
export const screenTime = atom<any>({
  key: 'screenTime',
  default: {
    startTime: '',
    endTime: '',
  },
});

// 筛选列表
export const screenList = selector<any[]>({
  key: 'screenList',
  get: ({ get }) => {
    const device = get(equipment);
    const time = get(screenTime);
    if (time.startTime && time.endTime) {
      const csvData = device.csvData.filter(
        item => item.timeStamp >= time.startTime && item.timeStamp <= time.endTime
      );
      return csvData;
    }
    return device?.csvData || [];
  },
});
