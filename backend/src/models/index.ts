import { Organization } from './Organization';
import { User } from './User';
import { Task } from './Task';
import { JobStatus } from './JobStatus';

/**
 * Model associations:
 * - User hasMany Task (tasks belong to a user)
 * - Task belongsTo User
 */
function setupAssociations(): void {
  User.hasMany(Task, { foreignKey: 'user_id' });
  Task.belongsTo(User, { foreignKey: 'user_id' });
}

setupAssociations();

export { Organization, User, Task, JobStatus };
export type { UserRole, TaskStatus } from './types';
export type { OrganizationAttributes, OrganizationCreationAttributes } from './Organization';
export type { UserAttributes, UserCreationAttributes } from './User';
export type { TaskAttributes, TaskCreationAttributes } from './Task';
export type { JobStatusAttributes, JobStatusCreationAttributes } from './JobStatus';
export {
  createJobStatus,
  updateJobStatus,
} from './JobStatus';
