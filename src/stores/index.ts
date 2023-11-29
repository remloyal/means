import { useEffect, useState } from 'react';
import { RecoilState, atom, selector } from 'recoil';

export const language = atom({
  key: 'language',
  default: 'zh_CN',
});

export const equipment = atom<any>({
  key: 'device',
  default: null,
});

export const historyDevice = atom<any>({
  key: 'historyDevice',
  default: null,
});
export const deviceTime = atom<string>({
  key: 'deviceTime',
  default: '',
});

export const deviceState = atom<boolean>({
  key: 'deviceState',
  default: false,
});

// 判断是否在第一页
export const isFirstPage = atom<boolean>({
  key: 'isFirstPage',
  default: true,
});

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

export const resize = atom<any>({
  key: 'resize',
  default: {},
});

export const deviceConfigParam = atom<any>({
  key: 'deviceConfigParam',
  default: {},
});

export const deviceData = atom<any>({
  key: 'deviceData',
  default: [],
});

export const deviceSelectKey = atom<any>({
  key: 'deviceSelectKey',
  default: [],
});

export const dateFormat = atom<any>({
  key: 'dateFormat',
  default: '',
});

export const analysisState = atom<boolean>({
  key: 'analysisState',
  default: true,
});

export const analysisList = atom<any[]>({
  key: 'analysisList',
  default: [],
});

export const exportExcelTime = atom<string>({
  key: 'exportExcelTime',
  default: '',
});

// 设备显示权限，对应AT字段
export const typePower = atom<string[]>({
  key: 'typePower',
  default: [],
});
