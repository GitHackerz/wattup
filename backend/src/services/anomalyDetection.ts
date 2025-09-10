import { EnergyData } from '../models/EnergyData';
import { Anomaly } from '../models/Anomaly';
import { IEnergyData, IAnomaly, AnomalySeverity } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Anomaly detection service using statistical methods
 */
export class AnomalyDetectionService {
  private static instance: AnomalyDetectionService;
  
  public static getInstance(): AnomalyDetectionService {
    if (!AnomalyDetectionService.instance) {
      AnomalyDetectionService.instance = new AnomalyDetectionService();
    }
    return AnomalyDetectionService.instance;
  }

  /**
   * Analyze energy data for anomalies using Z-score method
   */
  public async analyzeEnergyData(energyData: IEnergyData): Promise<boolean> {
    try {
      const { lineId, consumption, threshold, organizationId } = energyData;
      
      // Get historical data for the line (last N data points)
      const historicalData = await EnergyData.find({
        lineId,
        organizationId,
        timestamp: { $lt: energyData.timestamp || new Date() },
      })
        .sort({ timestamp: -1 })
        .limit(config.anomalyDetection.windowSize)
        .select('consumption')
        .lean();

      if (historicalData.length < 10) {
        // Not enough historical data, use simple threshold-based detection
        return this.simpleThresholdDetection(consumption, threshold);
      }

      // Calculate Z-score
      const isAnomaly = this.detectUsingZScore(consumption, historicalData.map(d => d.consumption));
      
      // If anomaly detected, create anomaly record
      if (isAnomaly) {
        await this.createAnomalyRecord(energyData, historicalData.map(d => d.consumption));
      }

      return isAnomaly;
    } catch (error) {
      logger.error('Error in anomaly detection:', error);
      // Fallback to simple threshold detection
      return this.simpleThresholdDetection(energyData.consumption, energyData.threshold);
    }
  }

  /**
   * Simple threshold-based anomaly detection
   */
  private simpleThresholdDetection(consumption: number, threshold: number): boolean {
    const deviation = Math.abs(consumption - threshold) / threshold;
    return deviation > 0.1; // 10% deviation threshold
  }

  /**
   * Z-score based anomaly detection
   */
  private detectUsingZScore(currentValue: number, historicalValues: number[]): boolean {
    if (historicalValues.length === 0) return false;

    const mean = this.calculateMean(historicalValues);
    const stdDev = this.calculateStandardDeviation(historicalValues, mean);

    // If standard deviation is 0, use simple threshold
    if (stdDev === 0) return false;

    const zScore = Math.abs((currentValue - mean) / stdDev);
    return zScore > config.anomalyDetection.zScoreThreshold;
  }

  /**
   * Calculate mean of values
   */
  private calculateMean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Create anomaly record
   */
  private async createAnomalyRecord(energyData: IEnergyData, historicalValues: number[]): Promise<void> {
    try {
      const mean = this.calculateMean(historicalValues);
      const deviation = energyData.consumption - mean;
      const severity = this.calculateSeverity(Math.abs(deviation), energyData.threshold);

      const anomalyData: Partial<IAnomaly> = {
        lineId: energyData.lineId,
        lineName: energyData.lineName,
        consumption: energyData.consumption,
        threshold: energyData.threshold,
        deviation,
        severity,
        timestamp: energyData.timestamp || new Date(),
        resolved: false,
        organizationId: energyData.organizationId,
      };

      await Anomaly.create(anomalyData);
      logger.info(`Anomaly detected for line ${energyData.lineId}:`, anomalyData);
    } catch (error) {
      logger.error('Error creating anomaly record:', error);
    }
  }

  /**
   * Calculate anomaly severity based on deviation
   */
  private calculateSeverity(deviation: number, threshold: number): AnomalySeverity {
    const deviationPercentage = (deviation / threshold) * 100;

    if (deviationPercentage >= 50) return AnomalySeverity.CRITICAL;
    if (deviationPercentage >= 30) return AnomalySeverity.HIGH;
    if (deviationPercentage >= 15) return AnomalySeverity.MEDIUM;
    return AnomalySeverity.LOW;
  }

  /**
   * Batch analyze multiple energy data points
   */
  public async batchAnalyze(energyDataArray: IEnergyData[]): Promise<boolean[]> {
    const results = await Promise.all(
      energyDataArray.map(data => this.analyzeEnergyData(data))
    );
    return results;
  }

  /**
   * Get anomaly statistics for a specific line
   */
  public async getLineAnomalyStats(lineId: string, organizationId?: string) {
    const filter: any = { lineId };
    if (organizationId) filter.organizationId = organizationId;

    const [total, resolved, unresolved, severityStats] = await Promise.all([
      Anomaly.countDocuments(filter),
      Anomaly.countDocuments({ ...filter, resolved: true }),
      Anomaly.countDocuments({ ...filter, resolved: false }),
      Anomaly.aggregate([
        { $match: filter },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      resolved,
      unresolved,
      severityBreakdown: severityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
