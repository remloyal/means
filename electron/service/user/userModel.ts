import { dbInfo } from './userDb';
import { Model, DataTypes } from 'sequelize';
const { STRING, INTEGER, DATE } = DataTypes; // 获取数据类型
import dayjs from 'dayjs';

export const UserInfo = dbInfo.define(
  'user_info',
  {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    userName: { type: STRING, allowNull: false },
    realName: { type: STRING, allowNull: false },
    password: { type: STRING, allowNull: false },
    // 职位
    position: { type: STRING, allowNull: false },
    // 类型
    type: { type: STRING, allowNull: false },
    // 状态，是否锁定
    state: { type: STRING, allowNull: false },
    // 权限id
    powerId: { type: STRING, allowNull: false },
    // 签注id
    endorsementId: { type: STRING, allowNull: false },
    createdAt: {
      type: DATE,
      get() {
        return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    updatedAt: {
      type: DATE,
      get() {
        return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export const Power = dbInfo.define(
  'power',
  {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING, allowNull: false },
    translateKey: { type: STRING, allowNull: true },
    createdAt: {
      type: DATE,
      get() {
        return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    updatedAt: {
      type: DATE,
      get() {
        return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export const Endorsement = dbInfo.define(
  'endorsement',
  {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING, allowNull: false },
    translateKey: { type: STRING, allowNull: true },
    createdAt: {
      type: DATE,
      get() {
        return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    updatedAt: {
      type: DATE,
      get() {
        return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export const Logs = dbInfo.define(
  'logs',
  {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING, allowNull: true },
    value: { type: STRING, allowNull: false },
    createdAt: {
      type: DATE,
      get() {
        return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    updatedAt: {
      type: DATE,
      get() {
        return dayjs(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);
