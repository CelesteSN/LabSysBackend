import Joi from 'joi';

export const stageSchema = Joi.object({
  stageName: Joi.string()
    .min(3)
    .max(90)
    //.pattern(/^[a-zA-Z0-9 _-]+$/, 'letras, números, espacios, guiones')
    .required()
    .messages({
      'string.base': 'El nombre debe ser un texto.',
      'string.empty': 'El campo nombre no puede estar vacío.',
      'string.min': 'El nombre debe tener al menos 3 caracteres.',
      'string.max': 'El nombre no debe superar los 90 caracteres.',
      //'string.pattern.name': 'El nombre solo puede contener letras, números, espacios, guiones medios y guiones bajos.',
      'any.required': 'El campo nombre es obligatorio.'
    }),
});


  // stageOrder: Joi.number()
  //   .integer()
  //   .min(1)
  //   .required()
  //   .messages({
  //     'number.base': 'El orden debe ser un número positivo mayor a 0.',
  //     'number.integer': 'El orden debe ser un número entero.',
  //     'number.min': 'El orden debe ser mayor a 0.',
  //     'any.required': 'El campo orden es obligatorio.'
  //   })

