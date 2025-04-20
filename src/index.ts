import express from 'express';
import serverless from 'serverless-http';
import authRoutes from './routes/authRoutes';
import { ApiResponse } from './types';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const response: ApiResponse<null> = {
    success: false,
    error: 'Internal server error',
  };
  res.status(500).json(response);
});

// AWS Lambda handler
export const handler = serverless(app);

// Local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} 