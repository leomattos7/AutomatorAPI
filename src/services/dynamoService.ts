import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { User, Goal, Session } from '../types';

// Configuração do cliente DynamoDB
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

const docClient = DynamoDBDocumentClient.from(client);

export class DynamoService {
  private static instance: DynamoService;

  private constructor() {}

  public static getInstance(): DynamoService {
    if (!DynamoService.instance) {
      DynamoService.instance = new DynamoService();
    }
    return DynamoService.instance;
  }

  async createUser(user: User): Promise<User> {
    const command = new PutCommand({
      TableName: 'Users',
      Item: user,
    });

    await docClient.send(command);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const command = new GetCommand({
      TableName: 'Users',
      Key: { id },
    });

    const result = await docClient.send(command);
    return result.Item as User || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    });

    const result = await docClient.send(command);
    return result.Items?.[0] as User || null;
  }

  async createGoal(goal: Goal): Promise<Goal> {
    const command = new PutCommand({
      TableName: 'Goals',
      Item: goal,
    });

    await docClient.send(command);
    return goal;
  }

  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    const command = new QueryCommand({
      TableName: 'Goals',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    const result = await docClient.send(command);
    return result.Items as Goal[] || [];
  }

  async createSession(session: Session): Promise<Session> {
    const command = new PutCommand({
      TableName: 'Sessions',
      Item: session,
    });

    await docClient.send(command);
    return session;
  }

  async deleteSession(token: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: 'Sessions',
      Key: { token },
    });

    await docClient.send(command);
  }
} 