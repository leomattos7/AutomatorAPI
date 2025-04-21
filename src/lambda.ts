import serverless from 'serverless-http';
import app from './app';  // vamos mover a configuração do express para app.ts

export const handler = serverless(app);