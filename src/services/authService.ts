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
  }

  async login(credentials: AuthRequest): Promise<{ token: string; user: User }> {
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
      deviceId: uuidv4(), // In a real app, this would come from the client
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    await this.dynamoService.createSession(session);

    return { token, user };
  }

  async logout(token: string): Promise<void> {
    await this.dynamoService.deleteSession(token);
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 