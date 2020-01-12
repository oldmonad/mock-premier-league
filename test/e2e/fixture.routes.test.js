import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../src/server';
import client from '../../src/db/redis.db';
import baseUrl from '../utils/constants';
import { generateToken } from '../../src/utils/helpers.utils';

import {
  testAdminUser,
  loginTestAdminUser,
  nonAdminUser,
  loginNonAdminUser,
  secondTestAdminUser,
} from '../mocks/mockUsers';

import {
  testTeamForFixtureRoute1,
  testTeamForFixtureRoute2,
  testTeamForFixtureRoute3,
} from '../mocks/mockTeams';

import {
  mockCreateFixtureRoute1,
  mockUpdateFixtureRoute2,
  fixtureWithoutAwayTeam,
  fixtureWithoutHomeTeam,
  fixtureWithoutDate,
  pastDate,
  fixtureWithoutLocation,
  mockCreateFixtureWithInvalidTeam,
} from '../mocks/mockFixtures';

import User from '../../src/models/user.model';
import Team from '../../src/models/team.model';
import Fixture from '../../src/models/fixture.model';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let adminToken;
let secondAdminToken;
let normalUserToken;
let fixtureId;

beforeAll(async done => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Fixture.deleteMany({});

  await request(app)
    .post(`${baseUrl}/auth/signup`)
    .send(testAdminUser);

  await request(app)
    .post(`${baseUrl}/auth/signup`)
    .send(secondTestAdminUser);

  await request(app)
    .post(`${baseUrl}/auth/signup`)
    .send(nonAdminUser);

  await User.findOneAndUpdate({ email: testAdminUser.email }, { admin: true });
  await User.findOneAndUpdate(
    { email: secondTestAdminUser.email },
    { admin: true },
  );

  const adminData = await User.findOne({ email: loginTestAdminUser.email });

  const secondAdminData = await User.findOne({
    email: secondTestAdminUser.email,
  });

  const normalUserData = await User.findOne({ email: loginNonAdminUser.email });

  adminToken = await generateToken({
    sub: adminData.email,
    admin: adminData.admin,
  });

  secondAdminToken = await generateToken({
    sub: secondAdminData.email,
    admin: secondAdminData.admin,
  });

  normalUserToken = await generateToken({
    sub: normalUserData.email,
    admin: normalUserData.admin,
  });

  await request(app)
    .post(`${baseUrl}/auth/login`)
    .send(loginTestAdminUser);

  await request(app)
    .post(`${baseUrl}/team`)
    .set('authorization', `Bearer ${adminToken}`)
    .send(testTeamForFixtureRoute1);

  await request(app)
    .post(`${baseUrl}/team`)
    .set('authorization', `Bearer ${adminToken}`)
    .send(testTeamForFixtureRoute2);

  await request(app)
    .post(`${baseUrl}/team`)
    .set('authorization', `Bearer ${adminToken}`)
    .send(testTeamForFixtureRoute3);

  done();
});

afterAll(async done => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Fixture.deleteMany({});
  await mongoose.connection.close();
  await client.flushall();
  await client.disconnect();
  done();
});

