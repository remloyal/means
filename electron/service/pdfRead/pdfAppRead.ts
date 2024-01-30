import { PATH_PARAM, SYSTEM } from '../../config';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { isfileExist, sleep } from '../../unitls/unitls';
const AdmZip = require('adm-zip');
import log from '../../unitls/log';

export const readAppPdf = async (
  pdfPath: string = '',
  pdfPassword: string = ''
): Promise<string> => {
  if (SYSTEM.IS_WIN) {
    return await readWin(pdfPath, pdfPassword);
  }
  return '';
};

const readWin = async (pdfPath: string, pdfPassword: string): Promise<string> => {
  const appZipPath = path.join(PATH_PARAM.STATIC_PATH, 'win.zip');

  if (!fs.existsSync(appZipPath)) return '';
  const appReadPath = path.join(PATH_PARAM.STATIC_PATH, 'friggaReadPdf.exe');

  if (!fs.existsSync(appReadPath)) {
    // 不存在解压处理
    const admzip = new AdmZip(appZipPath);
    admzip.extractAllTo(PATH_PARAM.STATIC_PATH);
  }
  const fileName = `${Math.random().toString(36).slice(-6)}.txt`;
  const catchPath = path.join(PATH_PARAM.CACHE_PATH, 'pdf');
  if (!fs.existsSync(catchPath)) {
    fs.mkdirSync(catchPath);
  }
  const catchFilePath = path.join(catchPath, fileName);
  await runPythonScript(
    appReadPath,
    pdfPassword != '' ? [pdfPath, catchFilePath, pdfPassword] : [pdfPath, catchFilePath]
  );
  if (fs.existsSync(catchFilePath)) {
    const files = fs.readFileSync(catchFilePath, 'utf-8');
    setTimeout(() => {
      fs.unlinkSync(catchFilePath);
    }, 1500);
    return files;
  } else {
    return '';
  }
};

// 执行 Python 脚本
function runPythonScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(scriptPath, args);
    let text = '';
    pythonProcess.stdout.on('data', data => {
      text += data.toString();
    });

    pythonProcess.stderr.on('data', data => {
      log.error(`错误：${data}`);
    });

    pythonProcess.on('close', code => {
      console.log(`Python 进程已退出，退出码为 ${code}`);
      resolve(text);
    });
  });
}
