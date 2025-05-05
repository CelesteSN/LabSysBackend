import { Router } from 'express';
import { loginController, 
    requestPasswordReset, 
    verifyRecoveryToken, 
    saveNewPassword,logout, 
    getRoleFunctionalitiesController,
    verifyToken  } from '../controllers/auth.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { loginValidation } from '../validations/loginValidation';
import {recoveryPasswordValidation} from '../validations/recoveryPasswordValidation';
import { authenticateToken } from '../../../middlewares/auth.middleware';
import { checkBlacklist } from '../../../middlewares/checkBlacList.middleware';
import {resetPasswordValidation} from '../validations/resetPasswordValidation';




const router = Router();

router.get('/role', getRoleFunctionalitiesController );
router.get('/validate-session', verifyToken);
router.post('/login', validateRequest({body: loginValidation}), loginController);
router.post('/recovery-password', validateRequest({body: recoveryPasswordValidation}), requestPasswordReset);
router.get('/verify-recovery/:token', verifyRecoveryToken);
router.post('/reset-password', validateRequest({ body: resetPasswordValidation }), saveNewPassword);
router.post('/logout', authenticateToken, checkBlacklist, logout);

export default router;













