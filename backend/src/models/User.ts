import type { Model, Optional } from 'sequelize';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import type { UserRole } from './types';

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  'created_at' | 'updated_at'
>;

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

const User = sequelize.define<UserInstance>(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      allowNull: false,
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
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { User };
