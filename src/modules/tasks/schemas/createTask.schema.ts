import Joi from 'joi';

export const createTaskSchema = Joi.object({
  stageId: Joi.string()
    .uuid()
    .required()
    .messages({
      'any.required': 'El campo etapa es obligatorio.',
      'string.guid': 'El ID de la etapa no es válido.',
      'string.empty': 'El campo etapa no puede estar vacío.',

    }),

  // userId: Joi.string()
  //   .uuid()
  //   .required()
  //   .messages({
  //     'any.required': 'El campo responsable es obligatorio.',
  //     'string.guid': 'El ID del responsable no es válido.',
  //     'string.empty': 'El campo responsable no puede estar vacío.',

  //   }),

  taskName: Joi.string()
    .min(3)
    .max(90)
    .required()
    //.pattern(/^[a-zA-Z0-9 _-]+$/, 'letras, números, espacios, guiones')
    .messages({
      //'string.pattern.name': 'La tarea solo puede contener letras, números, espacios, guiones medios y guiones bajos.',
      'string.empty': 'El campo nombre no puede estar vacío.',
      'any.required': 'El campo orden es obligatorio.',
      'string.min': 'El nombre debe tener al menos 3 caracteres.',
      'string.max': 'El nombre debe tener como máximo 90 caracteres.'
    }),

  // taskOrder: Joi.number()
  //   .integer()
  //   .min(1)
  //   .required()
  //   .messages({
  //     'string.empty': 'El campo orden no puede estar vacío.',
  //     'any.required': 'El campo orden es obligatorio.',
  //     'number.base': 'El orden debe ser un número entero.',
  //     'number.min': 'El orden debe ser mayor a 0.',
  //     'number.integer': 'El orden debe ser un número entero sin decimales.'
  //   }),

  taskDescription: Joi.string()
  .allow('')
  .optional()
  .min(3)
  .max(255)
  .messages({
    'string.min': 'La descripción debe tener al menos 3 caracteres.',
    'string.max': 'La descripción debe tener como máximo 255 caracteres.'
  }),


  taskPriority: Joi.number()
    .valid(0, 1, 2, 3)
    .messages({
      'any.only': 'La prioridad debe ser 0 (baja), 1 (media), 2 (alta) o 3 (urgente).',
      'any.required': 'La prioridad es obligatoria.'
    }),

    taskStartDate: Joi.string()
      .pattern(/^\d{2}-\d{2}-\d{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'La fecha debe estar en formato dd-MM-aaaa.',
        'any.required': 'La fecha de inicio del proyecto es obligatoria.',
        'string.empty': 'El campo fecha de inicio no puede estar vacío.',
      }),
  
  taskEndDate: Joi.string()
     .pattern(/^\d{2}-\d{2}-\d{4}$/)
      .required()
    .messages({
      'string.pattern.base': 'La fecha debe estar en formato dd-MM-aaaa.',
      'string.empty': 'El campo fecha de finalización no puede estar vacío.',
       "date.greater": "La fecha de finalización debe ser posterior a la fecha de inicio.",
        "any.required": "La fecha de finalización es obligatoria.",
    })
});
