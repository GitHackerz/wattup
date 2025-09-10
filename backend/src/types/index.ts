export interface IUser {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  isActive: boolean;
  emailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  WORKER = 'worker',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export interface IEnergyData {
  _id?: string;
  lineId: string;
  lineName: string;
  consumption: number;
  timestamp: Date;
  threshold: number;
  isAnomaly: boolean;
  organizationId?: string;
  metadata?: {
    voltage?: number;
    current?: number;
    powerFactor?: number;
    location?: string;
  };
}

export interface IAnomaly {
  _id?: string;
  lineId: string;
  lineName: string;
  consumption: number;
  threshold: number;
  deviation: number;
  severity: AnomalySeverity;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  notes?: string;
  organizationId?: string;
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface IOrganization {
  _id?: string;
  name: string;
  domain: string;
  settings: {
    defaultThresholds: {
      warning: number;
      critical: number;
    };
    notifications: {
      email: boolean;
      sms: boolean;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuditLog {
  _id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  organizationId?: string;
}

export interface IImageAnalysis {
  _id?: string;
  filename: string;
  originalName: string;
  path: string;
  analysisResult: {
    defectsDetected: boolean;
    defectTypes: string[];
    confidence: number;
    boundingBoxes?: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      type: string;
    }>;
  };
  uploadedBy: string;
  timestamp: Date;
  organizationId?: string;
}

export interface IReport {
  _id?: string;
  title: string;
  type: ReportType;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: Record<string, any>;
  generatedBy: string;
  filePath?: string;
  format: ReportFormat;
  status: ReportStatus;
  organizationId?: string;
  createdAt?: Date;
}

export enum ReportType {
  ENERGY_CONSUMPTION = 'energy_consumption',
  ANOMALY_SUMMARY = 'anomaly_summary',
  PERFORMANCE_ANALYTICS = 'performance_analytics',
}

export enum ReportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  EXCEL = 'excel',
}

export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EnergyDataFilters extends PaginationQuery {
  lineId?: string;
  startDate?: Date;
  endDate?: Date;
  isAnomaly?: boolean;
  minConsumption?: number;
  maxConsumption?: number;
}

export interface AnomalyFilters extends PaginationQuery {
  severity?: AnomalySeverity;
  resolved?: boolean;
  startDate?: Date;
  endDate?: Date;
  lineId?: string;
}
