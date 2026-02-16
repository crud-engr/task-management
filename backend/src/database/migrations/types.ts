import type { Transaction } from 'sequelize';

export interface MigrationContext {
  schema?: string;
  transaction: Transaction;
}

export interface MigrationModule {
  name: string;
  up(ctx: MigrationContext): Promise<void>;
  down(ctx: MigrationContext): Promise<void>;
}
