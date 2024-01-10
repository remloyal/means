'use strict';

import { paint } from '../index';
import { drawPdf as devicePdf } from '../device/index';
const operate = {
  index: paint,
  device: devicePdf,
};
const drawPdf = function (pdf, info, monitors) {
  console.log('info.mold ', info.mold);
  return operate[info.mold || 'index'](pdf, info, monitors);
};

export default drawPdf;
