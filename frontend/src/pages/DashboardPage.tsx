import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardApi } from '../api/client';
import { DashboardOverview } from '../types';
import {
  ChartBarIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  SignalIcon
} from '@heroicons/react/24/outline';



const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    // Fetch initial dashboard data
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await dashboardApi.getDashboardOverview(timeRange);
        
        if (response.data.success) {
          setDashboardData(response.data.data!);
        } else {
          setError(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for real-time updates
      socket.on('dashboard-update', (data) => {
        if (dashboardData) {
          setDashboardData(prev => ({
            ...prev!,
            overview: { ...prev!.overview, ...data }
          }));
        }
      });

      return () => {
        socket.off('dashboard-update');
      };
    }
  }, [socket, isConnected, dashboardData]);

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { overview, recentAnomalies, consumptionTrend } = dashboardData;

  const statCards = [
    {
      title: 'Total Data Points',
      value: overview.totalDataPoints.toLocaleString(),
      icon: ChartBarIcon,
      change: '+5.2%',
      changeType: 'increase' as const,
      color: 'blue',
    },
    {
      title: 'Average Consumption',
      value: `${overview.averageConsumption.toFixed(1)} kWh`,
      icon: BoltIcon,
      change: '-2.1%',
      changeType: 'decrease' as const,
      color: 'green',
    },
    {
      title: 'Active Lines',
      value: overview.activeLines.toString(),
      icon: SignalIcon,
      change: '+3',
      changeType: 'increase' as const,
      color: 'purple',
    },
    {
      title: 'Unresolved Anomalies',
      value: overview.unresolvedAnomalies.toString(),
      icon: ExclamationTriangleIcon,
      change: overview.unresolvedAnomalies > 0 ? '+' + overview.unresolvedAnomalies.toString() : '0',
      changeType: overview.unresolvedAnomalies > 0 ? 'increase' as const : 'decrease' as const,
      color: 'red',
    },
  ];

  const timeRangeOptions = [
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      red: 'bg-red-500 text-red-600 bg-red-50',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Energy Monitoring Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Live Data' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color).split(' ');
          
          return (
            <div
              key={stat.title}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${colors[2]}`}>
                  <Icon className={`h-6 w-6 ${colors[1]}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'increase'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  from last period
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Energy Consumption Trend
          </h3>
          <div className="h-64 flex flex-col justify-center space-y-2">
            {consumptionTrend.slice(0, 10).map((trend, index) => (
              <div key={trend._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(trend._id).toLocaleDateString()}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {trend.totalConsumption.toFixed(1)} kWh
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Critical Anomalies</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {overview.criticalAnomalies}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Anomalies</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {overview.totalAnomalies}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Lines</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {overview.activeLines}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Data Points</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {overview.totalDataPoints.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Anomalies */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Anomalies
          </h3>
        </div>
        <div className="p-6">
          {recentAnomalies.length > 0 ? (
            <div className="space-y-4">
              {recentAnomalies.map((anomaly) => (
                <div key={anomaly._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity.toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {anomaly.lineName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Consumption: {anomaly.consumption.toFixed(1)} kWh (Threshold: {anomaly.threshold.toFixed(1)} kWh)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatTimestamp(anomaly.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {anomaly.resolved ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Resolved
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Recent Anomalies</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Great! No anomalies detected in the selected time range.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;