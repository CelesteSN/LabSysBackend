"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
function validateRequest(schemas) {
    return (req, res, next) => {
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
                req[key] = validatedValue;
            }
        }
        next();
    };
}
