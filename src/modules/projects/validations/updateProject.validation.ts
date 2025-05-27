import Joi from "joi";

export const updateProjectSchema = Joi.object({
  projectName: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.base": "El nombre debe ser un texto.",
      "string.empty": "El campo nombre es obligatorio.",
      "string.min": "El nombre debe tener al menos 3 caracteres.",
      "string.max": "El nombre no puede tener más de 255 caracteres.",
    }),

  description: Joi.string()
    .allow('') // permite string vacío
    .min(3)
    .max(255)
    .optional()
    .messages({
      "string.base": "La descripción debe ser un texto.",
      "string.min": "La descripción debe tener al menos 3 caracteres.",
      "string.max": "La descripción no puede tener más de 255 caracteres.",
    }),

  objetive: Joi.string()
    .allow('') // permite string vacío
    .min(3)
    .max(255)
    .optional()
    .messages({
      "string.base": "El objetivo debe ser un texto.",
      "string.min": "El objetivo debe tener al menos 3 caracteres.",
      "string.max": "El objetivo no puede tener más de 255 caracteres.",
    }),

  startDate: Joi.string()
    .pattern(/^\d{2}-\d{2}-\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'La fecha debe estar en formato dd-MM-aaaa.',
      'string.empty': 'El campo fecha de inicio no puede estar vacío.',
      'any.required': 'La fecha de inicio del proyecto es obligatoria.'
    }),

  endDate: Joi.string()
    .pattern(/^\d{2}-\d{2}-\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'La fecha debe estar en formato dd-MM-aaaa.',
      "date.greater": "La fecha de finalización debe ser posterior a la fecha de inicio.",
      'string.empty': 'El campo fecha de finalizacíon no puede estar vacío.',
      "any.required": "La fecha de finalización es obligatoria.",
    })
});
