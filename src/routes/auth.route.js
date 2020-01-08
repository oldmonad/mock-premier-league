import { Router } from 'express';

import Controller from '../controllers';
import { validateReqBody } from '../middleware/validate-input.middleware';
import { signupSchema, loginSchema } from '../utils/validation-schema.utils';
import tryCatch from '../utils/try-catch.utils';

const authRouter = Router();

authRouter.post(
  '/signup',
  validateReqBody(signupSchema),
  tryCatch(Controller.signup),
);
authRouter.post(
  '/login',
  validateReqBody(loginSchema),
  tryCatch(Controller.login),
);

export default authRouter;
