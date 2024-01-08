import { ipcMain } from 'electron';
import log from '../../unitls/log';
import {
  addOrUpdateSign,
  createAdmin,
  createUser,
  deleteSign,
  deleteUser,
  getSign,
  lockUser,
  queryPower,
  queryUser,
  queryUserByName,
  resetUser,
  securityPolicy,
  updateSign,
  updateUserEndorsement,
  updateUserPower,
  getUserStart as GetUserStart,
  setUserStart as SetUserStart,
} from './userControl';

export const getUserStart = GetUserStart;
export const setUserStart = SetUserStart;

interface ParamType {
  name: string;
  data: any;
}

ipcMain.handle('userOperate', (event, params: ParamType) => {
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
  createAdmin,
  createUser,
  queryUser,
  deleteUser,
  lockUser,
  resetUser,
  queryUserByName,
  queryPower,
  updateUserPower,
  addOrUpdateSign,
  updateSign,
  getSign,
  deleteSign,
  updateUserEndorsement,
};

ipcMain.handle('securityPolicy', (event, params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await securityPolicy(params);
      resolve(data);
    } catch (error) {
      log.error(error);
      resolve(false);
    }
  });
});
