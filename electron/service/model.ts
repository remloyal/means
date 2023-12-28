import { database } from './db';
import { Model, DataTypes } from 'sequelize';
const { STRING, INTEGER, DATE } = DataTypes; // 获取数据类型
import dayjs from 'dayjs';

export const Device = database.define(
  'device',
  {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: STRING, allowNull: false },
    gentsn: { type: STRING, allowNull: false },
    dataName: { type: STRING, allowNull: false },
    startTime: {
      type: DATE,
      allowNull: false,
      get() {
        return dayjs(this.getDataValue('startTime')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    dataCount: { type: INTEGER, allowNull: false },
    temperature: {
      type: STRING,
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue('temperature'));
      },
    },
    fahrenheit: {
      type: STRING,
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue('fahrenheit'));
      },
    },
    humidity: {
      type: STRING,
      allowNull: false,
      get() {
        return JSON.parse(this.getDataValue('fahrenheit'));
      },
    },
    dataStorage_type: { type: STRING, allowNull: false },
    otherData: {
      type: STRING,
      allowNull: true,
      get() {
        return JSON.parse(this.getDataValue('otherData'));
      },
    },
    notes: { type: STRING, allowNull: true },
    alarm: { type: INTEGER, allowNull: true },
    mode: { type: STRING, allowNull: true },
    timeZone: { type: STRING, allowNull: true },
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

export const FileData = database.define(
  'file_data',
  {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    path: { type: STRING, allowNull: false },
    name: { type: STRING, allowNull: false },
    deviceId: { type: INTEGER, allowNull: false },
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

// FileData.belongsTo(Device, { foreignKey: 'device_id', targetKey: 'id' });
export const UserRelated = database.define(
  'user_related',
  {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING, allowNull: false },
    value: { type: INTEGER, allowNull: false },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);
