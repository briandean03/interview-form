import React, { useState, useEffect } from 'react'
import { testSupabaseConnection, isSupabaseConfigured, resetSupabaseConnection } from '../lib/supabase'

interface ConnectionStatus {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  configStatus: boolean
}

const SupabaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: false, // Changed from true to false to prevent initial delay
    error: null,
    configStatus: false
  })

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const configStatus = isSupabaseConfigured()
      setStatus(prev => ({ ...prev, configStatus }))
      
      if (!configStatus) {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'Supabase environment variables not configured'
        }))
        return
      }

      await testSupabaseConnection()
      setStatus(prev => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
    }
  }

  const handleResetConnection = () => {
    resetSupabaseConnection()
    testConnection()
  }

  // Check configuration status on mount, but don't test connection automatically
  useEffect(() => {
    const configStatus = isSupabaseConfigured()
    setStatus(prev => ({ ...prev, configStatus }))
  }, [])

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Configuration:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            status.configStatus 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {status.configStatus ? 'Configured' : 'Not Configured'}
          </span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Connection:</span>
          {status.isLoading ? (
            <span className="px-2 py-1 rounded text-sm font-medium bg-yellow-600 text-white">
              Testing...
            </span>
          ) : status.isConnected ? (
            <span className="px-2 py-1 rounded text-sm font-medium bg-green-600 text-white">
              Connected
            </span>
          ) : (
            <span className="px-2 py-1 rounded text-sm font-medium bg-gray-600 text-white">
              Not Tested
            </span>
          )}
        </div>

        {/* Error Message */}
        {status.error && (
          <div className="bg-red-900 border border-red-700 rounded p-3">
            <p className="text-red-200 text-sm">{status.error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={testConnection}
            disabled={status.isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            {status.isLoading ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            onClick={handleResetConnection}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Environment Variables Info */}
        <div className="bg-gray-700 rounded p-3">
          <h3 className="text-white font-medium mb-2">Environment Variables:</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <div>
              VITE_SUPABASE_URL: {(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.trim() !== '')
                ? '✅ Set'
                : '❌ Missing'}
            </div>
            <div>
              VITE_SUPABASE_ANON_KEY: {(import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.trim() !== '')
                ? '✅ Set'
                : '❌ Missing'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupabaseConnectionTest
