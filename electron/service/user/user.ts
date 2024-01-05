import { ipcMain } from 'electron';
import log from '../../unitls/log';
import { UserRelated } from '../model';
import { UserRelatedData, UserPowerRelatedData } from './userInit';
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
} from './userControl';
import { Power } from './userModel';

export const getUserStart = async (name = '') => {
  if (name) {
    const data = await UserRelated.findOne({
      where: {
        name,
      },
    });
    return data ? data.toJSON() : {};
  }
  const data = await UserRelated.findOne({
    where: {
      name: 'isEnabled',
    },
  });
  if (!data) {
    log.info('UserRelated: 初始化 isEnabled 状态');
    UserRelated.bulkCreate(UserRelatedData);
    Power.bulkCreate(UserPowerRelatedData);
    return false;
  }
  if (data.toJSON().value == '0') return false;
  return true;
};

export const setUserStart = async ({ name, value }) => {
  const data = await UserRelated.findOne({
    where: {
      name,
    },
  });
  if (data) {
    if (value) {
      data.update({ value });
      data.save();
    }
    return data.toJSON();
  } else {
    const todo = await UserRelated.create({
      name,
      value,
    });
    return todo.toJSON();
  }
};

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
      log.error(error);
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

ipcMain.handle('securityPolicy', (event, params: ParamType) => {
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
