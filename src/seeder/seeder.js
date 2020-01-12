import dotenv from 'dotenv';
import crypto from 'crypto';
import slug from 'slug';

import User from '../models/user.model';
import Team from '../models/team.model';
import Fixture from '../models/fixture.model';
// import client from '../db/redis.db';
import { excludeProperty } from '../utils/helpers.utils';

dotenv.config();

const { HASHED_ADMIN_PASSWORD, HASHED_NON_ADMIN_PASSWORD } = process.env;

const seedData = async () => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Fixture.deleteMany({});
  // await client.flushdb();
  const user1 = new User({
    _id: '5e1863eeb0eb0406250967ba',
    name: 'Admin user',
    email: 'admin@admin.com',
    password: HASHED_ADMIN_PASSWORD,
  });

  const user2 = new User({
    _id: '5e1863eeb0eb0406250967bb',
    name: 'Non-admin User',
    email: 'nonadmin@nonadmin.com',
    password: HASHED_NON_ADMIN_PASSWORD,
  });

  await user1.save();
  await user2.save();
  await User.findOneAndUpdate({ email: 'admin@admin.com' }, { admin: true });
  const user = await User.findOne({ email: 'admin@admin.com' });

  const seededUser = excludeProperty(user, ['password', '__v']);

  const team1 = new Team({
    name: 'Seed1 FC',
    stadium: 'Db stadium',
    createdBy: seededUser,
  });

  const team2 = new Team({
    name: 'Seed2 FC',
    stadium: 'Db1 stadium',
    createdBy: seededUser,
  });

  const team3 = new Team({
    name: 'Seed3 FC',
    stadium: 'Db2 stadium',
    createdBy: seededUser,
  });

  const team4 = new Team({
    name: 'Seed4 FC',
    stadium: 'Db4 stadium',
    createdBy: seededUser,
  });

  await team1.save();
  await team2.save();
  await team3.save();
  await team4.save();

  const getTeam1 = await Team.findOne({ name: 'Seed1 FC' });
  const getTeam2 = await Team.findOne({ name: 'Seed2 FC' });
  const getTeam3 = await Team.findOne({ name: 'Seed3 FC' });
  const getTeam4 = await Team.findOne({ name: 'Seed4 FC' });

  const fixture1 = new Fixture({
    time: '2020-12-11T06:01:17.171Z',
    homeTeam: getTeam1,
    awayTeam: getTeam2,
    status: 'completed',
    location: 'First san siro',
    slug: slug(
      `seed1-fc-seed2-FC-${crypto.randomBytes(12).toString('base64')}`,
    ).toLowerCase(),
    createdBy: user,
  });

  const fixture2 = new Fixture({
    time: '2020-12-12T06:01:17.171Z',
    homeTeam: getTeam1,
    awayTeam: getTeam3,
    location: 'Second san siro',
    slug: slug(
      `seed1-fc-seed3-FC-${crypto.randomBytes(12).toString('base64')}`,
    ).toLowerCase(),
    createdBy: user,
  });

  const fixture3 = new Fixture({
    time: '2020-12-12T06:01:17.171Z',
    homeTeam: getTeam1,
    awayTeam: getTeam4,
    status: 'completed',
    location: 'Third san siro',
    slug: slug(
      `seed1-fc-seed4-FC-${crypto.randomBytes(12).toString('base64')}`,
    ).toLowerCase(),
    createdBy: user,
  });

  const fixture4 = new Fixture({
    time: '2020-12-12T06:01:17.171Z',
    homeTeam: getTeam2,
    awayTeam: getTeam3,
    location: 'Fourth san siro',
    slug: slug(
      `seed2-fc-seed3-FC-${crypto.randomBytes(12).toString('base64')}`,
    ).toLowerCase(),
    createdBy: user,
  });

  const fixture5 = new Fixture({
    time: '2020-12-12T06:01:17.171Z',
    homeTeam: getTeam2,
    awayTeam: getTeam4,
    location: 'Fifth san siro',
    slug: slug(
      `seed2-fc-seed4-FC-${crypto.randomBytes(12).toString('base64')}`,
    ).toLowerCase(),
    createdBy: user,
  });

  const fixture6 = new Fixture({
    time: '2020-12-12T06:01:17.171Z',
    homeTeam: getTeam3,
    awayTeam: getTeam4,
    status: 'completed',
    location: 'Sixth san siro',
    slug: slug(
      `seed3-fc-seed4-FC-${crypto.randomBytes(12).toString('base64')}`,
    ).toLowerCase(),
    createdBy: user,
  });

  await fixture1.save();
  await fixture2.save();
  await fixture3.save();
  await fixture4.save();
  await fixture5.save();
  await fixture6.save();
};

export default seedData;
