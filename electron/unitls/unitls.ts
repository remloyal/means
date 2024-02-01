import path from 'path';
import log from './log';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import dayjs from 'dayjs';
import { cryptMd5 } from './encryption';
import { APP_PATH, BASE_URL, DYNAMIC_CONFIG, PATH_PARAM, RESOURCES_NAME, SYSTEM } from '../config';
//   项目根路径/resources/{资源}
export const filePath = (route: string) => {
  // log.info('获取文件路径====>', "resources" | "Resources");
  if (SYSTEM.IS_DEV) {
    const pathroute = path.join(process.cwd(), RESOURCES_NAME, route);
    return pathroute;
  }
  if (SYSTEM.IS_MAC) {
    const pathroute = path.join(APP_PATH.replace('app.asar', ''), route);
    return pathroute;
  }
  const pathroute = path.join(process.cwd(), RESOURCES_NAME, route);
  return pathroute;
};

/**
 * 删除文件夹
 * @param {*} url
 */
export function deleteDir(url) {
  let files: string[] = [];
  if (fs.existsSync(url)) {
    //判断给定的路径是否存在
    log.info('清除 旧目标目录', url);
    files = fs.readdirSync(url); //返回文件和子目录的数组
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const curPath = path.join(url, file);
      if (curPath.includes('.asar')) {
        deleteFile(curPath);
        continue;
      } else if (fs.statSync(curPath).isDirectory()) {
        //同步读取文件夹文件，如果是文件夹，则函数回调
        deleteDir(curPath);
      } else {
        console.log(curPath);

        fs.unlinkSync(curPath); //是指定文件，则删除
      }
    }
    fs.rmdirSync(url); //清除文件夹
  } else {
    console.log('给定的路径不存在！');
  }
}

function deleteFile(path) {
  // 获取当前操作系统的平台
  const { platform } = process;

  // 定义删除命令
  let command = '';

  // 如果当前操作系统是 Windows
  if (platform === 'win32') {
    command = `del /s /f "${path}"`;
  }
  // 如果当前操作系统是 macOS
  else if (platform === 'darwin') {
    command = `rm -rf "${path}"`;
  }
  if (!path) {
    command = '';
  }
  // 执行命令
  try {
    execSync(command);
    log.info('Success:', path);
  } catch (error) {
    log.error('Error:', error);
  }
}

export function getUrl() {
  console.log(DYNAMIC_CONFIG);

  const localTimestamp = dayjs().valueOf().toString();
  const hash = cryptMd5(localTimestamp);
  const url = `${BASE_URL}/cmsapi/tools/check/${localTimestamp}/${hash}?lan=${DYNAMIC_CONFIG.lan}&type=${DYNAMIC_CONFIG.type}&ver=${DYNAMIC_CONFIG.ver}&env=${DYNAMIC_CONFIG.env}&secret=DFA11DXdeglonxsEMsx990adf9&access_token=InpoQa3EuTneFBeP5l8xwtRBiMp74ayTm97Fuc36HoPUcWl1gwtMudF6sw7VGdEv`;
  return url;
}
export const getPdfUrl = () => {
  const plan = {
    1: 'en',
    2: 'zh',
  };
  const url = `${BASE_URL}/userguidDownload/M_tool_help_${plan[DYNAMIC_CONFIG.lan]}.pdf`;
  // const url = `${BASE_URL}/userguidDownload/M_series_user_guide_en.pdf`;
  console.log('pdfUrl', url);
  return url;
};

export const judgingSpaces = pathData => {
  let directoryPath = path.join(pathData);
  if (directoryPath.includes(' ')) {
    directoryPath = `"${directoryPath}"`;
  }
  return directoryPath;
};

export const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));
export const isfileExist = (path: string): Promise<boolean> => {
  return new Promise<any>(resolve =>
    fs.access(path, fs.constants.F_OK, (err: any) => resolve(!err))
  );
};
