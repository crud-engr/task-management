import type { Model, Optional } from 'sequelize';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import type { TaskStatus } from './types';

export interface TaskAttributes {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export type TaskCreationAttributes = Optional<
  TaskAttributes,
  'id' | 'created_at' | 'updated_at'
>;

export interface TaskInstance
  extends Model<TaskAttributes, TaskCreationAttributes>,
    TaskAttributes {}

const Task = sequelize.define<TaskInstance>(
  'Task',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'tasks',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { Task };
