import Joi from "joi";

export const updateProjectSchema = Joi.object({
  projectName: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.base": "El nombre debe ser un texto.",
      "string.empty": "El nombre es obligatorio.",
      "string.min": "El nombre debe tener al menos 3 caracteres.",
      "string.max": "El nombre no puede tener más de 255 caracteres.",
    }),

  description: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.base": "La descripción debe ser un texto.",
      "string.empty": "La descripción es obligatoria.",
      "string.min": "La descripción debe tener al menos 3 caracteres.",
      "string.max": "La descripción no puede tener más de 255 caracteres.",
    }),

  objetive: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.base": "El objetivo debe ser un texto.",
      "string.empty": "El objetivo es obligatorio.",
      "string.min": "El objetivo debe tener al menos 3 caracteres.",
      "string.max": "El objetivo no puede tener más de 255 caracteres.",
    }),

//   fechaInicio: Joi.date()
//     .required()
//     .messages({
//       "date.base": "La fecha de inicio debe ser una fecha válida.",
//       "any.required": "La fecha de inicio es obligatoria.",
//     }),

//   fechaFin: Joi.date()
//     .greater(Joi.ref("fechaInicio"))
//     .required()
//     .messages({
//       "date.base": "La fecha de finalización debe ser una fecha válida.",
//       "date.greater": "La fecha de finalización debe ser posterior a la fecha de inicio.",
//       "any.required": "La fecha de finalización es obligatoria.",
//     }),
});
