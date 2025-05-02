import Joi from 'joi';

export const loginValidation = Joi.object({
   
    email: Joi.string()
        .trim()
        .email()
        .required()
        .messages({
            "string.empty": "El campo email es requerido.",
            "string.email": "Debe ser un correo electrónico válido.",
        }),

    // password: Joi.string()
    //     .trim()
    //     .min(8)
    //     .max(20)
    //     .pattern(new RegExp( /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+$/))
    //     .required()
    //     .messages({
    //         "string.empty": "El campo password es requerido.",
    //         "string.min": "La contraseña debe tener al menos 8 caracteres.",
    //         "string.max": "La contraseña no debe superar los 32 caracteres.",
    //         "string.pattern.base": "La contraseña debe contener al menos una mayúscula, una minúscula y un número.",
    //     }),
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
