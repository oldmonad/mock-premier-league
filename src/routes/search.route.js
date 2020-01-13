import { Router } from 'express';

import Controller from '../controllers';

import { keyword } from '../utils/validation-schema.utils';
import { validateReqQuery } from '../middleware/validate-input.middleware';

import tryCatch from '../utils/try-catch.utils';

const searchRouter = Router();

searchRouter.get(
  '/',
  validateReqQuery(keyword),
  //   rateLimiter,
  tryCatch(Controller.search),
);

export default searchRouter;
