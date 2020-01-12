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
  validTeamData,
  inValidTeamData,
  teamDataWithoutName,
  teamDataWithoutStadium,
  updateValidTeamData,
  newUpdateValidTeamData,
  singleTeamData,
} from '../mocks/mockTeams';

import User from '../../src/models/user.model';
import Team from '../../src/models/team.model';
import Fixture from '../../src/models/fixture.model';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let adminToken;
let secondAdminToken;
let normalUserToken;
let teamId;
let singleTeamId;

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

  const secondAdmin = await request(app)
    .post(`${baseUrl}/auth/login`)
    .send(secondTestAdminUser);

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
