import Joi from 'joi';

export const searchValidation = Joi.object({
  search: Joi.string()
    .trim()
    .min(3)
    .messages({
      'string.min': 'El campo de búsqueda debe tener al menos 3 caracteres.',
    }),

  fromDate: Joi.date()
    .iso()
    .messages({
      'date.base': 'La fecha desde debe ser una fecha válida.',
      'date.format': 'La fecha desde debe estar en formato ISO (YYYY-MM-DD).'
    }),

  toDate: Joi.date()
    .iso()
    .min(Joi.ref('fromDate'))
    .messages({
      'date.base': 'La fecha hasta debe ser una fecha válida.',
      'date.min': 'La fecha hasta no puede ser anterior a la fecha desde.',
      'date.format': 'La fecha hasta debe estar en formato ISO (YYYY-MM-DD).'
    }),
    status: Joi.string()
    .valid(
      'Activo',
      'Pendiente',
      'Bloqueado',
      'Dado de baja',
      'Inactivo',
      'Rechazado',
      'Todos'
    )
    .messages({
      'any.only': 'El estado ingresado no es válido.'
    }),

  role: Joi.string()
  .valid(
    'Pasante',
    'Becario',
  )
    .messages({
      'string.base': 'El rol debe ser un texto válido.'
    }),
 pageNumber: Joi.number()
    .min(0)
    .optional()
    .messages({
        'number.base': `El valor de 'pageNumber' debe ser numérico.`,
        'number.min': `El valor de 'pageNumber' debe ser mayor a cero.`,
    }),

});
