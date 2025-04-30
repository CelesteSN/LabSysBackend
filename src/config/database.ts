import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'pps_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'celeste123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

// import { Sequelize } from 'sequelize';

// export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   logging: false,
// });
