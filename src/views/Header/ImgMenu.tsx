import summary from '@/assets/img/概要.png';
import device from '@/assets/img/配置设备.png';

import history from '@/assets/img/历史数据.png';
import cfr from '@/assets/img/21CFR.png';
import setup from '@/assets/img/偏好设置.png';
import help from '@/assets/img/帮助.png';
import about from '@/assets/img/关于.png';

export const SummaryImg = () => {
  return (
    <>
      <img className={'menu-img'} src={summary} alt="" style={{width:"12px"}} />
    </>
  );
};

export const DeviceImg = () => {
  return (
    <>
      <img className={'menu-img'} src={device} alt="" />
    </>
  );
};
export const HistoryImg = () => {
  return (
    <>
      <img className={'menu-img'} src={history} alt="" />
    </>
  );
};
export const SetupImg = () => {
  return (
    <>
      <img className={'menu-img'} src={setup} alt="" />
    </>
  );
};
export const CfrImg = () => {
  return (
    <>
      <img className={'menu-img'} src={cfr} alt="" />
    </>
  );
};
export const HelpImg = () => {
  return (
    <>
      <img className={'menu-img'} src={help} alt="" />
    </>
  );
};

export const AboutImg = () => {
  return (
    <>
      <img className={'menu-img'} src={about} alt="" />
    </>
  );
};
