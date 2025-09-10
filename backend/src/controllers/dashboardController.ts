import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { EnergyData } from '../models/EnergyData';
import { Anomaly } from '../models/Anomaly';
import { AnomalyDetectionService } from '../services/anomalyDetection';
import {
    successResponse,
    parsePaginationQuery,
    getPaginationMeta,
    createSortObject,
    createDateRangeFilter
} from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import { AnomalySeverity } from '../types';
import { logger } from '../utils/logger';

/**
 * Dashboard Controller
 */
export class DashboardController {
  private anomalyService = AnomalyDetectionService.getInstance();

  /**
   * Get dashboard overview statistics
   */
  public getDashboardOverview = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { organizationId } = req.user!;
      const { timeRange = '24h' } = req.query;

      // Calculate time range
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const filter = {
        timestamp: { $gte: startDate },
        ...(organizationId && { organizationId }),
      };

      // Get parallel statistics
      const [
        totalDataPoints,
        totalAnomalies,
        unresolvedAnomalies,
        criticalAnomalies,
        uniqueLines,
        averageConsumption,
        recentAnomalies,
        consumptionTrend,
      ] = await Promise.all([
        EnergyData.countDocuments(filter),
        Anomaly.countDocuments(filter),
        Anomaly.countDocuments({ ...filter, resolved: false }),
        Anomaly.countDocuments({ ...filter, severity: AnomalySeverity.CRITICAL }),
        EnergyData.distinct('lineId', filter),
        EnergyData.aggregate([
          { $match: filter },
          { $group: { _id: null, avgConsumption: { $avg: '$consumption' } } },
        ]),
        Anomaly.find(filter)
          .sort({ timestamp: -1 })
          .limit(5)
          .populate('resolvedBy', 'firstName lastName')
          .lean(),
        EnergyData.aggregate([
          { $match: filter },
          { 
            $group: {
              _id: {
                $dateToString: {
                  format: timeRange === '1h' ? '%Y-%m-%d %H:%M' : '%Y-%m-%d %H',
                  date: '$timestamp'
                }
              },
              totalConsumption: { $sum: '$consumption' },
              avgConsumption: { $avg: '$consumption' },
              dataPoints: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } },
          { $limit: 24 }
        ]),
      ]);

      const avgConsumption = averageConsumption[0]?.avgConsumption || 0;

