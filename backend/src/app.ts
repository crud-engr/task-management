import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';
import type { ApiResponse } from './interfaces';
import { extractTenantId, extractUserId } from './middleware';

export function createApp(): Express {
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', extractTenantId, extractUserId, routes);

  app.use((res: Response) => {
    const response: ApiResponse = {
      success: false,
      error: 'Not Found',
    };
    res.status(404).json(response);
  });

  app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
    console.error(err);
    const response: ApiResponse = {
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    };
    res.status(500).json(response);
  });

  return app;
}
