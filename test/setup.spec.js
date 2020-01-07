import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import app from '../src/server';
import baseUrl from './utils/constants';

dotenv.config();

describe('TEST SUITE FOR TEST ENVIROMENT', () => {
  afterAll(async done => {
    await mongoose.connection.close();
    done();
  });

  it('should successfully return test data', async done => {
    const res = await request(app)
      .post(`${baseUrl}/test-setup/setup`)
      .send({ test: 'test input' });
    expect(res.status).toEqual(201);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toEqual('setup complete');
    expect(res.body.data.test).toEqual('test input');
    done();
  });
});
