import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, AuthRequest, ApiResponse } from '../types';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const userData: RegisterRequest = req.body;
      const user = await authService.register(userData);
      
      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };
      
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
      res.status(400).json(response);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const credentials: AuthRequest = req.body;
      const { token, user } = await authService.login(credentials);
      
      const response: ApiResponse<{ token: string; user: typeof user }> = {
        success: true,
        data: { token, user },
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
      res.status(401).json(response);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await authService.logout(token);
      }
      
      const response: ApiResponse<null> = {
        success: true,
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
      res.status(400).json(response);
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = await authService.getUserById(req.user.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile',
      };
      res.status(400).json(response);
    }
  }
} 