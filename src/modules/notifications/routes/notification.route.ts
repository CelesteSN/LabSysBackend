// src/modules/notification/routes/notification.route.ts
import { Router } from 'express';
import { notify } from '../controllers/notification.controller';

const router = Router();

router.post('/send', notify);

export { router as notificationRouter };
