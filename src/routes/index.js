import { Router } from 'express';

import authRouter from './auth.route';
import teamRouter from './team.route';
import fixtureRouter from './fixture.route';
import searchRouter from './search.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/team', teamRouter);
router.use('/fixture', fixtureRouter);
router.use('/search', searchRouter);

export default router;
