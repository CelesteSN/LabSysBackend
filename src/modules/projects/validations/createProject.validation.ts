import Joi from "joi";

export const projectValidationSchema = Joi.object({
  projectName: Joi.string()
    .trim()
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.empty": "El nombre del proyecto es obligatorio.",
      "string.min": "El nombre del proyecto debe tener al menos 3 caracteres.",
      "string.max": "El nombre del proyecto no puede superar los 255 caracteres."
    }),

  projectTypeId: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required()
    .messages({
      "string.guid": "El tipo de proyecto debe ser un UUID válido.",
      "any.required": "El tipo de proyecto es obligatorio.",
     "string.empty": "El tipo de proyecto es obligatorio.",

    }),
     startDate: Joi.string()
    .pattern(/^\d{2}-\d{2}-\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'La fecha debe estar en formato dd-MM-aaaa.',
      'any.required': 'La fecha de inicio del proyecto es obligatoria.',
      'string.empty': 'El campo fecha de inicio no puede estar vacío.',
    }),

endDate: Joi.string()
   .pattern(/^\d{2}-\d{2}-\d{4}$/)
    .required()
  .messages({
    'string.pattern.base': 'La fecha debe estar en formato dd-MM-aaaa.',
    'string.empty': 'El campo fecha de finalización no puede estar vacío.',
     "date.greater": "La fecha de finalización debe ser posterior a la fecha de inicio.",
      "any.required": "La fecha de finalización es obligatoria.",
  })
});
