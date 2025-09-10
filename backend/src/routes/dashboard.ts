import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate, requireOrganizationAccess } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import {
    energyDataSchema,
    energyDataFiltersSchema,
    anomalyFiltersSchema,
    resolveAnomalySchema
} from '../utils/validation';

const router = Router();
const dashboardController = new DashboardController();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireOrganizationAccess);

// Dashboard overview
router.get('/overview', dashboardController.getDashboardOverview as any);

// Energy data routes
router.get('/energy-data', validate(energyDataFiltersSchema, 'query'), dashboardController.getEnergyData as any);
router.post('/energy-data', validate(energyDataSchema), dashboardController.createEnergyData as any);
router.post('/energy-data/batch', dashboardController.batchCreateEnergyData as any);

// Anomaly routes
router.get('/anomalies', validate(anomalyFiltersSchema, 'query'), dashboardController.getAnomalies as any);
router.put('/anomalies/:anomalyId/resolve', validate(resolveAnomalySchema), dashboardController.resolveAnomaly as any);

// Line statistics
router.get('/lines/:lineId/stats', dashboardController.getLineStats as any);

export default router;
