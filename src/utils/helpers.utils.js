import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import moment from 'moment';

import client from '../db/redis.db';

dotenv.config();

const { SECRET_KEY, NODE_ENV } = process.env;

/**
 *
 * @param {object} res response object
 * @param {number} statusCode
 * @param {string} message
 * @param {array} errors
 * @returns {object} res
 */
export const errorResponse = (res, statusCode, message, errors) =>
  res.status(statusCode).json({
    status: 'error',
    message,
    errors,
  });

/**
 *
 * @param {object} res response object
 * @param {number} statusCode
 *  @param {string} source
 * @param {string} message
 * @param {*} data
 * @returns {object} res
 */
export const successResponse = (
  res,
  statusCode,
  source = 'Original Response',
  message,
  data,
) =>
  res.status(statusCode).json({
    status: 'success',
    source,
    message,
    data,
  });

/**
 *
 * @param {object} res response object
 * @param {number} statusCode
 * @param {string} message
 * @returns {object} res
 */
export const serverError = (res, statusCode = 500) =>
  res.status(statusCode).json({
    status: 'error',
    message:
      NODE_ENV === 'development' || NODE_ENV === 'test'
        ? error.message
        : 'Your request could not be processed at this time. Kindly try again later.',
  });

/**
 *
 *
 * @export
 * @param {string} password
 * @param {number} [salt=10]
 * @returns {string} hash
 */
export async function hashPassword(password, salt = 10) {
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 *
 *
 * @export
 * @param {string} hashedPassword
 * @param {string} password
 * @returns {boolean} true/false
 */
export function comparePassword(hashedPassword, password) {
  return bcrypt.compareSync(password, hashedPassword);
}

/**
 *
 *
 * @export
 * @param {*} payload
 * @param {string} [expiresIn='30days']
 * @returns {string} token
 */
export function generateToken(payload, expiresIn = '30days') {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn });
  return token;
}

/**
 *
 * @param {string} token
 * @returns {object/null} decoded tokens
 */
export const verifyToken = async token => {
  return jwt.verify(token, SECRET_KEY, (err, data) => {
    if (err) {
      return null;
    }
    return data;
  });
};

export const decodeToken = async token => {
  return await jwt.verify(token, SECRET_KEY);
};

/**
 *
 *
 * @param {object} obj
 * @param {array} keys
 * @returns {object} filteredObject
 */
export function pick(obj, keys) {
  return keys
    .map(key => (key in obj ? { [key]: obj[key] } : {}))
    .reduce(
      (finalObject, arrayOfObjects) =>
        Object.assign(finalObject, arrayOfObjects),
      {},
    );
}

/**
 *
 *
 * @param {object} obj
 * @param {array} keys
 * @returns {object} filteredObject
 */
export function excludeProperty(obj, keys) {
  const objJSON = obj.toJSON();
  const filteredKeys = Object.keys(objJSON).filter(key => !keys.includes(key));
  return pick(objJSON, filteredKeys);
}

export const setUsertoRedis = async id => {
  return await client.set(
    id.toString(),
    JSON.stringify({
      count: 1,
      startTime: moment().unix(),
    }),
    'EX',
    360000,
  );
};

/**
 *
 *
 * @export
 * @param {string} resourceName
 * @param {object} resource
 * @returns {void}
 */
export const saveResourceToRedis = async (resourceName, resource) => {
  client.get(resourceName, (error, resourceData) => {
    if (error) {
      return NODE_ENV === 'development'
        ? error.message
        : 'Something went wrong';
    }
    if (resourceData) {
      client.del(resourceName);
      client.setex(resourceName, 3600, JSON.stringify(resource));
    } else {
      client.setex(resourceName, 3600, JSON.stringify(resource));
    }
  });
};
