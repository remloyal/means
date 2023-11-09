import path from 'path';
import fs from 'fs';
import { ipcMain } from 'electron';
import { Sequelize } from 'sequelize';
import sqlite3 from 'sqlite3';
const appPath = path.resolve(process.cwd());
const configDir = path.join(appPath, 'resources');
const dbPath = path.join(appPath, 'resources', 'database.db');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir);
}
console.log(dbPath);

export const database = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  // timezone: '+08:00',
  dialectModule: sqlite3,
});

// 测试数据库链接
database
  .authenticate()
  .then(() => {
    // 创建模型
    database
      .sync({ force: false, alter: true })
      .then(() => {
        console.log('数据库同步成功 66666666');
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
