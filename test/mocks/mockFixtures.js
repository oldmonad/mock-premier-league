export const mockFixture = {
  time: '2020-12-11T06:01:17.171Z',
  location: 'Test san siro',
  slug: 'fixture1-fc-fixture2-fc-hlerzk4jp7wzhvlj',
};

export const mockFixture2 = {
  time: '2020-12-12T06:01:17.171Z',
  location: 'Test san siro2',
  slug: 'fixture1-fc-fixture3-fc-hlfbzk7jp9uzhvlj',
};

export const mockCreateFixtureRoute1 = {
  home: 'Fixture Route1 FC',
  away: 'Fixture Route2 FC',
  location: 'Metropolitano Fixture route',
  time: '2020-12-13T06:01:17.171Z',
};

export const mockUpdateFixtureRoute2 = {
  home: 'Fixture Route1 FC',
  away: 'Fixture Route3 FC',
  location: 'Metropolitano Fixture route update',
  time: '2020-12-13T06:01:17.171Z',
};

export const fixtureWithoutHomeTeam = {
  home: '',
  away: 'Fixture Route3 FC',
  location: 'Metropolitano Fixture route update',
  time: '2020-12-13T06:01:17.171Z',
};

export const fixtureWithoutAwayTeam = {
  home: 'Fixture Route1 FC',
  away: '',
  location: 'Metropolitano Fixture route update',
  time: '2020-12-13T06:01:17.171Z',
};

export const fixtureWithoutLocation = {
  home: 'Fixture Route1 FC',
  away: 'Fixture Route3 FC',
  location: '',
  time: '2020-12-13T06:01:17.171Z',
};

export const fixtureWithoutDate = {
  home: 'Fixture Route1 FC',
  away: 'Fixture Route3 FC',
  location: 'Metropolitano Fixture route update',
  time: '',
};

export const pastDate = {
  home: 'Fixture Route1 FC',
  away: 'Fixture Route3 FC',
  location: 'Metropolitano Fixture route update',
  time: '2010-12-13T06:01:17.171Z',
};
