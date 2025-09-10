import mongoose, { Schema, Document } from 'mongoose';
import { IEnergyData } from '../types';

interface IEnergyDataDocument extends Omit<IEnergyData, '_id'>, Document {}

const energyDataSchema = new Schema<IEnergyDataDocument>(
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
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    threshold: {
      type: Number,
      required: true,
      min: [0, 'Threshold cannot be negative'],
    },
    isAnomaly: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    metadata: {
      voltage: {
        type: Number,
        min: 0,
      },
      current: {
        type: Number,
        min: 0,
      },
      powerFactor: {
        type: Number,
        min: 0,
        max: 1,
      },
      location: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
energyDataSchema.index({ lineId: 1, timestamp: -1 });
energyDataSchema.index({ organizationId: 1, timestamp: -1 });
energyDataSchema.index({ isAnomaly: 1, timestamp: -1 });
energyDataSchema.index({ timestamp: -1, consumption: 1 });

// TTL index to automatically delete old data (optional)
// energyDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

export const EnergyData = mongoose.model<IEnergyDataDocument>('EnergyData', energyDataSchema);
