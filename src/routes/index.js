import { Router } from 'express';

import authRouter from './auth.route';
import teamRouter from './team.route';
import fixtureRouter from './fixture.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/team', teamRouter);
router.use('/fixture', fixtureRouter);

export default router;
