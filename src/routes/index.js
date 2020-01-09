import { Router } from 'express';

import authRouter from './auth.route';
import teamRouter from './team.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/team', teamRouter);

export default router;
