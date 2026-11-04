import { apiError } from '../utils/apiResponse.js';

/**
 * Validate incoming request data against a Zod schema
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return apiError(res, {
        statusCode: 400,
        message: 'Validation failed',
        errors: formattedErrors
      });
    }

    // Replace with parsed/sanitized data
    req[source] = result.data;
    next();
  };
};

export default validate;
