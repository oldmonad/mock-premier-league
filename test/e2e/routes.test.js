import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../src/server';
import client from '../../src/db/redis.db';
import baseUrl from '../utils/constants';
import {
  signUpMock,
  loginMock,
  invalidLoginMock,
  emptySignupNameField,
  invalidSignupEmailInput,
  invalidSignupPasswordInput,
  allSignupFieldsEmpty,
  invalidLoginEmailInput,
  invalidLoginPasswordInput,
  allLoginFieldsEmpty,
  testAdminUser,
  loginTestAdminUser,
  nonAdminUser,
  loginNonAdminUser,
} from '../mocks/mockUsers';

import {
  validTeamData,
  inValidTeamData,
  teamDataWithoutName,
  teamDataWithoutStadium,
  updateValidTeamData,
  newUpdateValidTeamData,
  singleTeamData,
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
} from '../mocks/mockFixtures';

import User from '../../src/models/user.model';
import Team from '../../src/models/team.model';
import Fixture from '../../src/models/fixture.model';

let adminToken;
let normalUserToken;
let teamId;
let fixtureId;
let singleTeamId;

beforeAll(async () => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Fixture.deleteMany({});
  await request(app)
    .post(`${baseUrl}/auth/signup`)
    .send(testAdminUser);

  await User.findOneAndUpdate({ email: testAdminUser.email }, { admin: true });

  const admin = await request(app)
    .post(`${baseUrl}/auth/login`)
    .send(loginTestAdminUser);

  await request(app)
    .post(`${baseUrl}/auth/signup`)
    .send(nonAdminUser);

  const normalUser = await request(app)
    .post(`${baseUrl}/auth/login`)
    .send(loginNonAdminUser);

  normalUserToken = normalUser.body.data.token;
  adminToken = admin.body.data.token;

  const teamToBeUpdated = await request(app)
    .post(`${baseUrl}/team`)
    .set('authorization', `Bearer ${adminToken}`)
    .send(updateValidTeamData);

  const teamToBeFetched = await request(app)
    .post(`${baseUrl}/team`)
    .set('authorization', `Bearer ${adminToken}`)
    .send(singleTeamData);

  singleTeamId = teamToBeFetched.body.data._id;
  teamId = teamToBeUpdated.body.data._id;

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
});

afterAll(async done => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Fixture.deleteMany({});
  await mongoose.connection.close();
  await client.quit();
  done();
});

describe('TEST SUITE FOR USER AUTHENTICATION', () => {
  it('should successfully sign up a user', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/signup`)
      .send(signUpMock);
    expect(res.status).toEqual(201);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual(
      'You have successfully created an account',
    );
    expect(res.body.data.email).toEqual(signUpMock.email);
    expect(res.body.data.name).toEqual(signUpMock.name);
    done();
  });

  it('should not signup a user with the same email', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/signup`)
      .send(signUpMock);
    expect(res.status).toEqual(409);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('This user already exist');
    done();
  });

  it('should validate signup name field', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/signup`)
      .send(emptySignupNameField);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'name is not allowed to be empty',
      'name length must be at least 8 characters long',
    ]);
    expect(Array.isArray(res.body.errors)).toBe(true);
    done();
  });

  it('should validate signup email field', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/signup`)
      .send(invalidSignupEmailInput);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual([
      'email is not allowed to be empty',
      'email must be a valid email',
    ]);
    done();
  });

  it('should validate signup password field', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/signup`)
      .send(invalidSignupPasswordInput);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual([
      'password is not allowed to be empty',
      'password must only contain alpha-numeric characters',
      'password length must be at least 8 characters long',
    ]);
    done();
  });

  it('should validate signup all fields concurrently', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/signup`)
      .send(allSignupFieldsEmpty);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual([
      'name is not allowed to be empty',
      'name length must be at least 8 characters long',
      'email is not allowed to be empty',
      'email must be a valid email',
      'password is not allowed to be empty',
      'password must only contain alpha-numeric characters',
      'password length must be at least 8 characters long',
    ]);
    done();
  });

  it('should successfully sign in a user', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/login`)
      .send(loginMock);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('You have successfully logged in');
    expect(res.body.data.email).toEqual(loginMock.email);
    done();
  });

  it('should not sign in a non-existing user', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/login`)
      .send(invalidLoginMock);
    expect(res.status).toEqual(404);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('The email or password is not correct');
    done();
  });

  it('should validate login email field', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/login`)
      .send(invalidLoginEmailInput);
    expect(res.status).toEqual(422);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'email is not allowed to be empty',
      'email must be a valid email',
    ]);
    done();
  });

  it('should validate login password field', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/login`)
      .send(invalidLoginPasswordInput);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual([
      'password is not allowed to be empty',
      'password must only contain alpha-numeric characters',
    ]);
    done();
  });

  it('should validate signup all fields concurrently', async done => {
    const res = await request(app)
      .post(`${baseUrl}/auth/login`)
      .send(allLoginFieldsEmpty);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toEqual([
      'email is not allowed to be empty',
      'email must be a valid email',
      'password is not allowed to be empty',
      'password must only contain alpha-numeric characters',
    ]);
    done();
  });
});

