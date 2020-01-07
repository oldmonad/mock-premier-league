import { Router } from 'express';
import setupRouter from './setup.route';

const router = Router();

router.use('/test-setup', setupRouter);

export default router;
