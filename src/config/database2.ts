import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL no está definida');
}

console.log('📡 Conectando a:', process.env.DATABASE_URL);

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});
