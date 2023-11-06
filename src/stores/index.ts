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
// export const resize = selector({
//   key: 'size',
//   get: ({ get }) => {
//     const [resize, setResize] = useState<any>();
//     ipcRenderer.on('resizeEvent', data => {
//       setResize(data);
//     });
//     return resize;
//   },
// });
