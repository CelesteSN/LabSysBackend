import Joi from 'joi';
import { ResponseUserEnum } from './../enums/responseUser.enum';

export const responseUserValidate = Joi.object({
  response: Joi.string()
    .valid(ResponseUserEnum.ACCEPTED, ResponseUserEnum.REJECTED)
    .required()
    .messages({
      'any.only': 'El campo "response" debe ser "Accepted" o "Rejected".',
      'any.required': 'El campo "response" es obligatorio.'
    }),

  comment: Joi.string()
    .max(255)
    .allow(null, '')
    .messages({
      'string.max': 'El comentario no puede tener más de 255 caracteres.'
    })
});
