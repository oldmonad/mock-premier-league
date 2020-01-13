import crypto from 'crypto';
import slug from 'slug';

import Fixture from '../models/fixture.model';
// import User from '../models/user.model';
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
 * Create A Fixture
 * @param {object} req
 * @param {object} res
 * @returns {object} fixture object
 */
export async function createFixture(req, res) {
  const { time, home, away, location } = req.body;
  const user = excludeProperty(req.user, ['password', '__v']);

  const homeTeam = await Team.findOne({ name: home });
  const awayTeam = await Team.findOne({ name: away });

  if (!homeTeam || !awayTeam) {
    return errorResponse(
      res,
      400,
      'One or both of the teams does not exist',
      null,
    );
  }

  const fixture = new Fixture({
    time,
    homeTeam,
    awayTeam,
    location,
    slug: slug(
      `${home}-${away}-${crypto.randomBytes(12).toString('base64')}`,
    ).toLowerCase(),
    createdBy: user,
  });

  const newFeature = await fixture.save();

  const fixtureData = excludeProperty(newFeature, ['__v']);
  const allFixtures = await Fixture.find({}, { __v: 0 });
  await saveResourceToRedis('fixtures', allFixtures);

  return successResponse(
    res,
    201,
    responseDataOrigin.db,
    'Fixture created',
    fixtureData,
  );
}

/**
 * Update A Fixture
 * @param {object} req
 * @param {object} res
 * @returns {object} fixture object
 */
export async function updateFixture(req, res) {
  const { fixtureId } = req.params;
  const { time, home, away, location } = req.body;
  const user = excludeProperty(req.user, ['password', '__v']);

  const homeTeam = await Team.findOne({ name: home });
  const awayTeam = await Team.findOne({ name: away });

  if (!homeTeam || !awayTeam) {
    return errorResponse(
      res,
      400,
      'One or both of the teams does not exist',
      null,
    );
  }

  const fixture = await Fixture.findOne({ _id: fixtureId });

  if (!fixture) {
    return errorResponse(res, 404, 'This fixture does not exist', null);
  }

  if (fixture.createdBy._id.toString() != user._id.toString()) {
    return errorResponse(
      res,
      404,
      'You can not update a fixture you did not create',
      null,
    );
  }

  const updatedFixture = await Fixture.findByIdAndUpdate(
    { _id: fixture._id },
    { time, homeTeam, awayTeam, location },
    { new: true },
  );

  const updatedFixtureData = excludeProperty(updatedFixture, ['__v']);
  const allFixtures = await Fixture.find({}, { __v: 0 });
  await saveResourceToRedis('fixtures', allFixtures);

  return successResponse(
    res,
    200,
    responseDataOrigin.db,
    'Fixture updated',
    updatedFixtureData,
  );
}

/**
 * Delete A Fixture
 * @param {object} req
 * @param {object} res
 * @returns {object} response object
 */
export async function deleteFixture(req, res) {
  const { fixtureId } = req.params;
  const user = excludeProperty(req.user, ['password', '__v']);
  const fixture = await Fixture.findOne({ _id: fixtureId });

  if (!fixture) {
    return errorResponse(res, 404, 'This fixture does not exist', null);
  }

  if (fixture.createdBy._id.toString() != user._id.toString()) {
    return errorResponse(
      res,
      404,
      'You can not delete a team you did not create',
      null,
    );
  }

  await Fixture.findByIdAndDelete({ _id: fixture._id });
  const allFixtures = await Fixture.find({}, { __v: 0 });
  await saveResourceToRedis('fixtures', allFixtures);

  return successResponse(
    res,
    200,
    responseDataOrigin.server,
    'Fixture has been deleted',
    null,
  );
}

/**
 * Get Fixtures by status
 * @param {object} req
 * @param {object} res
 * @returns {object} fixture array
 */
