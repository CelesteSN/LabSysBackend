import { Sequelize } from 'sequelize';
 //import dotenv from 'dotenv';

export const sequelize = new Sequelize(
	process.env.DB_NAME || "pps_db_bout",
	process.env.DB_USER || "pps_db_bout_user",
	process.env.DB_PASSWORD || "LFQNpQRhuYJNfimBxQs5kU8CdkAl70ul",
	{
		host:
			process.env.DB_HOST ||
			"dpg-d08otcp5pdvs739o54v0-a.oregon-postgres.render.com",
		port: Number(process.env.DB_PORT) || 5432,
		dialect: "postgres",
		logging: false,
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false, // necesario para evitar error de certificado
			},
		},
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
