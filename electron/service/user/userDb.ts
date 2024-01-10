import fs from 'fs';
import { Sequelize } from 'sequelize';
import sqlite3 from 'sqlite3';
import { DB_PARAM, PATH_PARAM } from '../../config';
import log from '../../unitls/log';

export const dbInfo = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PARAM.DB_USER_PATH,
  // timezone: '+08:00',
  dialectModule: sqlite3,
  password: DB_PARAM.DB_PASSWORD,
  dialectModulePath: '@journeyapps/sqlcipher',
  logging: manage => {
    log.db('dbInfo', manage);
  },
});

export const detectionDbInfo = () => {
  return new Promise((resolve, reject) => {
    // 测试数据库链接
    dbInfo
      .authenticate()
      .then(() => {
        // 创建模型
        dbInfo
          .sync({ force: false, alter: false })
          .then(() => {
            log.info('dbInfo 数据库同步成功');
            resolve(true);
          })
          .catch(err => {
            log.error('dbInfo 数据库同步失败====>', err);
            resolve(false);
          });

        log.info('dbInfo 数据库连接成功');
      })
      .catch(async (err: any) => {
        // 数据库连接失败时打印输出
        log.error('dbInfo 数据库连接失败====>', err);
        resolve(false);
      });
  });
};
detectionDbInfo();
