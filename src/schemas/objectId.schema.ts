import Joi from "joi";
import { Types } from "mongoose";
import errorMessage from "../constants/errorMessage";

export const objectId = Joi.string().custom((value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.message({ custom: errorMessage.INVALID_OBJECTID });
  }
  return value;
}, "ObjectId Validation");
