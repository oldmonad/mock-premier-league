import { connect, connection } from 'mongoose';
import dotenv from 'dotenv';
import { bold } from 'chalk';

dotenv.config();

const connected = bold.cyan;
const error = bold.yellow;
const disconnected = bold.red;
const termination = bold.magenta;

const { MONGODB_URI, MONGO_URI_TEST, NODE_ENV } = process.env;

const dbUrl = NODE_ENV === 'test' ? MONGO_URI_TEST : MONGODB_URI;

connection.on('connected', async () => {
  await console.log(
    connected('Mongoose default connection is open to ', MONGODB_URI),
  );
});

connection.on('error', async err => {
  await console.log(
    error('Mongoose default connection has occured ' + err + ' error'),
  );
});

connection.on('disconnected', async () => {
  await console.log(
    disconnected('Mongoose default connection is disconnected'),
  );
});

process.on('SIGINT', async () => {
  await connection.close(() => {
    console.log(
      termination(
        'Mongoose default connection is disconnected due to application termination',
      ),
    );
    process.exit(0);
  });
});

const dbconnect = async () =>
  await connect(dbUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

export default dbconnect;
