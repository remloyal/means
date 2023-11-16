import { RESPONSE_CODES } from './gloable/gloable';
import _log from './log';
import { buildPdf } from './process/index';
const { CODES_COMMON } = RESPONSE_CODES;

export const createPdf = (info, monitors) => {
  //   console.log(info, monitors);

  buildPdf(info, monitors)
    .then(result => {
      _log.info('build success = ', result);
    })
    .catch(err => {
      _log.error('build error = ', err);
    });
};