describe('TEST SUITE FOR FIXTURES', () => {
  it('an admin should be able to successfully create a fixture', async done => {
    const res = await request(app)
      .post(`${baseUrl}/fixture`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(mockCreateFixtureRoute1);
    fixtureId = res.body.data._id;

    expect(res.status).toEqual(201);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('Fixture created');
    expect(res.body.data.homeTeam.name).toEqual('Fixture Route1 FC');
    expect(res.body.data.homeTeam.stadium).toEqual('Fixture1 Route1 Siro');
    expect(res.body.data.awayTeam.name).toEqual('Fixture Route2 FC');
    expect(res.body.data.awayTeam.stadium).toEqual('Fixture Route2 Siro');
    expect(res.body.data.location).toEqual('Metropolitano Fixture route');
    expect(typeof res.body.data.homeTeam).toBe('object');
    expect(typeof res.body.data.awayTeam).toBe('object');
    expect(res.body.data).toHaveProperty('slug');
    done();
  });
  it('an admin should not be able to successfully create a fixture with a non-existent team', async done => {
    const res = await request(app)
      .post(`${baseUrl}/fixture`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(mockCreateFixtureWithInvalidTeam);
    expect(res.status).toEqual(400);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('One or both of the teams does not exist');
    done();
  });
  it('a non-admin user should not be able to successfully create a fixture', async done => {
    const res = await request(app)
      .post(`${baseUrl}/fixture`)
      .set('authorization', `Bearer ${normalUserToken}`)
      .send(mockCreateFixtureRoute1);
    expect(res.status).toEqual(401);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual(
      'You are not authorized to make this action',
    );
    done();
  });
  it('an admin should not be able to  successfully create a team without a home team', async done => {
    const res = await request(app)
      .post(`${baseUrl}/fixture`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(fixtureWithoutHomeTeam);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'home is not allowed to be empty',
      'home length must be at least 3 characters long',
    ]);
    done();
  });
  it('an admin should not be able to  successfully create a team without an away team', async done => {
    const res = await request(app)
      .post(`${baseUrl}/fixture`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(fixtureWithoutAwayTeam);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'away is not allowed to be empty',
      'away length must be at least 3 characters long',
    ]);
    done();
  });
  it('an admin should not be able to  successfully create a team without a location', async done => {
    const res = await request(app)
      .post(`${baseUrl}/fixture`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(fixtureWithoutLocation);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'location is not allowed to be empty',
      'location length must be at least 3 characters long',
    ]);
    done();
  });
  it('an admin should not be able to  successfully create a team without a date', async done => {
    const res = await request(app)
      .post(`${baseUrl}/fixture`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(fixtureWithoutDate);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'time must be a number of milliseconds or valid date string',
    ]);
    done();
  });
  it('an admin should not be able to  successfully create a team with a date set in the past', async done => {
    const res = await request(app)
      .post(`${baseUrl}/fixture`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(pastDate);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    done();
  });
  it('a user should be able to successfully retrieve fixture data', async done => {
    const res = await request(app)
      .get(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('Fixture Found');
    expect(res.body.data.homeTeam.name).toEqual('Fixture Route1 FC');
    expect(res.body.data.homeTeam.stadium).toEqual('Fixture1 Route1 Siro');
    expect(res.body.data.awayTeam.name).toEqual('Fixture Route2 FC');
    expect(res.body.data.awayTeam.stadium).toEqual('Fixture Route2 Siro');
    expect(res.body.data.location).toEqual('Metropolitano Fixture route');
    expect(typeof res.body.data.homeTeam).toBe('object');
    expect(typeof res.body.data.awayTeam).toBe('object');
    expect(res.body.data).toHaveProperty('slug');
    done();
  });
  it('a user should not be able to  successfully retrieve a team with an invalid Id parameter', async done => {
    const res = await request(app)
      .delete(`${baseUrl}/fixture/5e1aa98a737d9bf52fa67c`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual(['ID must be a valid mongodb objectId.']);
    done();
  });
  it('a user should be able to successfully retrieve all fixture data', async done => {
    const res = await request(app)
      .get(`${baseUrl}/fixture`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('All Fixtures');
    expect(Array.isArray(res.body.data)).toBe(true);
    done();
  });
  it('an admin should be able to successfully update a fixture ', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(mockUpdateFixtureRoute2);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('Fixture updated');
    expect(res.body.data.homeTeam.name).toEqual('Fixture Route1 FC');
    expect(res.body.data.homeTeam.stadium).toEqual('Fixture1 Route1 Siro');
    expect(res.body.data.awayTeam.name).toEqual('Fixture Route3 FC');
    expect(res.body.data.awayTeam.stadium).toEqual('Fixture Route3 Siro');
    expect(res.body.data.location).toEqual(
      'Metropolitano Fixture route update',
    );
    expect(typeof res.body.data.homeTeam).toBe('object');
    expect(typeof res.body.data.awayTeam).toBe('object');
    expect(res.body.data).toHaveProperty('slug');
    done();
    done();
  });
  it('an admin should not be able to successfully update a fixture with a non-existent team', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(mockCreateFixtureWithInvalidTeam);
    expect(res.status).toEqual(400);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('One or both of the teams does not exist');
    done();
  });
  it('an admin should not be able to successfully update a  non-existent fixture', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/fixture/5e1b8db1b55e9718bb29a7a0`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(mockUpdateFixtureRoute2);
    expect(res.status).toEqual(404);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('This fixture does not exist');
    done();
  });
  it('only the creator of a resource should be able to update it', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${secondAdminToken}`)
      .send(mockUpdateFixtureRoute2);

    expect(res.status).toEqual(404);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual(
      'You can not update a fixture you did not create',
    );
    done();
  });
  it('an admin should not be able to  successfully update a team without a home team', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(fixtureWithoutHomeTeam);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'home is not allowed to be empty',
      'home length must be at least 3 characters long',
    ]);
    done();
  });
  it('an admin should not be able to  successfully update a team without an away team', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(fixtureWithoutAwayTeam);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'away is not allowed to be empty',
      'away length must be at least 3 characters long',
    ]);
    done();
  });
  it('an admin should not be able to  successfully update a team without a location', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(fixtureWithoutLocation);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'location is not allowed to be empty',
      'location length must be at least 3 characters long',
    ]);
    done();
  });
  it('an admin should not be able to  successfully update a team without a date', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(fixtureWithoutDate);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'time must be a number of milliseconds or valid date string',
    ]);
    done();
  });
  it('an admin should not be able to  successfully update a team with a date set in the past', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(pastDate);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    done();
  });
  it('an admin should not be able to  successfully update a team with an invalid Id parameter', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/fixture/5e1aa98a737d9bf52fa67c`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(pastDate);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual(['ID must be a valid mongodb objectId.']);
    done();
  });
  it('an admin should not be able to successfully delete a  non-existent fixture', async done => {
    const res = await request(app)
      .delete(`${baseUrl}/fixture/5e1b8db1b55e9718bb29a7a0`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(mockUpdateFixtureRoute2);
    expect(res.status).toEqual(404);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('This fixture does not exist');
    done();
  });
  it('only the creator of a resource should be able to delete it', async done => {
    const res = await request(app)
      .delete(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${secondAdminToken}`)
      .send(mockUpdateFixtureRoute2);
    expect(res.status).toEqual(404);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual(
      'You can not delete a team you did not create',
    );
    done();
  });
  it('an admin should be able to successfully delete fixture data', async done => {
    const res = await request(app)
      .delete(`${baseUrl}/fixture/${fixtureId}`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('Fixture has been deleted');
    done();
  });
  it('an admin should not be able to  successfully delete a team with an invalid Id parameter', async done => {
    const res = await request(app)
      .delete(`${baseUrl}/fixture/5e1aa98a737d9bf52fa67c`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual(['ID must be a valid mongodb objectId.']);
    done();
  });
});
