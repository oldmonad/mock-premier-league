import Joi from 'joi';

const stringSchema = Joi.string().trim();
// const numberSchema = Joi.number();
export const uuidSchema = Joi.string().guid();

const email = stringSchema
  .email({
    minDomainAtoms: 2,
  })
  .required();

const options = {
  stripUnknown: true,
  convert: true,
};

export const signupSchema = Joi.object()
  .keys({
    name: Joi.string()
      .min(8)
      .required(),
    email,
    password: Joi.string()
      .alphanum()
      .min(8)
      .required(),
  })
  .options({ ...options });

export const loginSchema = Joi.object()
  .keys({
    email,
    password: stringSchema.alphanum().required(),
  })
  .options({ ...options });
