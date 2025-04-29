import { Router } from 'express';
import { loginController, requestPasswordReset } from '../controllers/auth.controller';
import { validateRequest } from '../../../middlewares/validateRequest';
import { loginValidation } from '../validations/loginValidation';
import {recoveryPasswordValidation} from '../validations/refreshPasswordValidation';


const router = Router();

router.post('/login', validateRequest({body: loginValidation}), loginController);
router.get('/recoveryPassword', validateRequest({body: recoveryPasswordValidation}), requestPasswordReset);

export default router;
