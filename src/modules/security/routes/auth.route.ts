import { Router } from 'express';
import { loginController, requestPasswordReset, logout } from '../controllers/auth.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { loginValidation } from '../validations/loginValidation';
import {recoveryPasswordValidation} from '../validations/recoveryPasswordValidation';
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';




const router = Router();

router.post('/login', validateRequest({body: loginValidation}), loginController);
router.post('/recoveryPassword', validateRequest({body: recoveryPasswordValidation}), requestPasswordReset);
router.post('/logout', authenticateToken, checkBlacklist, logout);

export default router;













