import dotenv from 'dotenv';

import {
  errorResponse,
  verifyToken,
  decodeToken,
} from '../utils/helpers.utils';
import User from '../models/user.model';

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

/**
 *
 *
 * @export
 * @param {object} req
 * @param {object} res
 * @param {void} next
 * @returns {void}
 */
export async function checkAuthenticatedUser(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return errorResponse(res, 401, 'Unauthorized - Header Not Set');
  }
  const validToken = await verifyToken(token.split(' ')[1]);
  if (!validToken) {
    return errorResponse(res, 400, 'Access Denied. Please Log In.');
  }
  try {
    const jwtPayload = await decodeToken(token.split(' ')[1]);
    const user = await User.findOne({ _id: jwtPayload.sub });
    // console.log(jwtPayload);

    if (!user) {
      return errorResponse(res, 400, 'Non-existent user.');
    }

    req.user = user;
    return next();
  } catch (error) {
    return errorResponse(res, 500, 'Error verifying user.');
  }
}
