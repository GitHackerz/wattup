import mongoose, { Schema, Document } from 'mongoose';
import { IAnomaly, AnomalySeverity } from '../types';

interface IAnomalyDocument extends Omit<IAnomaly, '_id'>, Document {}

const anomalySchema = new Schema<IAnomalyDocument>(
  {
    lineId: {
      type: String,
      required: [true, 'Line ID is required'],
      trim: true,
      index: true,
    },
    lineName: {
      type: String,
      required: [true, 'Line name is required'],
      trim: true,
    },
    consumption: {
      type: Number,
      required: [true, 'Consumption value is required'],
      min: [0, 'Consumption cannot be negative'],
    },
    threshold: {
      type: Number,
      required: true,
      min: [0, 'Threshold cannot be negative'],
    },
    deviation: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(AnomalySeverity),
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
anomalySchema.index({ lineId: 1, timestamp: -1 });
anomalySchema.index({ severity: 1, resolved: 1 });
anomalySchema.index({ organizationId: 1, timestamp: -1 });
anomalySchema.index({ resolved: 1, timestamp: -1 });

// Pre-save middleware to set resolvedAt when resolved is changed to true
anomalySchema.pre('save', function (this: IAnomalyDocument, next: any) {
  if (this.isModified('resolved') && this.resolved && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

export const Anomaly = mongoose.model<IAnomalyDocument>('Anomaly', anomalySchema);
