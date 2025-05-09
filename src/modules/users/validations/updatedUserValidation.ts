
import Joi from 'joi';

export const updatedUserValidation = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .required()
    .messages({
      "string.empty": "El campo nombre es requerido.",
      "string.min": "El nombre debe tener al menos 3 caracteres.",
      "string.max": "El nombre no debe tener más de 30 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras y espacios.",
    }),

  lastName: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .required()
    .messages({
      "string.empty": "El campo apellido es requerido.",
      "string.min": "El apellido debe tener al menos 3 caracteres.",
      "string.max": "El apellido no debe tener más de 30 caracteres.",
      "string.pattern.base": "El apellido solo puede contener letras y espacios.",
    }),

  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      "string.empty": "El campo correo electrónico es requerido.",
      "string.email": "Debe ser un correo electrónico válido.",
    }),

//   password: Joi.string()
//     .trim()
//     .min(8)
//     .max(20)
//     .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
//     .required()
//     .messages({
//       "string.empty": "El campo contraseña es requerido.",
//       "string.min": "La contraseña debe tener al menos 8 caracteres.",
//       "string.max": "La contraseña no debe superar los 20 caracteres.",
//       "string.pattern.base": "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un caracter especial.",
//     }),

    phoneNumber: Joi.string()
    .pattern(/^\+\d{8,30}$/)
    .allow('')
    .optional()
    .messages({
      "string.pattern.base": "El número de teléfono debe comenzar con '+' y tener entre 8 y 30 dígitos.",
    }),

  dni: Joi.string()
    .pattern(/^\d+$/)
    .min(7)
    .max(10)
    .required()
    .messages({
      "string.empty": "El campo DNI es requerido.",
      "string.min": "El DNI debe tener al menos 7 caracteres.",
      "string.max": "El DNI no debe superar los 10 caracteres.",
      "string.pattern.base": "El DNI debe contener solo números.",
    }),

  personalFile: Joi.string()
    .min(3)
    .max(10)
    .pattern(/^[A-Za-z0-9]+$/)
    .required()
    .messages({
      "string.empty": "El campo Legajo es requerido.",
      "string.min": "El Legajo debe tener al menos 3 caracteres.",
      "string.max": "El Legajo no debe superar los 10 caracteres.",
      "string.pattern.base": "El Legajo debe contener solo letras y números.",
    }),

});
