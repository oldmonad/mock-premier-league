import mongoose from 'mongoose';
import 'regenerator-runtime/runtime';
import { MongoMemoryServer } from 'mongodb-memory-server';

import User from '../../src/models/user.model';
import Team from '../../src/models/team.model';
import Fixture from '../../src/models/fixture.model';
import client from '../../src/db/redis.db';
import { mockUser, mockUser2 } from '../mocks/mockUsers';
import {
  mockTeam,
  mockTeam2,
  testTeamForFixture1,
  testTeamForFixture2,
  testTeamForFixture3,
} from '../mocks/mockTeams';

import { mockFixture, mockFixture2 } from '../mocks/mockFixtures';

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
  client.quit();
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

describe('TEST SUITE FOR TEAM MODEL', () => {
  let user;
  it('Database should initially be empty', async () => {
    const fixtureCount = await Fixture.countDocuments();
    expect(fixtureCount).toEqual(0);
  });

  it('Should save a fixture', async () => {
    user = await User.find();
    testTeamForFixture1.createdBy = user[0];
    testTeamForFixture2.createdBy = user[0];
    const fixtureTeam1 = new Team(testTeamForFixture1);
    const fixtureTeam2 = new Team(testTeamForFixture2);

    const homeTeam = await fixtureTeam1.save();
    const awayTeam = await fixtureTeam2.save();

    mockFixture.createdBy = user[0];
    mockFixture.homeTeam = homeTeam;
    mockFixture.awayTeam = awayTeam;

    const newFixture = new Fixture(mockFixture);
    const createdFixture = await newFixture.save();

    const fixtureCount = await Fixture.countDocuments();
    expect(fixtureCount).toEqual(1);
    expect(createdFixture.location).toEqual('Test san siro');
    expect(createdFixture.status).toEqual('pending');
    expect(typeof createdFixture.homeTeam).toBe('object');
    expect(typeof createdFixture.awayTeam).toBe('object');
    expect(typeof createdFixture.createdBy).toBe('object');
    expect(createdFixture.homeTeam.name).toEqual('Fixture1 FC');
    expect(createdFixture.homeTeam.stadium).toEqual('Fixture1 Siro');
    expect(createdFixture.awayTeam.name).toEqual('Fixture2 FC');
    expect(createdFixture.awayTeam.stadium).toEqual('Fixture2 Siro');
  });

  it('Should retrieve fixtures from the database', async () => {
    testTeamForFixture3.createdBy = user[0];
    const fixtureTeam3 = new Team(testTeamForFixture3);

    const homeTeam = await fixtureTeam3.save();
    const awayTeam = await Team.findOne({ name: 'Fixture1 FC' });

    mockFixture2.createdBy = user[0];
    mockFixture2.homeTeam = homeTeam;
    mockFixture2.awayTeam = awayTeam;

    const newFixture = new Fixture(mockFixture2);
    await newFixture.save();

    const fixtures = await Fixture.find();
    const fixtureCount = await Fixture.countDocuments();

    expect(Array.isArray(fixtures)).toBe(true);
    expect(fixtureCount).toEqual(2);
    expect(typeof fixtures[0]).toBe('object');
    expect(typeof fixtures[1]).toBe('object');
    expect(typeof fixtures[2]).toBe('undefined');
  });

  it('Should update a fixture', async () => {
    const team = await Team.findOne({ name: 'Fixture2 FC' });

    await Fixture.updateOne(
      { slug: 'fixture1-fc-fixture3-fc-hlfbzk7jp9uzhvlj' },
      { $set: { awayTeam: team } },
    );

    const updatedFixture = await Fixture.findOne({
      slug: 'fixture1-fc-fixture3-fc-hlfbzk7jp9uzhvlj',
    });

    expect(updatedFixture.awayTeam).toEqual(team.toJSON());
  });

  it('Should delete a team from the database', async () => {
    await Fixture.deleteOne({
      slug: 'fixture1-fc-fixture3-fc-hlfbzk7jp9uzhvlj',
    });
    const fixtureCount = await Fixture.countDocuments();
    expect(fixtureCount).toEqual(1);
  });
});
