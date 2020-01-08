import redis from 'redis';
import dotenv from 'dotenv';
import { bold } from 'chalk';

dotenv.config();

const { NODE_ENV, REDIS_URL } = process.env;

const client =
  NODE_ENV === 'development' || NODE_ENV === 'test'
    ? redis.createClient()
    : redis.createClient(REDIS_URL);

const conected = bold.cyan;
const errorMessage = bold.red;

client.on('connect', () => {
  console.log(conected('Redis client connected'));
});

process.on('exit', function() {
  client.quit();
});

client.on('error', error => {
  console.log(errorMessage(`Something went wrong ${error}`));
});

export default client;
