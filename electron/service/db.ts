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
export const detectionStatus = () => {
  return new Promise((resolve, reject) => {
    // 测试数据库链接
    database
      .authenticate()
      .then(() => {
        // 创建模型
        database
          .sync({ force: false, alter: false })
          .then(() => {
            log.info('database 数据库同步成功');
            resolve(true);
          })
          .catch(err => {
            log.error('database 数据库同步失败====>', err);
            resolve(false);
          });

        log.info('database 数据库连接成功');
      })
      .catch(async (err: any) => {
        // 数据库连接失败时打印输出
        log.error('database 数据库连接失败====>', err);
        resolve(false);
      });
  });
};
