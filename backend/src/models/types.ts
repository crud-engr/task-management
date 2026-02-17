/**
 * Model enums and shared types
 */

export type UserRole = 'admin' | 'member';

export type TaskStatus = 'pending' | 'completed';

export const TASK_STATUS: Record<Uppercase<TaskStatus>, TaskStatus> = {
  PENDING: 'pending',
  COMPLETED: 'completed',
};
