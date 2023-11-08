import { useEffect, useState } from 'react';
import { RecoilState, atom, selector } from 'recoil';

export const language = atom({
  key: 'language',
  default: 'zh_CN',
});

export const equipment = atom<DeviceInstanceType | null>({
  key: 'device',
  default: null,
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
