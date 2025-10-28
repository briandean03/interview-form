import React, { useState, useEffect } from 'react'
import { Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

interface ActivityLog {
  id: string
  created_at: string
  current_status: string
  candidate_id: string
  execution_id: number | null
}

interface CandidateInfo {
  first_name: string
  last_name: string
  email: string
}

const Reports: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [candidateId, setCandidateId] = useState<string>('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('candidate_id')

    if (id) {
      setCandidateId(id)
      fetchCandidateActivities(id)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCandidateActivities = async (id: string) => {
    try {
      setLoading(true)

      const { data: candidateData, error: candidateError } = await supabase
        .from('hrta_cd00-01_resume_extraction')
        .select('first_name, last_name, email')
        .eq('candidate_id', id)
        .maybeSingle()

      if (candidateError) throw candidateError

      if (candidateData) {
        setCandidateInfo(candidateData)
      }

      const { data: activityData, error: activityError } = await supabase
        .from('hrta_sd00-09_execution_log')
        .select('*')
        .eq('candidate_id', id)
        .order('created_at', { ascending: false })

      if (activityError) throw activityError

      setActivities(activityData || [])
    } catch (error) {
      console.error('Error fetching candidate activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower.includes('interviewed') || statusLower.includes('completed')) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    } else if (statusLower.includes('error') || statusLower.includes('failed')) {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    }
    return <Activity className="h-5 w-5 text-blue-600" />
  }

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower.includes('interviewed') || statusLower.includes('completed')) {
      return 'bg-green-50 text-green-700 border-green-200'
    } else if (statusLower.includes('scheduled') || statusLower.includes('appointment')) {
      return 'bg-blue-50 text-blue-700 border-blue-200'
    } else if (statusLower.includes('waiting') || statusLower.includes('pending')) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    } else if (statusLower.includes('sent') || statusLower.includes('initiated')) {
      return 'bg-purple-50 text-purple-700 border-purple-200'
    } else if (statusLower.includes('captured') || statusLower.includes('answer')) {
      return 'bg-teal-50 text-teal-700 border-teal-200'
    } else if (statusLower.includes('for interview')) {
      return 'bg-orange-50 text-orange-700 border-orange-200'
    }
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const formatDateTime = (dateString: string) => {
    try {
      return formatInTimeZone(new Date(dateString), 'UTC', 'MMM dd, yyyy HH:mm:ss')
    } catch {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss')
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return formatDateTime(dateString)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your activity...</p>
        </div>
      </div>
    )
  }

  if (!candidateId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Candidate ID</h2>
          <p className="text-gray-600">
            Please access this page with a valid candidate ID parameter.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {candidateInfo ? `${candidateInfo.first_name} ${candidateInfo.last_name}` : 'Your Activity'}
              </h1>
              {candidateInfo && (
                <p className="text-gray-600">{candidateInfo.email}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Track your interview progress and activity timeline
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Activity Timeline</h2>
            <p className="text-sm text-gray-600 mt-1">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'} recorded
            </p>
          </div>

          {activities.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No activities recorded yet</p>
              <p className="text-sm text-gray-500 mt-2">Your interview activities will appear here</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="relative">
                <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="relative flex items-start space-x-4">
                      <div className="relative z-10 flex-shrink-0">
                        <div className="w-14 h-14 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                          {getStatusIcon(activity.current_status)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 pb-6">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(activity.current_status)}`}>
                              {activity.current_status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(activity.created_at)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{formatDateTime(activity.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Need Help?</h3>
              <p className="text-sm text-blue-700 mt-1">
                If you have any questions about your interview process, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
