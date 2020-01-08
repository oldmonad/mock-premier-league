import { errorResponse } from './helpers.utils';
import dotenv from 'dotenv';
dotenv.config();

const tryCatch = controller => async (req, res) => {
  try {
    await controller(req, res);
  } catch (error) {
    return errorResponse(
      res,
      500,
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Your request could not be processed at this time. Kindly try again later.',
      null,
    );
  }
  return true;
};

export default tryCatch;
