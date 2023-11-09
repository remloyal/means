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
        return dayjs(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    dataCount: { type: INTEGER, allowNull: false },
    maxTemperature: { type: INTEGER, allowNull: false },
    minTemperature: { type: INTEGER, allowNull: false },
    maxHumidity: { type: INTEGER, allowNull: false },
    minHumidity: { type: INTEGER, allowNull: false },
    dataStorage_type: { type: STRING, allowNull: false },
    otherData: { type: STRING, allowNull: true },
    notes: { type: STRING, allowNull: true },
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
