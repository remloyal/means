import { ipcMain } from 'electron';
import { Logs } from './userModel';
import log from '../../unitls/log';
import { LOG_PARAM } from '../../config';

const operateType = {};

interface ParamType {
  name: string;
  data: any;
}

ipcMain.handle('userLog', (event, params: ParamType) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await userRouter[params.name](params.data);
      resolve(data);
    } catch (error) {
      log.error(params.name, error);
      resolve(false);
    }
  });
});

const userRouter = {
  isLogin: () => LOG_PARAM.COLLECT_STATE,
  login: () => LOG_PARAM.COLLECT_STATE,
};
