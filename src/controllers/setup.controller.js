import { successResponse } from '../utils/helpers';

/**
 * Add recipe to cart
 * @param {object} req
 * @param {object} res
 * @returns {object} cart string
 */
export async function setup(req, res) {
  return successResponse(res, 200, 'setup complete');
}
