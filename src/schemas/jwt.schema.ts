import Joi from "joi";
import errorMessage from "../constants/errorMessage";
import { ExpUnit } from "../interfaces/jwt.interface";

const validUnits = Object.values(ExpUnit).flatMap((unit) => [
  unit,
  unit.toUpperCase(),
  unit.toLowerCase(),
]);

/**
 * Jwt Expiration schema
 */
export const expirationSchema = Joi.alternatives().try(
  // Case 1: Numeric string only
  Joi.string().pattern(/^\d+$/).messages({
    "string.pattern.base": errorMessage.MUST_BE_NUMERIC_STRING,
  }),

  // Case 2: Number followed directly by a unit (no space)
  Joi.string()
    .custom((value, helpers) => {
      const numericPart = value.match(/^\d+/)?.[0];
      const unitPart = value.replace(numericPart || "", "");
      if (numericPart && validUnits.includes(unitPart)) return value;
      return helpers.error("any.invalid");
    })
    .messages({
      "any.invalid": errorMessage.INVALID_EXPIRATION_STRING,
    }),

  // Case 3: Number followed by a space and a unit
  Joi.string()
    .custom((value, helpers) => {
      const [numericPart, unitPart] = value.split(" ");
      if (/^\d+$/.test(numericPart) && validUnits.includes(unitPart))
        return value;
      return helpers.error("any.invalid");
    })
    .messages({
      "any.invalid": errorMessage.INVALID_EXPIRATION_STRING,
    })
);
