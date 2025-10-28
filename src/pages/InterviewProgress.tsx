import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Calendar, User, FileText } from 'lucide-react';
import { supabase, isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';
import StatusBadge from '../components/StatusBadge';

interface ProgressLog {
  id: string;
  activity_id: string;
  activity_name: string;
  status: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  notes?: string;
}

const InterviewProgress: React.FC = () => {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  const fetchData = async () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured. Please set up your environment variables.');
      setConnectionStatus('disconnected');
      setLoading(false);
      return;
    }

    try {
      // Test connection first
      await testSupabaseConnection();
      setConnectionStatus('connected');

      // Fetch progress logs from actual database tables
      const { data, error: fetchError } = await supabase
        .from('dgt_dbp6bd06dynamicactualdata')
        .select('*')
        .order('dgt_dbp6bd06dynamicactualdataid', { ascending: false })
        .limit(10);

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to match our interface
      const transformedLogs: ProgressLog[] = (data || []).map((item, index) => ({
        id: item.dgt_dbp6bd06dynamicactualdataid,
        activity_id: item.dgt_activityid || `activity-${index}`,
        activity_name: `Activity ${item.dgt_activityid || index + 1}`,
        status: item.dgt_actualstart ? (item.dgt_actualfinish ? 'completed' : 'in-progress') : 'pending',
        progress_percentage: item.dgt_pctcomplete || 0,
        created_at: item.dgt_actualstart || new Date().toISOString(),
        updated_at: item.dgt_actualfinish || new Date().toISOString(),
        notes: `Progress: ${item.dgt_pctcomplete || 0}%`
      }));

      setLogs(transformedLogs);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Error fetching data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredLogs = logs.filter(log => log.activity_id && log.activity_name);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Progress Monitor</h1>
          <p className="text-gray-600">Track the status and progress of ongoing interviews</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="font-medium text-gray-900">
                  Database Connection: {connectionStatus === 'connected' ? 'Connected' : 
                                      connectionStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
                </span>
              </div>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500 mt-1" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-800 mb-2">Database Connection Error</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-red-800 mb-2">To fix this issue:</h4>
                  <ol className="list-decimal list-inside text-sm text-red-700 space-y-1">
                    <li>Click the "Connect to Supabase" button in the top right corner</li>
                    <li>Enter your Supabase project URL and API key</li>
                    <li>Ensure your Supabase project is active and not paused</li>
                    <li>Check that your database tables exist and have the correct permissions</li>
                  </ol>
                </div>
                <button
                  onClick={handleResetConnection}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reset Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
            </div>
            {filteredLogs.length > 0 ? (
              <div className="space-y-3">
                {filteredLogs.slice(0, 3).map((log, index) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium text-gray-900">{log.activity_name}</p>
                        <p className="text-sm text-gray-500">{log.progress_percentage}% complete</p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No progress data available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Active Activities</h2>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {filteredLogs.filter(log => log.status === 'in-progress').length}
              </div>
              <p className="text-gray-500">Currently in progress</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Completed</h2>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {filteredLogs.filter(log => log.status === 'completed').length}
              </div>
              <p className="text-gray-500">Activities finished</p>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Progress Timeline</h2>
            </div>
          </div>
          
          <div className="p-6">
            {filteredLogs.length > 0 ? (
              <div className="space-y-4">
                {filteredLogs.map((log, index) => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{log.activity_name}</h3>
                        <div className="flex items-center space-x-2">
                          {index === 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Latest
                            </span>
                          )}
                          <StatusBadge status={log.status} />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(log.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{log.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${log.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      {log.notes && (
                        <p className="text-gray-600 text-sm">{log.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data</h3>
                <p className="text-gray-500">No progress logs found. Check your database connection.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewProgress;