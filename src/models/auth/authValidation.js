import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createAdmin = joi
  .object({
    nationalId: generalFields.nationalId,
    phone: generalFields.phone,
    password: generalFields.password,
    cPassword: generalFields.cPassword,
  })
  .required();

export const token = joi
  .object({
    token: generalFields.phone,
  })
  .required();

export const login = joi
  .object({
    phone: generalFields.phone,
    password: generalFields.password,
  })
  .required();

export const changePassword = joi.object({
  oldPassword: generalFields.password.required(),
  newPassword: generalFields.password.required(),
});

export const forgetPassword = joi.object({
  phone: generalFields.phone,
  password: generalFields.password,
  cPassword: generalFields.cPassword,
  code: joi
    .string()
    .pattern(new RegExp(/^\d{4}$/))
    .required(),
});
