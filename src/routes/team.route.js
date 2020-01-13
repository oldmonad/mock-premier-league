import { Router } from 'express';

import Controller from '../controllers';
import {
  checkAuthenticatedUser,
  adminAuth,
} from '../middleware/auth.middlerware';
import { teamSchema, teamId } from '../utils/validation-schema.utils';
import {
  validateReqBody,
  validateReqParams,
} from '../middleware/validate-input.middleware';
import tryCatch from '../utils/try-catch.utils';

const teamRouter = Router();

teamRouter.post(
  '/',
  validateReqBody(teamSchema),
  checkAuthenticatedUser,
  adminAuth,
  tryCatch(Controller.createTeam),
);
teamRouter.patch(
  '/:teamId',
  validateReqParams(teamId),
  validateReqBody(teamSchema),
  checkAuthenticatedUser,
  adminAuth,

  tryCatch(Controller.updateTeam),
);
teamRouter.delete(
  '/:teamId',
  validateReqParams(teamId),
  checkAuthenticatedUser,
  adminAuth,
  tryCatch(Controller.deleteTeam),
);

teamRouter.get('/', checkAuthenticatedUser, tryCatch(Controller.getTeams));
teamRouter.get(
  '/:teamId',
  validateReqParams(teamId),
  checkAuthenticatedUser,
  tryCatch(Controller.getTeam),
);

export default teamRouter;
