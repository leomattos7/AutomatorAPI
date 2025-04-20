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
AWS_REGION=us-east-1
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
serverless deploy
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/logout` - Logout and invalidate token
- `GET /auth/profile` - Get user profile (requires authentication)

### App Features

- `GET /app/data` - Get app data
- `POST /app/track-goal` - Track goal progress
- `PUT /app/update-user` - Update user information

### n8n Integration

- `POST /n8n/trigger/:id` - Trigger n8n workflow

## Security

- All sensitive routes require JWT authentication
- Passwords are hashed with bcrypt
- JWT tokens expire after 24 hours
- CORS enabled for specific origins
- Rate limiting implemented

## License

MIT 