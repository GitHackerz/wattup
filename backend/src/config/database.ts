import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '../utils/logger';

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Setup database indexes for performance
 */
export const setupIndexes = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      logger.error('Database connection not available for index setup');
      return;
    }

    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ organizationId: 1 });
    await db.collection('users').createIndex({ role: 1 });
    
    // Energy data indexes
    await db.collection('energydatas').createIndex({ lineId: 1, timestamp: -1 });
    await db.collection('energydatas').createIndex({ organizationId: 1, timestamp: -1 });
    await db.collection('energydatas').createIndex({ isAnomaly: 1, timestamp: -1 });
    
    // Anomaly indexes
    await db.collection('anomalies').createIndex({ lineId: 1, timestamp: -1 });
    await db.collection('anomalies').createIndex({ severity: 1, resolved: 1 });
    await db.collection('anomalies').createIndex({ organizationId: 1, timestamp: -1 });
    
    // Audit log indexes
    await db.collection('auditlogs').createIndex({ userId: 1, timestamp: -1 });
    await db.collection('auditlogs').createIndex({ resource: 1, timestamp: -1 });
    
    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Error setting up database indexes:', error);
  }
};
