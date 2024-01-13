import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import zh_CN from './zh_CN.json';
import en_US from './en_US.json';
import { ipcRenderer } from 'electron';

const lang = await ipcRenderer.invoke('lang', localStorage.getItem('language') || 'en');
if (!localStorage.getItem('language')) {
  await localStorage.setItem('language', lang);
}

i18n
  // 检测用户当前使用的语言
  // 文档: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // 注入 react-i18next 实例
  .use(initReactI18next)
  // 初始化 i18next
  // 配置参数的文档: https://www.i18next.com/overview/configuration-options
  .init({
    debug: false,
    fallbackLng: localStorage.getItem('language') || lang,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      zh: {
        translation: zh_CN,
      },
      en: {
        translation: en_US,
      },
    },
  });

export default i18n;
