import Joi from 'joi';

export const resetPasswordValidation = Joi.object({
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'El ID de usuario debe ser un UUID válido.',
      'any.required': 'El ID de usuario es obligatorio.'
    }),

  password: Joi.string()
      .trim()
      .min(8)
      .max(20)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      .required()
      .messages({
        "string.empty": "El campo contraseña es requerido.",
        "string.min": "La contraseña debe tener al menos 8 caracteres.",
        "string.max": "La contraseña no debe superar los 20 caracteres.",
        "string.pattern.base": "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un caracter especial.",
      }),
});
