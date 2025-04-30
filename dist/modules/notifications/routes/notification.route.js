"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
// src/modules/notification/routes/notification.route.ts
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
exports.notificationRouter = router;
router.post('/send', notification_controller_1.notify);
