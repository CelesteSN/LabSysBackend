"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("./config/database");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const user_route_1 = require("./modules/users/routes/user.route");
const auth_route_1 = __importDefault(require("./modules/security/routes/auth.route"));
require("express-async-errors"); // MUY IMPORTANTE para capturar errores async
const errorHandler_1 = require("./middlewares/errorHandler");
const notification_route_1 = require("./modules/notifications/routes/notification.route");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: true, optionsSuccessStatus: 200, credentials: true })); //Habilitamos los cors.
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "20mb" }));
app.use(body_parser_1.default.json({ limit: "5mb" }));
app.use('/api/v1/auth', auth_route_1.default);
app.use("/api/v1/users", user_route_1.userRouter);
app.use('/api/v1/notifications', notification_route_1.notificationRouter);
//app.use("/api/laboratories", laboratoryRouter);
app.use(errorHandler_1.errorHandler);
(async () => {
    try {
        await database_1.sequelize.authenticate();
        console.log('Conexión con PostgreSQL OK 🔌');
        await database_1.sequelize.sync(); // ¡sincroniza modelos con la base de datos!
        app.listen(3000, () => {
            console.log('Servidor corriendo en http://localhost:3000');
        });
    }
    catch (error) {
        console.error('Error conectando a la base de datos:', error);
    }
})();
