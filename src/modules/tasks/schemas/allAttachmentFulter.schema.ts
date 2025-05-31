import Joi from "joi";

export const attachmentFilterSchema = Joi.object({
  search: Joi.string()
    .allow('')
    .max(100)
    .optional()
    .messages({
      'string.base': 'El filtro de búsqueda debe ser un texto',
      'string.max': 'El filtro de búsqueda no puede superar los 100 caracteres',
    }),

  pageNumber: Joi.number()
      .min(0)
      .optional()
      .messages({
          'number.base': `El valor de 'pageNumber' debe ser numérico.`,
          'number.min': `El valor de 'pageNumber' debe ser mayor a cero.`,
      }),
});
