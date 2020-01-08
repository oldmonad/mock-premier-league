import { Router } from 'express';

import authRouter from './auth.route';
import tryCatch from '../utils/try-catch.utils';

const router = Router();

router.use('/auth', tryCatch(authRouter));

export default router;
