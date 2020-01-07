import { Router } from 'express';
import tryCatch from '../utils/tryCatch';
import setupController from '../controllers';

const setupRouter = Router();

setupRouter.post('/setup', tryCatch(setupController.setup));

export default setupRouter;
