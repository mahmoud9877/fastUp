import Joi from "joi";
import { Types } from "mongoose";

// Custom validator for MongoDB ObjectId
const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? value
    : helper.message("Invalid ObjectId");
};

// General field definitions using Joi
export const generalFields = {
  nationalId: Joi.string().length(14).required().messages({
    "string.length": "National ID must be exactly 14 characters.",
  }),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, including uppercase, lowercase, and numbers.",
    }),
  phone: Joi.string()
    .pattern(/^\d{10,15}$/) // Allow phone numbers between 10-15 digits
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10-15 digits.",
    }),

  cPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords must match",
  }),
  id: Joi.string().custom(validateObjectId).required().messages({
    "any.custom": "Invalid ObjectId format",
  }),
};

// Middleware for validating input data against a Joi schema
export const validation = (schema) => {
  return (req, res, next) => {
    let inputsData = { ...req.body, ...req.params, ...req.query };
    const validationResult = schema.validate(inputsData, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (validationResult.error) {
      return res.status(400).json({
        message: "Validation Error",
        validationErrors: validationResult.error.details.map(
          (err) => err.message
        ),
      });
    }

    return next();
  };
};
