import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Report {
  _id: string;
  type: string;
  title: string;
  description: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  parameters: any;
}

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingReports, setGeneratingReports] = useState<string[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Mock data for now since we don't have actual reports API implemented
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReports: Report[] = [
        {
          _id: '1',
          type: 'energy-consumption',
          title: 'Weekly Energy Consumption Report',
          description: 'Detailed analysis of energy consumption patterns for the past week',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
          downloadUrl: '/api/reports/1/download',
          parameters: { startDate: '2024-01-01', endDate: '2024-01-07' }
        },
        {
          _id: '2',
          type: 'anomaly-summary',
          title: 'Monthly Anomaly Summary',
          description: 'Summary of all detected anomalies and their resolutions',
          status: 'completed',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 120000).toISOString(),
          downloadUrl: '/api/reports/2/download',
          parameters: { month: '2024-01' }
        },
        {
          _id: '3',
          type: 'performance-metrics',
          title: 'System Performance Metrics',
          description: 'Comprehensive performance analysis of all monitored lines',
          status: 'generating',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          parameters: { timeRange: '30d' }
        }
      ];
      
      setReports(mockReports);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (type: string, parameters: any) => {
    try {
      setGeneratingReports(prev => [...prev, type]);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: Report = {
        _id: Date.now().toString(),
        type,
        title: getReportTitle(type),
        description: getReportDescription(type),
        status: 'generating',
        createdAt: new Date().toISOString(),
        parameters
      };
      
      setReports(prev => [newReport, ...prev]);
      setShowGenerateModal(false);
      
      // Simulate completion after 10 seconds
      setTimeout(() => {
        setReports(prev => prev.map(report => 
          report._id === newReport._id 
            ? { ...report, status: 'completed' as const, completedAt: new Date().toISOString(), downloadUrl: `/api/reports/${report._id}/download` }
            : report
        ));
      }, 10000);
      
    } catch (error: any) {
      console.error('Error generating report:', error);
      setError(error.message || 'Failed to generate report');
    } finally {
      setGeneratingReports(prev => prev.filter(id => id !== type));
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      // Mock download
      console.log(`Downloading report ${reportId}`);
      // In real implementation: await reportsApi.downloadReport(reportId);
    } catch (error: any) {
      console.error('Error downloading report:', error);
      setError(error.message || 'Failed to download report');
    }
  };

  const getReportTitle = (type: string) => {
    switch (type) {
      case 'energy-consumption': return 'Energy Consumption Report';
      case 'anomaly-summary': return 'Anomaly Summary Report';
      case 'performance-metrics': return 'Performance Metrics Report';
      case 'cost-analysis': return 'Cost Analysis Report';
      default: return 'Custom Report';
    }
  };

  const getReportDescription = (type: string) => {
    switch (type) {
      case 'energy-consumption': return 'Detailed analysis of energy consumption patterns';
      case 'anomaly-summary': return 'Summary of detected anomalies and resolutions';
      case 'performance-metrics': return 'System performance analysis';
      case 'cost-analysis': return 'Energy cost breakdown and projections';
      default: return 'Custom report analysis';
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'energy-consumption': return ChartBarIcon;
      case 'anomaly-summary': return DocumentTextIcon;
      case 'performance-metrics': return DocumentChartBarIcon;
      case 'cost-analysis': return DocumentTextIcon;
      default: return DocumentTextIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports & Analytics
        </h1>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { type: 'energy-consumption', label: 'Energy Report', icon: ChartBarIcon, color: 'blue' },
          { type: 'anomaly-summary', label: 'Anomaly Report', icon: DocumentTextIcon, color: 'red' },
          { type: 'performance-metrics', label: 'Performance Report', icon: DocumentChartBarIcon, color: 'green' },
          { type: 'cost-analysis', label: 'Cost Analysis', icon: DocumentTextIcon, color: 'purple' }
        ].map((action) => {
          const Icon = action.icon;
          const isGenerating = generatingReports.includes(action.type);
          
          return (
            <button
              key={action.type}
              onClick={() => generateReport(action.type, { timeRange: '7d' })}
              disabled={isGenerating}
              className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-${action.color}-100 rounded-lg`}>
                  <Icon className={`h-6 w-6 text-${action.color}-600`} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {isGenerating ? 'Generating...' : action.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate {action.label.toLowerCase()}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Reports
          </h3>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {reports.length > 0 ? (
            reports.map((report) => {
              const Icon = getReportIcon(report.type);
              
              return (
                <div key={report._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {report.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {report.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Created: {formatTimestamp(report.createdAt)}</span>
                          </div>
                          {report.completedAt && (
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>Completed: {formatTimestamp(report.completedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      
                      {report.status === 'completed' && report.downloadUrl && (
                        <button
                          onClick={() => downloadReport(report._id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Reports Generated
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate your first report to get started with analytics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Generate New Report
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Report Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="energy-consumption">Energy Consumption</option>
                  <option value="anomaly-summary">Anomaly Summary</option>
                  <option value="performance-metrics">Performance Metrics</option>
                  <option value="cost-analysis">Cost Analysis</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Range
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  generateReport('energy-consumption', { timeRange: '7d' });
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
