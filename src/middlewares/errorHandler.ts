// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/baseErrors';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err); // Podés dejar el console para logs internos, no afecta el response

    if (err.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: {
            message: err.message
          }
        });
      }
    
    
    
    if (err instanceof BaseError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message
            }
        });
    }
    if(err.name === "ForbiddenAccessError"){
        return res.status(404).json({
            success: false,
            error: {
                message: err.message
            }
        });
    }

    if(err.name === "UserNotFoundError"){
        return res.status(404).json({
            success: false,
            error: {
                message: err.message
            }
        });
    }


    if(err.name === "StatusNotFoundError"){
        return res.status(404).json({
            success: false,
            error: {
                message: err.message
            }
        });
    }

    if(err.name === "UserAlreadyDeletedError"){
        return res.status(404).json({
            success: false,
            error: {
                message: err.message
            }
        });
    }

    if(err.name === "RoleNotFoundError"){
        return res.status(404).json({
            success: false,
            error: {
                message: err.message
            }
        });
    }
    
    // Otros errores inesperados
    return res.status(500).json({
        success: false,
        error: {
            message: 'Error interno del servidor'
        }
    });
}




