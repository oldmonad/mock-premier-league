import Joi from 'joi';

const stringSchema = Joi.string().trim();
export const uuidSchema = Joi.string()
  .regex(/^[a-fA-F0-9]{24}$/)
  .required()
  .error(() => {
    return {
      message: 'ID must be a valid mongodb objectId.',
    };
  });

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

export const teamSchema = Joi.object()
  .keys({
    name: Joi.string()
      .min(3)
      .required(),
    stadium: Joi.string()
      .min(3)
      .required(),
  })
  .options({ ...options });

export const teamId = Joi.object({
  teamId: uuidSchema,
}).options({ ...options });
