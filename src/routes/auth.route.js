import { Router } from 'express';

import Controller from '../controllers';
import { validateReqBody } from '../middleware/validate-input.middleware';
import { signupSchema, loginSchema } from '../utils/validation-schema.utils';

const authRouter = Router();

authRouter.post('/signup', validateReqBody(signupSchema), Controller.signup);
authRouter.post('/login', validateReqBody(loginSchema), Controller.login);

export default authRouter;
