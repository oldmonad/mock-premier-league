import { login, signup } from './auth.controller';
import {
  createTeam,
  updateTeam,
  deleteTeam,
  getTeam,
  getTeams,
} from './team.controller';

import {
  createFixture,
  updateFixture,
  deleteFixture,
  getFixturesByStatus,
  getSingleFixture,
  getAllFixtures,
} from './fixture.controller';

export default {
  login,
  signup,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeam,
  getTeams,
  createFixture,
  updateFixture,
  deleteFixture,
  getFixturesByStatus,
  getSingleFixture,
  getAllFixtures,
};
