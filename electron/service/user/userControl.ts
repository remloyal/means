import { Endorsement, Power, UserInfo } from './userModel';
import { UserRelated } from '../model';
import log from '../../unitls/log';
import { Op } from 'sequelize';
import { UserRelatedData, UserPowerRelatedData } from './userInit';
import { USER_PARAM } from '../../config';

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

// 创建管理员员
export const createAdmin = async param => {
  const oldData = await UserInfo.findOne({
    where: {
      type: '0',
    },
  });
  if (oldData) {
    oldData.update({
      userName: param.userName,
      password: param.password,
      realName: param.realName,
      position: param.position,
      status: '1',
      type: '0',
      state: '0',
      powerId: '1,2,3,4,5',
      endorsementId: '',
    });
    oldData.save();
    return oldData.toJSON();
  }
  const newData = await UserInfo.create({
    userName: param.userName,
    password: param.password,
    realName: param.realName,
    position: param.position,
    status: '1',
    type: '0',
    state: '0',
    powerId: '1,2,3,4,5',
    endorsementId: '',
  });
  if (newData) {
    await setUserStart({ name: 'isEnabled', value: '1' });
    return newData.toJSON();
  } else {
    return false;
  }
};

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

// 修改用户密码
export const updateUserPassword = async param => {
  const data = await UserInfo.findOne({
    where: {
      userName: param.userName,
      id: param.id,
      realName: param.realName,
    },
  });
  if (data) {
    data.update({
      password: param.newPassword,
    });
    log.info('修改用户密码成功');
    return data.toJSON();
  } else {
    log.info('修改用户密码失败');
    return false;
  }
};

// 删除用户
export const deleteUser = async param => {
  const data = await UserInfo.findOne({
    where: {
      userName: param.userName,
      id: param.id,
    },
  });
  if (data) {
    data.destroy();
    log.info('删除用户成功');
    return true;
  } else {
    log.info('删除用户失败');
    return false;
  }
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

// 用户登录
export const login = async param => {
  const data = await UserInfo.findOne({
    where: {
      userName: param.userName,
      password: param.password,
    },
  });
  if (data) {
    USER_PARAM.USER_NAME = data.toJSON().userName;
    return data.toJSON();
  }
  return false;
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
// 更改用户endorsementId
export const updateUserEndorsement = async param => {
  console.log('updateUserEndorsement', param);

  const data = await UserInfo.findOne({
    where: {
      userName: param.userName,
      id: param.id,
    },
  });
  if (data) {
    data.update({
      endorsementId: param.endorsementId,
    });
    data.save();
    log.info('updateUserEndorsement 成功');
    return data.toJSON();
  } else {
    return false;
  }
};

// 添加、修改签注
export const addOrUpdateSign = async param => {
  const newData = await Endorsement.create({
    name: param.name,
    translateKey: param.translateKey || '',
  });
  log.info('addOrUpdateSign 成功');
  return newData.toJSON();
};

// 修改签注
export const updateSign = async param => {
  const data = await Endorsement.findOne({
    where: {
      id: param.id,
    },
  });
  if (data) {
    data.update({
      name: param.name,
      translateKey: param.translateKey || data.toJSON().translateKey || '',
    });
    data.save();
    log.info('updateSign 成功');
    return data.toJSON();
  } else {
    return false;
  }
};

// 删除签注
export const deleteSign = async param => {
  const data = await Endorsement.findOne({
    where: {
      id: param.id,
      name: param.name,
    },
  });
  if (data) {
    data.destroy();
    log.info('deleteSign 成功');
    return true;
  } else {
    return false;
  }
};

// 查询签注
export const getSign = async param => {
  if (param.name) {
    const data = await Endorsement.findOne({
      where: {
        name: param.name,
      },
    });
    if (data) {
      log.info('getSign 成功');
      return data.toJSON();
    } else {
      return false;
    }
  } else {
    const data = await Endorsement.findAll();
    if (data) {
      log.info('getSign 成功');
      return data.map(item => item.toJSON());
    } else {
      return false;
    }
  }
};

// 安全策略
export const securityPolicy = async param => {
  const data = await UserRelated.findAll({
    where: {
      [Op.or]: [{ name: 'loginNumber' }, { name: 'guardTime' }, { name: 'expirationTime' }],
    },
  });
  if (param) {
    data.forEach(item => {
      // 更新对象
      const val = param[item.toJSON().name];
      item.update({
        value: val,
      });
      item.save();
    });
    return data.map(item => item.toJSON());
  } else {
    return data.map(item => item.toJSON());
  }
};
