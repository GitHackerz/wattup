import React, { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { EnergyData, EnergyDataFilters } from '../types';
import {
  BoltIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const EnergyMonitoringPage: React.FC = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EnergyDataFilters>({
    page: 1,
    limit: 50,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalConsumption: 0,
    averageConsumption: 0,
    maxConsumption: 0,
    minConsumption: 0,
    uniqueLines: 0
  });

  const fetchEnergyData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardApi.getEnergyData(filters);
      
      if (response.data.success) {
        const data = response.data.data!;
        setEnergyData(data);
        setTotalCount(response.data.pagination?.total || 0);

        // Calculate statistics
        if (data.length > 0) {
          const consumptions = data.map((d: EnergyData) => d.consumption);
          const uniqueLineIds = Array.from(new Set(data.map((d: EnergyData) => d.lineId)));
          
          setStats({
            totalConsumption: consumptions.reduce((sum: number, val: number) => sum + val, 0),
            averageConsumption: consumptions.reduce((sum: number, val: number) => sum + val, 0) / consumptions.length,
            maxConsumption: Math.max(...consumptions),
            minConsumption: Math.min(...consumptions),
            uniqueLines: uniqueLineIds.length
          });
        }
      } else {
        setError(response.data.message || 'Failed to fetch energy data');
      }
    } catch (error: any) {
      console.error('Error fetching energy data:', error);
      setError(error.message || 'Failed to fetch energy data');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEnergyData();
  }, [fetchEnergyData]);

  const handleFilterChange = (key: keyof EnergyDataFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportData = () => {
    // This would implement CSV export functionality
    console.log('Exporting energy data...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading energy data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Energy Monitoring
        </h1>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Consumption</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalConsumption.toFixed(1)} kWh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.averageConsumption.toFixed(1)} kWh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Max</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.maxConsumption.toFixed(1)} kWh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Min</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.minConsumption.toFixed(1)} kWh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Lines</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.uniqueLines}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              Start Date
            </label>
            <input
              type="datetime-local"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="datetime-local"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Consumption
            </label>
            <input
              type="number"
              value={filters.minConsumption || ''}
              onChange={(e) => handleFilterChange('minConsumption', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Min kWh"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Consumption
            </label>
            <input
              type="number"
              value={filters.maxConsumption || ''}
              onChange={(e) => handleFilterChange('maxConsumption', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Max kWh"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.isAnomaly === true}
              onChange={(e) => handleFilterChange('isAnomaly', e.target.checked ? true : undefined)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show only anomalies</span>
          </label>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Energy Data ({totalCount} records)
            </h3>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Line
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Consumption
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Metadata
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {energyData.map((data) => (
                <tr key={data._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {data.lineName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {data.lineId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${data.isAnomaly ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                      {data.consumption.toFixed(1)} kWh
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {data.threshold.toFixed(1)} kWh
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(data.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {data.isAnomaly ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Anomaly
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {data.metadata && (
                      <div className="space-y-1">
                        {data.metadata.voltage && <div>V: {data.metadata.voltage.toFixed(1)}V</div>}
                        {data.metadata.current && <div>I: {data.metadata.current.toFixed(2)}A</div>}
                        {data.metadata.powerFactor && <div>PF: {data.metadata.powerFactor.toFixed(2)}</div>}
                        {data.metadata.location && <div>{data.metadata.location}</div>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {energyData.length === 0 && !error && (
          <div className="text-center py-12">
            <BoltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Energy Data Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No energy data matches your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > (filters.limit || 50) && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((filters.page || 1) - 1) * (filters.limit || 50) + 1} to{' '}
            {Math.min((filters.page || 1) * (filters.limit || 50), totalCount)} of {totalCount} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
              disabled={(filters.page || 1) <= 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {filters.page || 1} of {Math.ceil(totalCount / (filters.limit || 50))}
            </span>
            <button
              onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
              disabled={(filters.page || 1) * (filters.limit || 50) >= totalCount}
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

export default EnergyMonitoringPage;
