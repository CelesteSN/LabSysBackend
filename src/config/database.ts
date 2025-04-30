import { Sequelize } from 'sequelize';
 //import dotenv from 'dotenv';

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
// import dotenv from 'dotenv';
// dotenv.config();
// console.log('DATABASE_URL:', process.env.DATABASE_URL);

// export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   //logging: false,
// });




// import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';

// dotenv.config();

// // Log de verificación en desarrollo
// console.log('DATABASE_URL:', process.env.DATABASE_URL);

// // Crear la instancia
// export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   logging: false, // podés cambiar a true para ver las queries
// });

// // Conexión con reintentos
// export async function connectToDatabase(retries = 5) {
//   while (retries > 0) {
//     try {
//       await sequelize.authenticate();
//       console.log('✅ Conexión a PostgreSQL exitosa');
//       await sequelize.sync(); // crea tablas si no existen
//       return;
//     } catch (err: any) {
//       console.error('❌ Error al conectar a la base:', err.message);
//       retries--;
//       console.log(`🔁 Reintentando conexión... (${5 - retries}/5)`);
//       await new Promise((res) => setTimeout(res, 5000));
//     }
//   }
//   throw new Error('🚫 No se pudo conectar a la base después de múltiples intentos');
// }
