import type { Model, Optional } from 'sequelize';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export interface OrganizationAttributes {
  id: string;
  name: string;
  schema_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export type OrganizationCreationAttributes = Optional<
  OrganizationAttributes,
  'created_at' | 'updated_at'
>;

export interface OrganizationInstance
  extends Model<OrganizationAttributes, OrganizationCreationAttributes>,
    OrganizationAttributes {}

const Organization = sequelize.define<OrganizationInstance>(
  'Organization',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    schema_name: {
      type: DataTypes.STRING(63),
      allowNull: false,
      unique: true,
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
    tableName: 'organizations',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    schema: 'public',
  }
);

export { Organization };
