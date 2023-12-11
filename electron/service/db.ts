/* eslint-disable quotes */
import fs from 'fs';
import { Sequelize } from 'sequelize';
import sqlite3 from 'sqlite3';
import { DB_PARAM, PATH_PARAM } from '../config';

if (!fs.existsSync(PATH_PARAM.RESOURCES)) {
  fs.mkdirSync(PATH_PARAM.RESOURCES);
}
import log from '../unitls/log';

export const database = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PARAM.DB_PATH,
  // timezone: '+08:00',
  dialectModule: sqlite3,
  password: DB_PARAM.DB_PASSWORD,
  dialectModulePath: '@journeyapps/sqlcipher',
  logging: manage => {
    log.db(manage);
  },
});

// 测试数据库链接
database
  .authenticate()
  .then(() => {
    // 创建模型
    database
      .sync({ force: false, alter: false })
      .then(() => {
        console.log('数据库同步成功');
      })
      .catch(err => {
        console.error('数据库同步失败====>', err);
      });

    console.log('数据库连接成功');
  })
  .catch(async (err: any) => {
    // 数据库连接失败时打印输出
    console.error('数据库连接失败====>', err);
  });
