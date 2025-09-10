import mongoose, { Schema, Document } from 'mongoose';
import { IOrganization } from '../types';

interface IOrganizationDocument extends Omit<IOrganization, '_id'>, Document {}

const organizationSchema = new Schema<IOrganizationDocument>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    settings: {
      defaultThresholds: {
        warning: {
          type: Number,
          default: 100,
          min: 0,
        },
        critical: {
          type: Number,
          default: 150,
          min: 0,
        },
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
organizationSchema.index({ domain: 1 });
organizationSchema.index({ name: 1 });

export const Organization = mongoose.model<IOrganizationDocument>('Organization', organizationSchema);