export async function getFixturesByStatus(req, res) {
  const { status } = req.query;

  client.get('fixtures', async (error, cachedFixtures) => {
    if (error) {
      return errorResponse(res, 400, 'Something went wrong', null);
    }

    if (cachedFixtures) {
      const cachedFixturesData = JSON.parse(cachedFixtures);

      if (cachedFixturesData.length === 0) {
        const dbFixtures = await Fixture.find({ status });

        if (dbFixtures.length === 0) {
          const allFixturesInDb = await Fixture.find({}, { __v: 0 });
          await saveResourceToRedis('fixtures', allFixturesInDb);
          return successResponse(
            res,
            200,
            responseDataOrigin.db,
            'Nothing here',
            dbFixtures,
          );
        }

        const allFixturesInDb = await Fixture.find({}, { __v: 0 });
        await saveResourceToRedis('fixtures', allFixturesInDb);

        return successResponse(
          res,
          200,
          responseDataOrigin.db,
          'Fixtures Found',
          dbFixtures,
        );
      }

      const foundFixtures = cachedFixturesData.filter(fixture => {
        return fixture.status === status;
      });

      if (foundFixtures.length === 0) {
        return successResponse(
          res,
          200,
          responseDataOrigin.cache,
          'Nothing here',
          foundFixtures,
        );
      }

      return successResponse(
        res,
        200,
        responseDataOrigin.cache,
        'Fixtures Found',
        foundFixtures,
      );
    } else {
      const dbFixtures = await Fixture.find({ status });
      if (dbFixtures.length === 0) {
        const allFixturesInDb = await Fixture.find({}, { __v: 0 });
        await saveResourceToRedis('fixtures', allFixturesInDb);
        return successResponse(
          res,
          200,
          responseDataOrigin.db,
          'Nothing here',
          dbFixtures,
        );
      }

      const allFixturesInDb = await Fixture.find({}, { __v: 0 });
      await saveResourceToRedis('fixtures', allFixturesInDb);

      return successResponse(
        res,
        200,
        responseDataOrigin.db,
        'Fixtures Found',
        dbFixtures,
      );
    }
  });
}

/**
 * Get A Single Fixture
 * @param {object} req
 * @param {object} res
 * @returns {object} fixture object
 */
export async function getSingleFixture(req, res) {
  const { fixtureId } = req.params;

  client.get('fixtures', async (error, fixtures) => {
    if (error) {
      return errorResponse(res, 400, 'Something went wrong', null);
    }

    if (fixtures) {
      const fixturesData = JSON.parse(fixtures);

      if (fixturesData.length === 0) {
        const fixture = await Fixture.findOne({ _id: fixtureId });
        if (!fixture) {
          const allFixtures = await Fixture.find({}, { __v: 0 });
          await saveResourceToRedis('fixtures', allFixtures);
          return errorResponse(res, 404, 'This Fixture does not exist');
        }
        const allFixtures = await Fixture.find({}, { __v: 0 });
        await saveResourceToRedis('fixtures', allFixtures);

        return successResponse(
          res,
          200,
          responseDataOrigin.db,
          'Fixture Found',
          fixture,
        );
      }

      const foundFixture = fixturesData.find(fixture => {
        return fixture._id === fixtureId;
      });

      if (!foundFixture) {
        return errorResponse(res, 404, 'This fixture does not exist', null);
      }

      return successResponse(
        res,
        200,
        responseDataOrigin.cache,
        'Fixture Found',
        foundFixture,
      );
    } else {
      const fixture = await Fixture.findOne({ _id: fixtureId });
      if (!fixture) {
        const allFixtures = await Fixture.find({}, { __v: 0 });
        await saveResourceToRedis('fixtures', allFixtures);
        return errorResponse(res, 404, 'This fixture does not exist');
      }

      const allFixtures = await Fixture.find({}, { __v: 0 });
      await saveResourceToRedis('fixtures', allFixtures);

      return successResponse(
        res,
        200,
        responseDataOrigin.db,
        'Fixture Found',
        fixture,
      );
    }
  });
}

/**
 * Get All Fixtures
 * @param {object} req
 * @param {object} res
 * @returns {object} fixture array
 */
export async function getAllFixtures(req, res) {
  client.get('fixtures', async (error, fixtures) => {
    if (error) {
      return errorResponse(res, 400, 'Something went wrong');
    }

    if (fixtures) {
      const fixturesData = JSON.parse(fixtures);
      if (fixturesData.length === 0) {
        const allFixtures = await Fixture.find({}, { __v: 0 });
        if (allFixtures.length === 0) {
          return successResponse(
            res,
            200,
            responseDataOrigin.db,
            'Nothing here',
            fixturesData,
          );
        }
        if (allFixtures) {
          await saveResourceToRedis('fixtures', allFixtures);
          return successResponse(
            res,
            200,
            responseDataOrigin.cache,
            'All fixtures',
            teamsData,
          );
        }
        return successResponse(
          res,
          200,
          responseDataOrigin.cache,
          'Nothing here',
          fixturesData,
        );
      }
      return successResponse(
        res,
        200,
        responseDataOrigin.cache,
        'All Fixtures',
        fixturesData,
      );
    } else {
      const allFixtures = await Fixture.find({}, { __v: 0 });
      if (allFixtures.length === 0) {
        return errorResponse(res, 404, 'Nothing here', null);
      }
      await saveResourceToRedis('fixtures', allFixtures);
      return successResponse(
        res,
        200,
        responseDataOrigin.db,
        'All Fixtures',
        allFixtures,
      );
    }
  });
}
