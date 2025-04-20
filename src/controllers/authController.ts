import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, AuthRequest, ApiResponse } from '../types';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const userData: RegisterRequest = req.body;
      
      // Validação básica do corpo da requisição
      if (!userData || typeof userData !== 'object') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid request body',
        };
        return res.status(400).json(response);
      }

      const user = await authService.register(userData);
      
      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Registration controller error:', error);
      
      let statusCode = 400;
      let errorMessage = 'Registration failed';

      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Ajusta o status code baseado no tipo de erro
        if (error.message === 'Email already registered') {
          statusCode = 409; // Conflict
        } else if (error.message.includes('Missing required fields') || 
                  error.message.includes('Invalid email format') ||
                  error.message.includes('Password must be')) {
          statusCode = 400; // Bad Request
        } else {
          statusCode = 500; // Internal Server Error
        }
      }

      const response: ApiResponse<null> = {
        success: false,
        error: errorMessage,
      };
      
      res.status(statusCode).json(response);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const credentials: AuthRequest = req.body;

      // Validação básica do corpo da requisição
      if (!credentials || typeof credentials !== 'object') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid request body',
        };
        return res.status(400).json(response);
      }

      const { token, user } = await authService.login(credentials);
      
      const response: ApiResponse<{ token: string; user: typeof user }> = {
        success: true,
        data: { token, user },
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Login controller error:', error);
      
      let statusCode = 401;
      let errorMessage = 'Login failed';

      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message === 'Email and password are required') {
          statusCode = 400;
        }
      }

      const response: ApiResponse<null> = {
        success: false,
        error: errorMessage,
      };
      
      res.status(statusCode).json(response);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'No token provided',
        };
        return res.status(401).json(response);
      }

      await authService.logout(token);
      
      const response: ApiResponse<null> = {
        success: true,
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Logout controller error:', error);
      
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
      
      res.status(400).json(response);
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not authenticated',
        };
        return res.status(401).json(response);
      }

      const user = await authService.getUserById(userId);
      
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found',
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Get profile controller error:', error);
      
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile',
      };
      
      res.status(400).json(response);
    }
  }
} 