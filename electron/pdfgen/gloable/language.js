'use strict';
import _config from './config';
import { en } from './i18n/en';
import { zh } from './i18n/zh';
import { ru } from './i18n/ru';
import { pt } from './i18n/pt';

export const text = function (key, lan) {
  let out = '';
  const language = lan || _config.language || 'en';
  if (language && language.length > 0) {
    out = resource[language][key] || resource['en'][key] || '--';
  }
  return out;
};

export const resource = {
  zh,
  en,
  ru,
  pt,
};
