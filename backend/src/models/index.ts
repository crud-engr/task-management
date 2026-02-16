import { Organization } from './Organization';
import { User } from './User';
import { Task } from './Task';

/**
 * Model associations:
 * - User hasMany Task (tasks belong to a user)
 * - Task belongsTo User
 *
 * Organization lives in public schema; User and Task live in tenant schemas
 * and are queried via runInSchema(organization.schema_name, ...).
 */
function setupAssociations(): void {
  User.hasMany(Task, { foreignKey: 'user_id' });
  Task.belongsTo(User, { foreignKey: 'user_id' });
}

setupAssociations();

export { Organization, User, Task };
export type { UserRole, TaskStatus } from './types';
export type { OrganizationAttributes, OrganizationCreationAttributes } from './Organization';
export type { UserAttributes, UserCreationAttributes } from './User';
export type { TaskAttributes, TaskCreationAttributes } from './Task';
