import express from "express";
import { sequelize } from "./config/database";
import cors from "cors";
import bodyParser from "body-parser";
import { userRouter } from "./modules/users/routes/user.route";
import authRoutes from "./modules/security/routes/auth.route";
import "express-async-errors"; // MUY IMPORTANTE para capturar errores async
import { errorHandler } from "./middlewares/errorHandler";
import { notificationRouter } from "./modules/notifications/routes/notification.route";
import dotenv from "dotenv";
import {projectRouter} from "./modules/projects/routes/project.route";
import { taskRouter } from "./modules/tasks/routes/task.route";
//import {connectToDatabase} from './config/database2';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: true, optionsSuccessStatus: 200, credentials: true })); //Habilitamos los cors.
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
app.use(bodyParser.json({ limit: "5mb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/projects", projectRouter);


app.use("/api/v1/tasks", taskRouter);


app.use(errorHandler);

(async () => {
	try {
		await sequelize.authenticate();
		//await connectToDatabase();
		console.log("Conexión con PostgreSQL OK 🔌");
		await sequelize.sync(); // ¡sincroniza modelos con la base de datos!
		const PORT = process.env.PORT || 3000;
		app.listen(PORT, () => {
			console.log(`Servidor corriendo en http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Error conectando a la base de datos:", error);
	}
})();
