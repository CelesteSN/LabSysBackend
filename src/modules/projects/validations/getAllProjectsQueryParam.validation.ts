import Joi from 'joi';

export const searchValidation = Joi.object({
  search: Joi.string()
    .trim()
    .min(3)
    .messages({
      'string.min': 'El campo de búsqueda debe tener al menos 3 caracteres.',
    }),

    status: Joi.string()
    .valid(
      'Activo',
      'En progreso',
      'Dado de baja',
      'Finalizado',
      'Todos'
    )
    .messages({
      'any.only': 'El estado ingresado no es válido.'
    }),

 pageNumber: Joi.number()
    .min(0)
    .optional()
    .messages({
        'number.base': `El valor de 'pageNumber' debe ser numérico.`,
        'number.min': `El valor de 'pageNumber' debe ser mayor a cero.`,
    }),

});
