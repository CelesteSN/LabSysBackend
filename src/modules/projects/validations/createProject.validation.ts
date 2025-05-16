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
      "any.required": "El tipo de proyecto es obligatorio."
    }),
});
