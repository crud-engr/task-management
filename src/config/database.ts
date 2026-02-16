import { Sequelize } from 'sequelize';
import { databaseConfig } from './env';

export const sequelize = new Sequelize({
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.name,
  username: databaseConfig.user,
  password: databaseConfig.password,
  dialect: databaseConfig.dialect,
  logging: databaseConfig.logging ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    return true;
  } catch {
    return false;
  }
}
