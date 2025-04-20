import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DynamoService } from './dynamoService';
import { User, AuthRequest, RegisterRequest, JWTPayload, Session } from '../types';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export class AuthService {
  private dynamoService: DynamoService;

  constructor() {
    this.dynamoService = DynamoService.getInstance();
  }

  async register(userData: RegisterRequest): Promise<User> {
    try {
      // Validação básica dos dados
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Missing required fields');
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Validação de senha
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const existingUser = await this.dynamoService.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const user: User = {
        id: uuidv4(),
        email: userData.email,
        passwordHash,
        name: userData.name,
        createdAt: new Date().toISOString(),
      };

      return this.dynamoService.createUser(user);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to register user');
    }
  }

  async login(credentials: AuthRequest): Promise<{ token: string; user: User }> {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const user = await this.dynamoService.getUserByEmail(credentials.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      // Create session
      const session: Session = {
        userId: user.id,
        token,
        deviceId: uuidv4(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      await this.dynamoService.createSession(session);

      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to login');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await this.dynamoService.deleteSession(token);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  }

  verifyToken(token: string): JWTPayload {
    try {
      if (!JWT_SECRET) {
        throw new Error('JWT secret is not configured');
      }
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('Token verification error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw new Error('Failed to verify token');
    }
  }
} 