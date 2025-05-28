import Joi from 'joi';

export const AllCommentFiltersSchema = Joi.object({
//   search: Joi.string()
//     .trim()
//     .min(3)
//     .messages({
//       'string.min': 'El campo de búsqueda debe tener al menos 3 caracteres.',
//     }),

    

 pageNumber: Joi.number()
    .min(0)
    .optional()
    .messages({
        'number.base': `El valor de 'pageNumber' debe ser numérico.`,
        'number.min': `El valor de 'pageNumber' debe ser mayor a cero.`,
    }),
    
//   type: Joi.number()
//     .valid("Avance", "Consulta","Urgente")
//     .messages({
//       'any.only': 'La prioridad debe ser 1 (Baja), 2 (Media) o 3 (Alta).',
//       'number.base': 'La prioridad debe ser un número.'
//     })

  date: Joi.string()
    .pattern(/^([0][1-9]|[12][0-9]|3[01])-([0][1-9]|1[0-2])-(\d{4})$/)
    .message('La fecha debe tener el formato dd-mm-aaaa y ser válida.')
    .optional()
});


