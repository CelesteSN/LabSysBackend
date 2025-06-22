import Joi from 'joi';

export const AllTaskFiltersSchema = Joi.object({
  search: Joi.string()
    .trim()
    .min(3)
    .messages({
      'string.min': 'El campo de búsqueda debe tener al menos 3 caracteres.',
    }),

    status: Joi.string()
    .valid(
      'Pendiente',
      'En progreso',
      'Dado de baja',
      'Finalizada',
      "Atrasada",
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
    
  priority: Joi.number()
    .valid(0, 1, 2, 3)
    .messages({
      'any.only': 'La prioridad debe ser 0 (Baja), 1 (Media), 2 (Alta) o 3 (urgente).',
      'number.base': 'La prioridad debe ser un número.'
    })
});


