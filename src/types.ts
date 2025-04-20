export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface Goal {
  userId: string;
  goalId: string;
  title: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  token: string;
  deviceId: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 