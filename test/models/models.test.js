import mongoose from 'mongoose';
import 'regenerator-runtime/runtime';
import { MongoMemoryServer } from 'mongodb-memory-server';

import User from '../../src/models/user.model';
import Team from '../../src/models/team.model';
import client from '../../src/db/redis.db';
import { mockUser, mockUser2 } from '../mocks/mockUsers';
import { mockTeam, mockTeam2 } from '../mocks/mockTeams';

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let mongoServer;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect(
    mongoUri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    err => {
      if (err) console.error(err);
    },
  );
});

afterAll(async done => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await client.quit();
  done();
});

describe('TEST SUITE FOR USER MODEL', () => {
  it('Database should initially be empty', async () => {
    const userCount = await User.countDocuments();
    expect(userCount).toEqual(0);
  });

  it('Should save a user', async () => {
    const newUser = new User(mockUser);
    const createdUser = await newUser.save();
    const userCount = await User.countDocuments();

    expect(userCount).toEqual(1);
    expect(createdUser.name).toEqual('Johnny');
    expect(createdUser.email).toEqual('johnny@gmail.com');
    expect(createdUser.password).toEqual('password');
    expect(createdUser.admin).toEqual(false);
  });

  it('Should retrieve users from the database', async () => {
    const SecondUser = new User(mockUser2);
    await SecondUser.save();
    const users = await User.find();
    const userCount = await User.countDocuments();
    expect(Array.isArray(users)).toBe(true);
    expect(userCount).toEqual(2);
    expect(typeof users[0]).toBe('object');
    expect(typeof users[1]).toBe('object');
    expect(typeof users[2]).toBe('undefined');
  });

  it('Should update a user in the database', async () => {
    const getUser = await User.find();
    const userId = getUser[0].id;
    await User.updateOne({ _id: userId }, { $set: { name: 'NewJohnny' } });
    const getUpdatedUser = await User.findById(userId);
    expect(getUpdatedUser.name).toEqual('NewJohnny');
    expect(getUpdatedUser.email).toEqual('johnny@gmail.com');
    expect(getUpdatedUser.password).toEqual('password');
  });

  it('Should delete a user from the database', async () => {
    const getUser = await User.find();
    const userId = getUser[0].id;
    await User.deleteOne({ _id: userId });
    const userCount = await User.countDocuments();
    expect(userCount).toEqual(1);
  });
});

describe('TEST SUITE FOR TEAM MODEL', () => {
  let user;
  it('Database should initially be empty', async () => {
    const teamCount = await Team.countDocuments();
    expect(teamCount).toEqual(0);
  });

  it('Should save a team', async () => {
    user = await User.find();
    mockTeam.createdBy = user[0];

    const newTeam = new Team(mockTeam);
    const createdTeam = await newTeam.save();
    const teamCount = await Team.countDocuments();

    expect(teamCount).toEqual(1);
    expect(createdTeam.name).toEqual('Johnny FC');
    expect(createdTeam.stadium).toEqual('San Siro');
    expect(createdTeam).toHaveProperty('createdBy');
  });

  it('Should retrieve teams from the database', async () => {
    mockTeam2.createdBy = user[0];
    const secondTeam = new Team(mockTeam2);
    await secondTeam.save();
    const teams = await Team.find();
    const teamCount = await Team.countDocuments();

    expect(Array.isArray(teams)).toBe(true);
    expect(teamCount).toEqual(2);
    expect(typeof teams[0]).toBe('object');
    expect(typeof teams[1]).toBe('object');
    expect(typeof teams[2]).toBe('undefined');
  });

  it('Should update a team in the database', async () => {
    const teams = await Team.find();
    const teamId = teams[0].id;
    await Team.updateOne(
      { _id: teamId },
      { $set: { stadium: 'Stanford Bridge' } },
    );

    const updatedTeam = await Team.findById(teamId);
    expect(updatedTeam.name).toEqual('Johnny FC');
    expect(updatedTeam.stadium).toEqual('Stanford Bridge');
  });

  it('Should delete a team from the database', async () => {
    const teams = await Team.find();
    const teamId = teams[0].id;
    await Team.deleteOne({ _id: teamId });
    const teamCount = await Team.countDocuments();
    expect(teamCount).toEqual(1);
  });
});
