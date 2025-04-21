# Automator API

Backend API for Android app with n8n integration, built with Node.js, Express, and AWS Lambda.

## Features

- User authentication with JWT
- Secure password storage with bcrypt
- AWS DynamoDB integration
- AWS Lambda deployment
- n8n workflow integration
- TypeScript support

## Prerequisites

- Node.js 18.x
- AWS CLI configured
- Serverless Framework
- DynamoDB tables created
- n8n instance running

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
JWT_SECRET=your-secret-key
AWS_REGION=sa-east-1
N8N_URL=your-n8n-instance-url
```

3. Create DynamoDB tables:
```bash
aws dynamodb create-table \
    --table-name Users \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=email,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "[{\"IndexName\": \"EmailIndex\",\"KeySchema\": [{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}}]" \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb create-table \
    --table-name Goals \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=goalId,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=goalId,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb create-table \
    --table-name Sessions \
    --attribute-definitions \
        AttributeName=token,AttributeType=S \
    --key-schema \
        AttributeName=token,KeyType=HASH \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5
```

## Development

1. Start the local server:
```bash
npm run dev
```

2. Build for production:
```bash
npm run build
```

## Deployment

1. Deploy to AWS Lambda:
```bash
npm run deploy
```

## API Endpoints

Base URL: `https://6keepcn3p6.execute-api.us-east-1.amazonaws.com/dev`

### Authentication

#### Register a new user
- **Endpoint**: `POST /auth/register`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password@123",
    "name": "User Name"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "User Name",
      "createdAt": "2024-01-24T12:34:56.789Z"
    }
  }
  ```

#### Login
- **Endpoint**: `POST /auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password@123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "name": "User Name"
      }
    }
  }
  ```

#### Logout
- **Endpoint**: `POST /auth/logout`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  ```
- **Response**:
  ```json
  {
    "success": true
  }
  ```

#### Get User Profile
- **Endpoint**: `GET /auth/profile`
- **Headers**: 
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "User Name",
      "createdAt": "2024-01-24T12:34:56.789Z"
    }
  }
  ```

### Error Responses

All endpoints may return the following error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common error messages:
- `Missing required fields`
- `Invalid email format`
- `Password must be at least 6 characters long`
- `Email already registered`
- `Invalid credentials`
- `No token provided`
- `Invalid token`
- `User not authenticated`
- `User not found`

### App Features

- `GET /app/data`