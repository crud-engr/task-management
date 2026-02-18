import type { Model, Optional } from 'sequelize';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export const EXPORT_STATUS: Record<Uppercase<ExportStatus>, ExportStatus> = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export interface ExportAttributes {
  id: string;
  job_id: string | null;
  schema_name: string;
  requested_by_user_id: string | null;
  status: ExportStatus;
  file_path: string | null;
  error: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type ExportCreationAttributes = Optional<
  ExportAttributes,
  'id' | 'job_id' | 'requested_by_user_id' | 'file_path' | 'error' | 'created_at' | 'updated_at'
>;

export interface ExportInstance
  extends Model<ExportAttributes, ExportCreationAttributes>,
    ExportAttributes {}

const Export = sequelize.define<ExportInstance>(
  'Export',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    schema_name: {
      type: DataTypes.STRING(63),
      allowNull: false,
    },
    requested_by_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        EXPORT_STATUS.PENDING,
        EXPORT_STATUS.PROCESSING,
        EXPORT_STATUS.COMPLETED,
        EXPORT_STATUS.FAILED
      ),
      allowNull: false,
      defaultValue: EXPORT_STATUS.PENDING,
    },
    file_path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'exports',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    schema: 'public',
  }
);

export { Export };
