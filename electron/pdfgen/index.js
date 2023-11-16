'use strict';
import cp from 'child_process';
import _log from './log';
import path from 'path';

const pdf_gen_path = path.join(__dirname);
console.log('PDF generation started',pdf_gen_path);
export const buildPdf = ({ info, monitors }, callback) => {
  // let childProcess = cp.fork(`${__dirname}/process/pdf_gen_process.js`);
  let childProcess = cp.fork('./process/pdf_gen_process.js');

  // let childProcess = cp.fork(`${__dirname}/pdf_gen_process.js`);
  // _log.info('cp.fork ,pid:', childProcess.pid);
  childProcess.send({
    info,
    monitors,
  });
  childProcess.on('message', (res) => {
    callback(res);
    // 主动断开父子间IPC通信
    childProcess.disconnect();
    childProcess.kill();
  });

  childProcess.on('close', (code = 'unkown') => {
    _log.info('buildPdf child proccess closed :', code, '  id :', childProcess && childProcess.pid);
    childProcess.kill();
    childProcess = null;
  });

  childProcess.on('error', (code = 'unkown') => {
    _log.info('buildPdf child proccess error :', code, '  id :', childProcess && childProcess.pid);
    childProcess = null;
  });
  childProcess.on('exit', (code = 'unkown') => {
    _log.info('buildPdf child proccess exit :', code, '  id :', childProcess && childProcess.pid);
    childProcess = null;
  });
};

