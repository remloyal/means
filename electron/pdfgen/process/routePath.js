import biotempakguoshuen from '../templates/biotempak/guoshu/en';
import biotempakguoshuzh from '../templates/biotempak/guoshu/zh';

import brazilguoshuzh from '../templates/brazil/guoshu/en';
import brazilguoshupt from '../templates/brazil/guoshu/pt';

import friggaguoshuen from '../templates/frigga/guoshu/en';
import friggaguoshuzh from '../templates/frigga/guoshu/zh';
import friggayiyaoen from '../templates/frigga/yiyao/en';
import friggayiyaoru from '../templates/frigga/yiyao/ru';

import russiaguoshuen from '../templates/russia/guoshu/en';
import russiaguoshuru from '../templates/russia/guoshu/ru';
import russiayiyaoen from '../templates/russia/yiyao/en';
import russiayiyaoru from '../templates/russia/yiyao/ru';

import shengshengguoshuen from '../templates/shengsheng/guoshu/en';
import shengshengguoshuzh from '../templates/shengsheng/guoshu/zh';
import shengshengyiyaoen from '../templates/shengsheng/yiyao/en';
import shengshengyiyaozh from '../templates/shengsheng/yiyao/zh';

import taikunguoshuzh from '../templates/taikun/guoshu/en';
import taikunguoshupt from '../templates/taikun/guoshu/zh';

export const templateRouter = {
  biotempak: {
    guoshu: {
      en: biotempakguoshuen,
      zh: biotempakguoshuzh,
    },
  },
  brazil: {
    guoshu: {
      en: brazilguoshuzh,
      pt: brazilguoshupt,
    },
  },
  frigga: {
    guoshu: {
      en: friggaguoshuen,
      zh: friggaguoshuzh,
    },
    yiyao: {
      en: friggayiyaoen,
      ru: friggayiyaoru,
    },
  },
  russia: {
    guoshu: {
      en: russiaguoshuen,
      ru: russiaguoshuru,
    },
    yiyao: {
      en: russiayiyaoen,
      ru: russiayiyaoru,
    },
  },
  shengsheng: {
    guoshu: {
      en: shengshengguoshuen,
      zh: shengshengguoshuzh,
    },
    yiyao: {
      en: shengshengyiyaoen,
      zh: shengshengyiyaozh,
    },
  },
  taikun: {
    guoshu: {
      en: taikunguoshuzh,
      zh: taikunguoshupt,
    },
  },
};
