import Joi from 'joi';

export const recoveryPasswordValidation = Joi.object({
   
    email: Joi.string()
        .trim()
        .email()
        .required()
        .messages({
            "string.empty": "El correo electrónico es obligatorio.",
            "string.email": "Debe ser un correo electrónico válido.",
        }),

});
