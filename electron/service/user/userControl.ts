import { Power, UserInfo } from './userModel';
import log from '../../unitls/log';

export const createUser = async param => {
  const oldData = await UserInfo.findOne({
    where: {
      userName: param.userName,
    },
  });
  if (oldData) {
    oldData.update({
      userName: param.userName,
      password: param.password,
      realName: param.realName,
      position: param.position,
    });
    oldData.save();
    log.info('更新用户信息成功');
    return oldData.toJSON();
  } else {
    const newData = await UserInfo.create({
      userName: param.userName,
      password: param.password,
      realName: param.realName,
      position: param.position,
      status: '1',
      type: param.type || '1',
      state: '0',
      powerId: '',
      endorsementId: '',
    });
    return newData.toJSON();
  }
};

export const queryUser = async () => {
  const data = await UserInfo.findAll();
  const todo = data.map(item => item.toJSON());
  return todo;
};

// 判断用户名是否存在
export const queryUserByName = async param => {
  const data = await UserInfo.findOne({
    where: {
      userName: param.userName,
    },
  });
  return data;
};

// 锁定用户
export const lockUser = async param => {
  const data = await UserInfo.findOne({
    where: {
      userName: param.userName,
      id: param.id,
    },
  });
  if (data) {
    data.update({
      state: param.state,
    });
    data.save();
    log.info('lockUser 成功');
    return data.toJSON();
  } else {
    return false;
  }
};

// 重置用户
export const resetUser = async param => {
  const data = await UserInfo.findOne({
    where: {
      userName: param.userName,
      id: param.id,
    },
  });
  if (data) {
    data.update({
      password: '123456',
    });
    data.save();
    log.info('resetUser 成功');
    return data.toJSON();
  } else {
    return false;
  }
};

// 查询权利
export const queryPower = async () => {
  const data = await Power.findAll();
  return data
    .map(item => item.toJSON())
    .map(item => {
      return { ...item, key: item.id };
    });
};

// 更改用户powerId
export const updateUserPower = async param => {
  const data = await UserInfo.findOne({
    where: {
      userName: param.userName,
      id: param.id,
    },
  });
  if (data) {
    data.update({
      powerId: param.powerId,
    });
    data.save();
    log.info('updateUserPower 成功');
    return data.toJSON();
  } else {
    return false;
  }
};
