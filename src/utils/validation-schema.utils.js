import Joi from 'joi';

const stringSchema = Joi.string().trim();
// export const slug = Joi.string().guid();
export const objectIdSchema = Joi.string()
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
  teamId: objectIdSchema,
}).options({ ...options });

export const fixtureSchema = Joi.object()
  .keys({
    home: Joi.string()
      .min(3)
      .required(),
    away: Joi.string()
      .min(3)
      .required(),
    location: Joi.string()
      .min(3)
      .required(),
    time: Joi.date()
      .min('now')
      .required(),
  })
  .options({ ...options });

export const fixtureId = Joi.object({
  fixtureId: objectIdSchema.required(),
}).options({ ...options });

export const keyword = Joi.object()
  .keys({
    keyword: stringSchema.required(),
  })
  .options({ ...options });

export const status = Joi.object()
  .keys({
    status: stringSchema.valid(['pending', 'completed']).required(),
  })
  .options({ ...options });
