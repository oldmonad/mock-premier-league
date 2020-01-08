import dotenv from 'dotenv';

import User from '../models/user.model';
import Team from '../models/team.model';
import client from '../db/redis.db';
import { excludeProperty } from '../utils/helpers.utils';

dotenv.config();

const { HASHED_ADMIN_PASSWORD, HASHED_NON_ADMIN_PASSWORD } = process.env;

const seedData = async () => {
  await User.deleteMany({});
  await Team.deleteMany({});
  await client.flushdb();
  const user1 = new User({
    name: 'Admin user',
    email: 'admin@admin.com',
    password: HASHED_ADMIN_PASSWORD,
  });

  const user2 = new User({
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
    name: 'Seed FC',
    stadium: 'Db stadium',
    createdBy: seededUser,
  });

  const team2 = new Team({
    name: 'Seed1 FC',
    stadium: 'Db1 stadium',
    createdBy: seededUser,
  });

  const team3 = new Team({
    name: 'Seed2 FC',
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
};

export default seedData;
