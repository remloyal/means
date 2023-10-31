import { atom } from 'recoil';

export const language = atom({
  key: 'language', // unique ID (with respect to other atoms/selectors)
  default: 'zh_CN', // default value (aka initial value)
});
