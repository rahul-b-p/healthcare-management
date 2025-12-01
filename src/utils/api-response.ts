/**
 * Generates a standardized API response object.
 *
 * @param {string} message - Message describing the response.
 * @param {any} data - Optional array containing response data.
 * @returns Standardized API response object.
 */
export const apiResponse = (
  message: string,
  data?: any
): {
  message: string;
  success: true;
  data?: any;
} => {
  return {
    success: true,
    message,
    data,
  };
};
