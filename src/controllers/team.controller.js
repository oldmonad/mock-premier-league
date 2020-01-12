import Team from '../models/team.model';
import {
  successResponse,
  excludeProperty,
  saveResourceToRedis,
  errorResponse,
} from '../utils/helpers.utils';
import client from '../db/redis.db';
import { responseDataOrigin } from '../utils/constants';

/**
 * Create A Team
 * @param {object} req
 * @param {object} res
 * @returns {object} team object
 */
export async function createTeam(req, res) {
  const { name, stadium } = req.body;

  const user = excludeProperty(req.user, ['password', '__v']);

  const team = new Team({
    name,
    stadium,
    createdBy: user,
  });

  const newTeam = await team.save();

  const teamData = excludeProperty(newTeam, ['__v']);
  const allTeams = await Team.find({}, { __v: 0 });
  await saveResourceToRedis('teams', allTeams);

  return successResponse(
    res,
    201,
    responseDataOrigin.db,
    'Team created',
    teamData,
  );
}

/**
 * Update A Team
 * @param {object} req
 * @param {object} res
 * @returns {object} team object
 */
export async function updateTeam(req, res) {
  const { name, stadium } = req.body;
  const { teamId } = req.params;

  const user = excludeProperty(req.user, ['password', '__v']);

  const team = await Team.findOne({ _id: teamId });

  if (!team) {
    return errorResponse(res, 404, 'This team does not exist', null);
  }

  if (team.createdBy._id.toString() != user._id.toString()) {
    return errorResponse(
      res,
      404,
      'You can not update a team you did not create',
      null,
    );
  }

  const updatedTeam = await Team.findByIdAndUpdate(
    { _id: teamId },
    { name, stadium },
    { new: true },
  );

  const updatedTeamData = excludeProperty(updatedTeam, ['__v']);
  const allTeams = await Team.find({}, { __v: 0 });
  await saveResourceToRedis('teams', allTeams);

  return successResponse(
    res,
    200,
    responseDataOrigin.db,
    'Team updated',
    updatedTeamData,
  );
}

/**
 * Delete A Team
 * @param {object} req
 * @param {object} res
 * @returns {object} response object
 */
export async function deleteTeam(req, res) {
  const { teamId } = req.params;
  const user = excludeProperty(req.user, ['password', '__v']);
  const team = await Team.findOne({ _id: teamId });

  if (!team) {
    return errorResponse(res, 404, 'This team does not exist', null);
  }

  if (team.createdBy._id.toString() != user._id.toString()) {
    return errorResponse(
      res,
      404,
      'You can not delete a team you did not create',
      null,
    );
  }

  await Team.findByIdAndDelete({ _id: teamId });
  const allTeams = await Team.find({}, { __v: 0 });
  await saveResourceToRedis('teams', allTeams);

  return successResponse(
    res,
    200,
    responseDataOrigin.server,
    'Team has been deleted',
    null,
  );
}

/**
 * Get A Team
 * @param {object} req
 * @param {object} res
 * @returns {object} team object
 */
export async function getTeam(req, res) {
  const { teamId } = req.params;

  client.get('teams', async (error, teams) => {
    if (error) {
      return errorResponse(res, 400, 'Something went wrong', null);
    }

    if (teams) {
      const teamsData = JSON.parse(teams);

      if (teamsData.length === 0) {
        const team = await Team.findOne({ _id: teamId });
        if (!team) {
          const allTeams = await Team.find({}, { __v: 0 });
          await saveResourceToRedis('teams', allTeams);
          return errorResponse(res, 404, 'This team does not exist');
        }
        const allTeams = await Team.find({}, { __v: 0 });
        await saveResourceToRedis('teams', allTeams);

        return successResponse(
          res,
          200,
          responseDataOrigin.db,
          'Team Found',
          team,
        );
      }

      const foundTeam = teamsData.find(team => {
        return team._id === teamId;
      });

      if (!foundTeam) {
        return errorResponse(res, 404, 'This team does not exist', null);
      }

      return successResponse(
        res,
        200,
        responseDataOrigin.cache,
        'Team Found',
        foundTeam,
      );
    } else {
      const team = await Team.findOne({ _id: teamId });
      if (!team) {
        const allTeams = await Team.find({}, { __v: 0 });
        await saveResourceToRedis('teams', allTeams);
        return errorResponse(res, 404, 'This team does not exist');
      }

      const allTeams = await Team.find({}, { __v: 0 });
      await saveResourceToRedis('teams', allTeams);

      return successResponse(
        res,
        200,
        responseDataOrigin.db,
        'Team Found',
        team,
      );
    }
  });
}

/**
 * Get all Teams
 * @param {object} req
 * @param {object} res
 * @returns {object} team array
 */
export async function getTeams(req, res) {
  client.get('teams', async (error, teams) => {
    if (error) {
      return errorResponse(res, 400, 'Something went wrong');
    }

    if (teams) {
      const teamsData = JSON.parse(teams);
      if (teamsData.length === 0) {
        const allTeams = await Team.find({}, { __v: 0 });
        if (allTeams.length === 0) {
          return successResponse(
            res,
            200,
            responseDataOrigin.db,
            'Nothing here',
            teamsData,
          );
        }
        if (allTeams) {
          await saveResourceToRedis('teams', allTeams);
          return successResponse(
            res,
            200,
            responseDataOrigin.cache,
            'Nothing here',
            teamsData,
          );
        }
        return successResponse(
          res,
          200,
          responseDataOrigin.cache,
          'Nothing here',
          teamsData,
        );
      }
      return successResponse(
        res,
        200,
        responseDataOrigin.cache,
        'All Teams',
        teamsData,
      );
    } else {
      const allTeams = await Team.find({}, { __v: 0 });
      if (allTeams.length === 0) {
        return errorResponse(res, 404, 'Nothing here', null);
      }
      await saveResourceToRedis('teams', allTeams);
      return successResponse(
        res,
        200,
        responseDataOrigin.db,
        'All Teams',
        allTeams,
      );
    }
  });
}
