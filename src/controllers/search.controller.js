import Fixture from '../models/fixture.model';
import User from '../models/user.model';
import Team from '../models/team.model';
import { successResponse, searchDb } from '../utils/helpers.utils';
import { responseDataOrigin } from '../utils/constants';

/**
 * Search application
 * @param {object} req
 * @param {object} res
 * @returns {object} search object
 */
export async function search(req, res) {
  const { keyword } = req.query;

  const responseObject = {};

  responseObject.users = await searchDb(User, keyword, 'name');
  responseObject.emails = await searchDb(User, keyword, 'email');
  responseObject.teams = await searchDb(Team, keyword, 'name');
  responseObject.stadiums = await searchDb(Team, keyword, 'stadium');
  responseObject.fixtures = await searchDb(Fixture, keyword, 'location');

  return successResponse(
    res,
    200,
    responseDataOrigin.db,
    'Found',
    responseObject,
  );
}
