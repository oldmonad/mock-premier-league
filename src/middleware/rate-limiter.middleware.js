import dotenv from 'dotenv';
import moment from 'moment';
import { errorResponse } from '../utils/helpers.utils';

dotenv.config();
const { CALL_RATE_WINDOW, MAXIMUM_RATE } = process.env;

import client from '../db/redis.db';

export const rateLimiter = async (req, res, next) => {
  const { id } = req.user;

  client.exists(id, (error, data) => {
    if (error) {
      console.log('There is something wrong with redis...');
    }

    if (data === 1) {
      client.get(id, (err, responseData) => {
        const parsedData = JSON.parse(responseData);
        const currentTime = moment().unix();

        const difference = (currentTime - parsedData.startTime) / 60;

        if (difference >= CALL_RATE_WINDOW) {
          const rateData = {
            count: 1,
            startTime: moment().unix(),
          };
          client.set(id, JSON.stringify(rateData), 'EX', 3600);
          return next();
        }

        if (difference < CALL_RATE_WINDOW) {
          if (parsedData.count >= MAXIMUM_RATE) {
            return errorResponse(
              res,
              429,
              'API Request limit exceeded. Please try again later',
              null,
            );
          }

          parsedData.count += 1;
          client.set(id, JSON.stringify(parsedData), 'EX', 3600);
          return next();
        }
      });
    } else {
      return errorResponse(
        res,
        404,
        'Your session has expires, please login',
        null,
      );
    }
  });
};

export default client;
