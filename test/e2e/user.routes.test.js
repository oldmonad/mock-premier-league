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
} from '../mocks/mockUsers';

import User from '../../src/models/user.model';
import Team from '../../src/models/team.model';
import Fixture from '../../src/models/fixture.model';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

beforeAll(async done => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Fixture.deleteMany({});
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
