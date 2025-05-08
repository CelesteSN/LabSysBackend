import Joi from 'joi';

export const recoveryPasswordValidation = Joi.object({
   
    email: Joi.string()
        .trim()
        .email()
        .required()
        .messages({
            "string.empty": "El correo electrónico es obligatorio.",
            "string.email": "El formato del correo electrónico no es válido. Ingrese un correo electrónico válido.",
        }),

});
