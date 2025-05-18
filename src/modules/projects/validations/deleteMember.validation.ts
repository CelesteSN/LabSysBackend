import Joi from 'joi';

export const deleteMemberSchema = Joi.object({
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'any.required': 'El campo userId es obligatorio.',
      'string.base': 'userId debe ser una cadena.',
      'string.uuid': 'userId debe ser un UUID válido.',
      'string.empty': 'Debe seleccionar a al menos un usuario.',
    })
});
