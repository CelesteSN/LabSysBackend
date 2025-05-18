import Joi from 'joi';

export const addMembersSchema = Joi.object({
  userIds: Joi.array()
    .items(Joi.string().uuid().required())
    .min(1)
    .required()
    .messages({
      'any.required': 'El campo userIds es obligatorio.',
      'array.base': 'userIds debe ser un arreglo.',
      'array.min': 'Debe seleccionar al menos un userId.',
      'string.uuid': 'Cada userId debe ser un UUID válido.'
    })
});
