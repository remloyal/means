/* eslint-disable */
import _log from '../unitls/log';
import { buildPdf } from './process/index';

export const createPdf = async (info, monitors) => {
  try {
    const data = await buildPdf(info, monitors);
    _log.info('build success = ', JSON.stringify(data));
    return data;
  } catch (error) {
    _log.error('build error = ', error);
    return false;
  }
};
