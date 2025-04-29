// middlewares/validateRequest.ts
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

type ValidationSchemas = {
    body?: Schema;
    query?: Schema;
    params?: Schema;
    headers?: Schema;
};

export function validateRequest(schemas: ValidationSchemas) {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationOptions = {
            abortEarly: false, // Mostrar todos los errores
            allowUnknown: true, // Permitir campos no validados (por ejemplo en headers)
            stripUnknown: true, // Eliminar automáticamente los campos desconocidos
        };

        const validations = [
            { key: "body", value: req.body, schema: schemas.body },
            { key: "query", value: req.query, schema: schemas.query },
            { key: "params", value: req.params, schema: schemas.params },
            { key: "headers", value: req.headers, schema: schemas.headers }
        ];

        for (const { key, value, schema } of validations) {
            if (schema) {
                const { error, value: validatedValue } = schema.validate(value, validationOptions);
                if (error) {
                    const errores = error.details.map(d => ({
                        campo: d.path.join('.'),
                        mensaje: d.message,
                    }));
                    return res.status(400).json({
                        mensaje: `Error de validación en ${key}`,
                        errores,
                    });
                }
                // Si la validación fue exitosa, asignamos el valor "limpio"
                (req as any)[key] = validatedValue;
            }
        }

        next();
    };
}
