import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../types';

const authService = new AuthService();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'No token provided',
      };
      return res.status(401).json(response);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid token format',
      };
      return res.status(401).json(response);
    }

    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid token',
    };
    return res.status(401).json(response);
  }
}; 