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
