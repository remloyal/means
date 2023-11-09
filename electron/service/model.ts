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
    data_name: { type: STRING, allowNull: false },
    start_time: { type: STRING, allowNull: false },
    data_count: { type: INTEGER, allowNull: false },
    max_temperature: { type: INTEGER, allowNull: false },
    min_temperature: { type: INTEGER, allowNull: false },
    max_humidity: { type: INTEGER, allowNull: false },
    min_humidity: { type: INTEGER, allowNull: false },
    data_storage_type: { type: STRING, allowNull: false },
    other_data: { type: STRING, allowNull: true },
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
    device_id: { type: INTEGER, allowNull: false },
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
