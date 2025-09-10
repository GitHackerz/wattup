// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum UserRole {
  WORKER = 'worker',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

// Authentication types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  organizationId?: string;
}

// Theme types
export interface ThemeState {
  isDarkMode: boolean;
  primaryColor: string;
}

// Energy data types
export interface EnergyData {
  _id: string;
  lineId: string;
  lineName: string;
  consumption: number;
  timestamp: string;
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

// Anomaly types
export interface Anomaly {
  _id: string;
  lineId: string;
  lineName: string;
  consumption: number;
  threshold: number;
  deviation: number;
  severity: AnomalySeverity;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  resolvedAt?: string;
  notes?: string;
  organizationId?: string;
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Dashboard types
export interface DashboardOverview {
  overview: {
    totalDataPoints: number;
    totalAnomalies: number;
    unresolvedAnomalies: number;
    criticalAnomalies: number;
    activeLines: number;
    averageConsumption: number;
    timeRange: string;
  };
  recentAnomalies: Anomaly[];
  consumptionTrend: Array<{
    _id: string;
    totalConsumption: number;
    avgConsumption: number;
    dataPoints: number;
  }>;
}

// API response types
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

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter types
export interface EnergyDataFilters extends PaginationParams {
  lineId?: string;
  startDate?: string;
  endDate?: string;
  isAnomaly?: boolean;
  minConsumption?: number;
  maxConsumption?: number;
}

export interface AnomalyFilters extends PaginationParams {
  severity?: AnomalySeverity;
  resolved?: boolean;
  startDate?: string;
  endDate?: string;
  lineId?: string;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// UI types
export interface ThemeState {
  isDarkMode: boolean;
  primaryColor: string;
}

export interface NotificationState {
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  autoClose?: boolean;
}

// WebSocket types
export interface SocketState {
  connected: boolean;
  error: string | null;
}

export interface RealTimeUpdate {
  type: 'energy_data' | 'anomaly' | 'system_status';
  data: any;
  timestamp: string;
  organizationId?: string;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// Report types
export interface Report {
  id: string;
  title: string;
  type: ReportType;
  dateRange: {
    start: string;
    end: string;
  };
  filters: Record<string, any>;
  format: ReportFormat;
  status: ReportStatus;
  filePath?: string;
  createdAt: string;
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

// Error types
export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, any>;
}

// Loading state types
export interface LoadingState {
  [key: string]: boolean;
}

// Organization types
export interface Organization {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}
