import { RESPONSE_CODES } from './gloable/gloable';
import _log from './log';
import { buildPdf } from './process/index';
const { CODES_COMMON } = RESPONSE_CODES;

export const createPdf = async (info, monitors) => {
  try {
    const data = await buildPdf(info, monitors);
    _log.info('build success = ', data);
    return data;
  } catch (error) {
    _log.error('build error = ', error);
    return false;
  }
};
