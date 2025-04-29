import Joi from 'joi';

export const loginValidation = Joi.object({
   
    email: Joi.string()
        .trim()
        .email()
        .required()
        .messages({
            "string.empty": "El correo electrónico es obligatorio.",
            "string.email": "Debe ser un correo electrónico válido.",
        }),

    password: Joi.string()
        .trim()
        .min(8)
        .max(20)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'))
        .required()
        .messages({
            "string.empty": "La contraseña es obligatoria.",
            "string.min": "La contraseña debe tener al menos 8 caracteres.",
            "string.max": "La contraseña no debe superar los 20 caracteres.",
            "string.pattern.base": "La contraseña debe contener al menos una mayúscula, una minúscula y un número.",
        }),

});