      res.json(
        successResponse(
          {
            overview: {
              totalDataPoints,
              totalAnomalies,
              unresolvedAnomalies,
              criticalAnomalies,
              activeLines: uniqueLines.length,
              averageConsumption: Math.round(avgConsumption * 100) / 100,
              timeRange,
            },
            recentAnomalies,
            consumptionTrend,
          },
          'Dashboard overview retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get energy data with filters and pagination
   */
  public getEnergyData = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { organizationId } = req.user!;
      const pagination = parsePaginationQuery(req.query);
      
      // Build filters
      const filters: any = { ...(organizationId && { organizationId }) };
      
      if (req.query.lineId) filters.lineId = req.query.lineId;
      if (req.query.isAnomaly !== undefined) filters.isAnomaly = req.query.isAnomaly === 'true';
      if (req.query.minConsumption) filters.consumption = { $gte: Number(req.query.minConsumption) };
      if (req.query.maxConsumption) {
        filters.consumption = { ...filters.consumption, $lte: Number(req.query.maxConsumption) };
      }

      // Date range filter
      const dateFilter = createDateRangeFilter(
        req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        req.query.endDate ? new Date(req.query.endDate as string) : undefined
      );
      Object.assign(filters, dateFilter);

      // Get total count and data
      const [total, energyData] = await Promise.all([
        EnergyData.countDocuments(filters),
        EnergyData.find(filters)
          .sort(createSortObject(pagination.sortBy, pagination.sortOrder))
          .skip((pagination.page - 1) * pagination.limit)
          .limit(pagination.limit)
          .lean(),
      ]);

      const paginationMeta = getPaginationMeta(total, pagination.page, pagination.limit);

      res.json(
        successResponse(
          energyData,
          'Energy data retrieved successfully',
          paginationMeta
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new energy data entry
   */
  public createEnergyData = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { organizationId } = req.user!;
      const energyDataInput = {
        ...req.body,
        organizationId,
        timestamp: req.body.timestamp || new Date(),
      };

      // Check for anomaly
      const isAnomaly = await this.anomalyService.analyzeEnergyData(energyDataInput);
      energyDataInput.isAnomaly = isAnomaly;

      // Create energy data entry
      const energyData = await EnergyData.create(energyDataInput);

      logger.info(`Energy data created for line ${energyData.lineId}:`, {
        consumption: energyData.consumption,
        isAnomaly: energyData.isAnomaly,
      });

      res.status(201).json(
        successResponse(energyData, 'Energy data created successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Batch create energy data
   */
  public batchCreateEnergyData = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { organizationId } = req.user!;
      const { energyDataArray } = req.body;

      if (!Array.isArray(energyDataArray) || energyDataArray.length === 0) {
        throw new Error('energyDataArray must be a non-empty array');
      }

      // Prepare data with organization ID
      const preparedData = energyDataArray.map(data => ({
        ...data,
        organizationId,
        timestamp: data.timestamp || new Date(),
      }));

      // Batch analyze for anomalies
      const anomalyResults = await this.anomalyService.batchAnalyze(preparedData);
      
      // Add anomaly results to data
      const finalData = preparedData.map((data, index) => ({
        ...data,
        isAnomaly: anomalyResults[index],
      }));

      // Batch insert
      const createdData = await EnergyData.insertMany(finalData);

      logger.info(`Batch created ${createdData.length} energy data entries`);

      res.status(201).json(
        successResponse(
          { 
            created: createdData.length,
            anomaliesDetected: anomalyResults.filter(Boolean).length 
          },
          'Energy data batch created successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get anomalies with filters and pagination
   */
  public getAnomalies = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { organizationId } = req.user!;
      const pagination = parsePaginationQuery(req.query);
      
      // Build filters
      const filters: any = { ...(organizationId && { organizationId }) };
      
      if (req.query.lineId) filters.lineId = req.query.lineId;
      if (req.query.severity) filters.severity = req.query.severity;
      if (req.query.resolved !== undefined) filters.resolved = req.query.resolved === 'true';

      // Date range filter
      const dateFilter = createDateRangeFilter(
        req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        req.query.endDate ? new Date(req.query.endDate as string) : undefined
      );
      Object.assign(filters, dateFilter);

      // Get total count and data
      const [total, anomalies] = await Promise.all([
        Anomaly.countDocuments(filters),
        Anomaly.find(filters)
          .sort(createSortObject(pagination.sortBy, pagination.sortOrder))
          .skip((pagination.page - 1) * pagination.limit)
          .limit(pagination.limit)
          .populate('resolvedBy', 'firstName lastName')
          .lean(),
      ]);

      const paginationMeta = getPaginationMeta(total, pagination.page, pagination.limit);

      res.json(
        successResponse(
          anomalies,
          'Anomalies retrieved successfully',
          paginationMeta
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resolve anomaly
   */
  public resolveAnomaly = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { anomalyId } = req.params;
      const { notes } = req.body;
      const { userId, organizationId } = req.user!;

      const anomaly = await Anomaly.findOne({
        _id: anomalyId,
        ...(organizationId && { organizationId }),
      });

      if (!anomaly) {
        throw new NotFoundError('Anomaly not found');
      }

      if (anomaly.resolved) {
        throw new Error('Anomaly is already resolved');
      }

      // Update anomaly
      anomaly.resolved = true;
      anomaly.resolvedBy = userId;
      anomaly.resolvedAt = new Date();
      if (notes) anomaly.notes = notes;
      
      await anomaly.save();

      logger.info(`Anomaly ${anomalyId} resolved by user ${userId}`);

      res.json(
        successResponse(anomaly, 'Anomaly resolved successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get line statistics
   */
  public getLineStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { lineId } = req.params;
      const { organizationId } = req.user!;

      // Get line statistics
      const stats = await this.anomalyService.getLineAnomalyStats(lineId, organizationId);

      // Get recent consumption data
      const recentData = await EnergyData.find({
        lineId,
        ...(organizationId && { organizationId }),
      })
        .sort({ timestamp: -1 })
        .limit(100)
        .select('consumption timestamp')
        .lean();

      // Calculate consumption statistics
      const consumptions = recentData.map(d => d.consumption);
      const avgConsumption = consumptions.reduce((sum, val) => sum + val, 0) / consumptions.length || 0;
      const maxConsumption = Math.max(...consumptions) || 0;
      const minConsumption = Math.min(...consumptions) || 0;

      res.json(
        successResponse(
          {
            lineId,
            anomalyStats: stats,
            consumptionStats: {
              average: Math.round(avgConsumption * 100) / 100,
              maximum: maxConsumption,
              minimum: minConsumption,
              dataPoints: recentData.length,
            },
            recentData: recentData.slice(0, 20), // Last 20 data points
          },
          'Line statistics retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  };
}
