import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { SECRET_KEY } = process.env;

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
 * @param {string} message
 * @param {*} data
 * @returns {object} res
 */
export const successResponse = (res, statusCode, message, data) =>
  res.status(statusCode).json({
    status: 'success',
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
      'Your request could not be processed at this time. Kindly try again later.',
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
  const filteredKeys = Object.keys(obj).filter(key => !keys.includes(key));
  return pick(obj, filteredKeys);
}
