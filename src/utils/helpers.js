/**
 *
 * @param {object} res response object
 * @param {number} statusCode
 * @param {string} message
 * @returns {object} res
 */
export const errorResponse = (res, statusCode, message) =>
  res.status(statusCode).json({
    status: 'error',
    message,
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
