import path from 'path';
import log from './pdfgen/log';

//   项目根路径/resources/{资源}
export const filePath = (route: string) => {
  const pathroute = path.join(process.cwd(), '/resources', route);
  log.info('获取文件路径====>', pathroute);
  return pathroute;
};
