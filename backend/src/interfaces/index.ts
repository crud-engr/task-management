/**
 * Application-level interfaces and type declarations
 */

import type { Request } from 'express';
import type { OrganizationInstance } from '../models/Organization';
import type { UserInstance } from '../models/User';

export interface AppConfig {
  env: string;
  port: number;
  nodeEnv: string;
  exportStoragePath: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  dialect: 'postgres';
  logging: boolean;
  ssl?: boolean;
  sslRejectUnauthorized?: boolean;
  defaultSchema?: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthenticatedRequest extends Request {
  tenantId?: string;
  userId?: string;
  tenant?: OrganizationInstance;
  schemaName?: string;
  user?: UserInstance;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  services: {
    database: boolean;
    redis: boolean;
  };
}
