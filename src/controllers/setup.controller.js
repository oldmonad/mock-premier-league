import { successResponse } from '../utils/helpers';
import Setup from '../models/setup.model';

/**
 * Add recipe to cart
 * @param {object} req
 * @param {object} res
 * @returns {object} cart string
 */
export async function setup(req, res) {
  const { test } = req.body;
  const newSetup = new Setup({
    test,
  });
  return successResponse(res, 201, 'setup complete', newSetup);
}
