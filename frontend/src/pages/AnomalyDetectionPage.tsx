import React, { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { Anomaly, AnomalyFilters, AnomalySeverity } from '../types';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const AnomalyDetectionPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnomalyFilters>({
    page: 1,
    limit: 20,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAnomalies, setSelectedAnomalies] = useState<string[]>([]);
  const [resolvingAnomalies, setResolvingAnomalies] = useState<string[]>([]);

  const fetchAnomalies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardApi.getAnomalies(filters);
      
      if (response.data.success) {
        setAnomalies(response.data.data!);
        setTotalCount(response.data.pagination?.total || 0);
      } else {
        setError(response.data.message || 'Failed to fetch anomalies');
      }
    } catch (error: any) {
      console.error('Error fetching anomalies:', error);
      setError(error.message || 'Failed to fetch anomalies');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  const resolveAnomaly = async (anomalyId: string, notes?: string) => {
    try {
      setResolvingAnomalies(prev => [...prev, anomalyId]);
      const response = await dashboardApi.resolveAnomaly(anomalyId, { notes });
      
      if (response.data.success) {
        // Update the anomaly in the local state
        setAnomalies(prev => prev.map(anomaly => 
          anomaly._id === anomalyId 
            ? { ...anomaly, resolved: true, resolvedAt: new Date().toISOString() }
            : anomaly
        ));
        setSelectedAnomalies(prev => prev.filter(id => id !== anomalyId));
      } else {
        setError(response.data.message || 'Failed to resolve anomaly');
      }
    } catch (error: any) {
      console.error('Error resolving anomaly:', error);
      setError(error.message || 'Failed to resolve anomaly');
    } finally {
      setResolvingAnomalies(prev => prev.filter(id => id !== anomalyId));
    }
  };

  const getSeverityColor = (severity: AnomalySeverity) => {
    switch (severity) {
      case AnomalySeverity.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case AnomalySeverity.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case AnomalySeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case AnomalySeverity.LOW:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleFilterChange = (key: keyof AnomalyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const toggleAnomalySelection = (anomalyId: string) => {
    setSelectedAnomalies(prev => 
      prev.includes(anomalyId) 
        ? prev.filter(id => id !== anomalyId)
        : [...prev, anomalyId]
    );
  };

  const resolveSelectedAnomalies = async () => {
    const promises = selectedAnomalies.map(id => resolveAnomaly(id, 'Bulk resolution'));
    await Promise.all(promises);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading anomalies..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Anomaly Detection & Management
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalCount} total anomalies
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Severity
            </label>
            <select
              value={filters.severity || ''}
              onChange={(e) => handleFilterChange('severity', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Severities</option>
              <option value={AnomalySeverity.CRITICAL}>Critical</option>
              <option value={AnomalySeverity.HIGH}>High</option>
              <option value={AnomalySeverity.MEDIUM}>Medium</option>
              <option value={AnomalySeverity.LOW}>Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.resolved === undefined ? '' : filters.resolved.toString()}
              onChange={(e) => handleFilterChange('resolved', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Status</option>
              <option value="false">Active</option>
              <option value="true">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Line ID
            </label>
            <input
              type="text"
              value={filters.lineId || ''}
              onChange={(e) => handleFilterChange('lineId', e.target.value || undefined)}
              placeholder="Filter by line ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy || 'timestamp'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="timestamp">Timestamp</option>
              <option value="severity">Severity</option>
              <option value="deviation">Deviation</option>
              <option value="consumption">Consumption</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAnomalies.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-200">
              {selectedAnomalies.length} anomalies selected
            </span>
            <button
              onClick={resolveSelectedAnomalies}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Resolve Selected
            </button>
          </div>
        </div>
      )}

      {/* Anomalies List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {anomalies.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {anomalies.map((anomaly) => (
              <div key={anomaly._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedAnomalies.includes(anomaly._id)}
                    onChange={() => toggleAnomalySelection(anomaly._id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {anomaly.lineName}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({anomaly.lineId})
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {anomaly.resolved ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span className="text-xs">Resolved</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-red-600">
                              <ClockIcon className="h-4 w-4" />
                              <span className="text-xs">Active</span>
                            </div>
                            <button
                              onClick={() => resolveAnomaly(anomaly._id)}
                              disabled={resolvingAnomalies.includes(anomaly._id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {resolvingAnomalies.includes(anomaly._id) ? 'Resolving...' : 'Resolve'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Consumption:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {anomaly.consumption.toFixed(1)} kWh
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Threshold:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {anomaly.threshold.toFixed(1)} kWh
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Deviation:</span>
                        <span className="ml-1 font-medium text-red-600">
                          +{anomaly.deviation.toFixed(1)} kWh
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Detected:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {formatTimestamp(anomaly.timestamp)}
                        </span>
                      </div>
                    </div>

                    {anomaly.notes && (
                      <div className="mt-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Notes:</span>
                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                          {anomaly.notes}
                        </p>
                      </div>
                    )}

                    {anomaly.resolved && anomaly.resolvedAt && (
                      <div className="mt-2 text-sm text-green-600">
                        Resolved on {formatTimestamp(anomaly.resolvedAt)}
                        {anomaly.resolvedBy && (
                          <span className="ml-1">
                            by {anomaly.resolvedBy.firstName} {anomaly.resolvedBy.lastName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Anomalies Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.severity || filters.resolved !== undefined || filters.lineId
                ? 'No anomalies match your current filters.'
                : 'No anomalies detected in your system.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > (filters.limit || 20) && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to{' '}
            {Math.min((filters.page || 1) * (filters.limit || 20), totalCount)} of {totalCount} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
              disabled={(filters.page || 1) <= 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
              disabled={(filters.page || 1) * (filters.limit || 20) >= totalCount}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyDetectionPage;
