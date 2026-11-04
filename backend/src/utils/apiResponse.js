/**
 * Standardized API response formatters
 */

export const apiSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null }) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta })
  });
};

export const apiError = (res, { statusCode = 500, message = 'Internal Server Error', errors = null }) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};