describe('TEST SUITE FOR TEAMS', () => {
  it('an admin should be able to successfully create a team', async done => {
    const res = await request(app)
      .post(`${baseUrl}/team`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(validTeamData);
    expect(res.status).toEqual(201);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('Team created');
    expect(res.body.data.name).toEqual('Test23 team FC');
    expect(res.body.data.stadium).toEqual('metropolitano');
    expect(res.body.data).toHaveProperty('createdBy');
    done();
  });

  it('a non-admin user should not be able to successfully create a team', async done => {
    const res = await request(app)
      .post(`${baseUrl}/team`)
      .set('authorization', `Bearer ${normalUserToken}`)
      .send(validTeamData);
    expect(res.status).toEqual(401);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual(
      'You are not authorized to make this action',
    );
    done();
  });

  it('an admin should not be able to  successfully create a team without a team name', async done => {
    const res = await request(app)
      .post(`${baseUrl}/team`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(teamDataWithoutName);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'name is not allowed to be empty',
      'name length must be at least 3 characters long',
    ]);
    done();
  });

  it('an admin should not be able to successfully create a team without a team stadium', async done => {
    const res = await request(app)
      .post(`${baseUrl}/team`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(teamDataWithoutStadium);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'stadium is not allowed to be empty',
      'stadium length must be at least 3 characters long',
    ]);
    done();
  });

  it('an admin should not be able to successfully create a team without input data', async done => {
    const res = await request(app)
      .post(`${baseUrl}/team`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(inValidTeamData);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'name is not allowed to be empty',
      'name length must be at least 3 characters long',
      'stadium is not allowed to be empty',
      'stadium length must be at least 3 characters long',
    ]);
    done();
  });

  it('an admin should be able to successfully update a team data', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/team/${teamId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(newUpdateValidTeamData);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('Team updated');
    expect(res.body.data.name).toEqual('Test23  updated');
    expect(res.body.data.stadium).toEqual('metropolitanos new');
    expect(res.body.data).toHaveProperty('createdBy');
    done();
  });

  it('a non-admin user should not be able to successfully update a team data', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/team/${teamId}`)
      .set('authorization', `Bearer ${normalUserToken}`)
      .send(newUpdateValidTeamData);

    expect(res.status).toEqual(401);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual(
      'You are not authorized to make this action',
    );
    done();
  });

  it('an admin should not be able to successfully update a team without a team name', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/team/${teamId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(teamDataWithoutName);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'name is not allowed to be empty',
      'name length must be at least 3 characters long',
    ]);
    done();
  });

  it('an admin should not be able to successfully update a team without a stadium name', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/team/${teamId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(teamDataWithoutStadium);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'stadium is not allowed to be empty',
      'stadium length must be at least 3 characters long',
    ]);
    done();
  });

  it('an admin should not be able to successfully update a team without input data', async done => {
    const res = await request(app)
      .patch(`${baseUrl}/team/${teamId}`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(inValidTeamData);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual([
      'name is not allowed to be empty',
      'name length must be at least 3 characters long',
      'stadium is not allowed to be empty',
      'stadium length must be at least 3 characters long',
    ]);
    done();
  });

  it('an admin should be able to successfully delete team data', async done => {
    const res = await request(app)
      .delete(`${baseUrl}/team/${teamId}`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('Team has been deleted');
    done();
  });

  it('should send a proper response in a case where the team does not exist', async done => {
    const res = await request(app)
      .delete(`${baseUrl}/team/${teamId}`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(404);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('This team does not exist');
    done();
  });

  it('should send a proper response in a case where the teamId is not valid', async done => {
    const res = await request(app)
      .delete(`${baseUrl}/team/5e1766452e68e36d1a7822e`)
      .set('authorization', `Bearer ${adminToken}`)
      .send(inValidTeamData);
    expect(res.status).toEqual(422);
    expect(res.body.status).toEqual('error');
    expect(res.body.message).toEqual('validation error');
    expect(res.body.errors).toEqual(['ID must be a valid mongodb objectId.']);
    done();
  });

  it('a user should be able to successfully view all teams data', async done => {
    const res = await request(app)
      .get(`${baseUrl}/team`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('All Teams');
    expect(Array.isArray(res.body.data)).toBe(true);
    done();
  });

  it('a user should be able to successfully view a team data', async done => {
    const res = await request(app)
      .get(`${baseUrl}/team/${singleTeamId}`)
      .set('authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('Team Found');
    expect(res.body.data.name).toEqual('Test23 to be fetched');
    expect(res.body.data.stadium).toEqual('metropolitanos fetch');
    expect(res.body.data).toHaveProperty('createdBy');
    done();
  });
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
