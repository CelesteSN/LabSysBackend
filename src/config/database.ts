import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
console.log(
	"DATABASE_URL:",
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	process.env.DB_HOST,
	process.env.DB_PORT
);
export const sequelize = new Sequelize(
	process.env.DB_NAME!, //! se utiliza para indicar que la variable no es null o undefined
	process.env.DB_USER!,
	process.env.DB_PASSWORD!,
	{
		host: process.env.DB_HOST,
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