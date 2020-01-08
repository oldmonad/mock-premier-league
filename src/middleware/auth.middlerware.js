import dotenv from 'dotenv';

import { errorResponse, verifyToken } from '../utils/helpers';
dotenv.config();

/**
 *
 *
 * @export
 * @param {object} req
 * @param {object} res
 * @param {void} next
 * @returns {void}
 */
export function adminAuth(req, res, next) {
  const { admin } = req.user;

  if (!admin) {
    return errorResponse(
      res,
      401,
      'You are not authorized to make this action',
      null,
    );
  }
  return next();
}
