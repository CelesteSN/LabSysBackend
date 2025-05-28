import Joi from 'joi';

export const createCommentSchema = Joi.object({
  taskId: Joi.string()
    .uuid()
    .required()
    .messages({
      'any.required': 'El campo tarea es obligatorio.',
      'string.guid': 'El ID de la tarea no es válido.',
      'string.empty': 'El campo tarea no puede estar vacío.',

    }),

  // userId: Joi.string()
  //   .uuid()
  //   .required()
  //   .messages({
  //     'any.required': 'El campo responsable es obligatorio.',
  //     'string.guid': 'El ID del responsable no es válido.',
  //     'string.empty': 'El campo responsable no puede estar vacío.',

  //   }),

  commentDetail: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.empty': 'El campo comentario no puede estar vacío.',
      'any.required': 'El campo comentario es obligatorio.',
      'string.min': 'El comentario debe tener al menos 3 caracteres.',
      'string.max': 'El comentario debe tener como máximo 255 caracteres.'
    }),

    commentTypeId: Joi.string()
     .uuid()
    .required()
    .messages({
      'any.required': 'El campo tipo de comentario es obligatorio.',
      'string.guid': 'El tipo de comentario no es válido.',
      'string.empty': 'El campo tipo de comentario no puede estar vacío.'
    }),

  
});
