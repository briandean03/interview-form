import React, { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabaseClient, isSupabaseConfigured, resetSupabaseConnection } from '../lib/supabase'
import { Search, Filter, ChevronDown, Users, Save, X, Edit3, RefreshCw, User, Mail, Phone, MapPin, Calendar, Award, Briefcase, Globe, Car, Languages, GraduationCap, Clock, DollarSign, ChevronRight } from 'lucide-react'

interface Candidate {
  candidate_id: string
  first_name: string
  last_name: string
  email: string
  mobile_num?: string
  status: string
  years_experience?: string
  position_code?: string
  availability?: string
  asking_salary?: string
  visa_status?: string
  skills?: string
  education_qaulifiation?: string
  experience?: string
  honors_and_awards?: string
  languages?: string
  driving_license?: string
  nationality?: string
  qualifications?: string
  ai_evaluation?: string
  vote?: number
  application_date?: string
  created_at: string
}

const CandidateSelection: React.FC = () => {
  // Remove console.log to prevent constant logging
  
  // State declarations - no duplicates
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [editingField, setEditingField] = useState<string>('')
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking')
  
  // Use ref to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false)
  const hasInitializedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const selectedCandidateRef = useRef<Candidate | null>(null) // Add ref for selectedCandidate

  // Memoized fetch function to prevent recreation on every render
  const fetchCandidates = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...')
      return
    }

    isFetchingRef.current = true
    setConnectionStatus('checking')
    setError('')
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal
    
    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured.\n\nTo get started:\n1. Click "Connect to Supabase" in the top right corner\n2. Follow the setup instructions\n3. Your database connection will be configured automatically')
        setConnectionStatus('failed')
        return
      }

      const client = getSupabaseClient()
      if (!client) {
        setError('Failed to initialize Supabase client.\n\nPlease click "Connect to Supabase" in the top right to set up your database connection.')
        setConnectionStatus('failed')
        return
      }
      
      console.log('Attempting to connect to Supabase...')
      setConnectionStatus('connected')
      
      // Check if request was aborted
      if (signal.aborted) {
        throw new Error('Request was cancelled')
      }
      
      let data, fetchError
      try {
        const result = await client
          .from('hrta_cd00-01_resume_extraction')
          .select('*')
          .limit(50)
          .order('created_at', { ascending: false })
        
        data = result.data
        fetchError = result.error
      } catch (networkError) {
        // Handle network-level errors (Failed to fetch, etc.)
        throw new Error(`Network connection failed: ${networkError instanceof Error ? networkError.message : 'Unknown network error'}`)
      }


      if (fetchError) throw fetchError
      
      // Check if request was aborted after fetch
      if (signal.aborted) {
        return
      }
      
      setCandidates(data || [])
      if (data && data.length > 0 && !selectedCandidateRef.current) {
        setSelectedCandidate(data[0])
        selectedCandidateRef.current = data[0]
      }
      
      console.log('Successfully loaded candidates:', data?.length || 0)
    } catch (error) {
      // Don't handle aborted requests as errors
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      
      console.error('Connection error:', error)
      setConnectionStatus('failed')
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED') || error.message.includes('NetworkError')) {
          setError(`Cannot connect to Supabase database.

This usually means:
• Supabase is not configured yet
• The Supabase project URL is incorrect
• The Supabase project is paused or deleted

To fix this:
1. Click "Connect to Supabase" in the top right corner
2. Follow the setup instructions to connect your database
3. The connection will be configured automatically`)
        } else {
          setError(`Database error: ${error.message}`)
        }
      } else {
        setError('Unknown error occurred')
      }
    } finally {
      setLoading(false)
      isFetchingRef.current = false
      abortControllerRef.current = null
    }
  }, []) // Remove selectedCandidate dependency to prevent unnecessary re-renders

  // Update ref when selectedCandidate changes
  useEffect(() => {
    selectedCandidateRef.current = selectedCandidate
  }, [selectedCandidate])
  
  // Remove debug useEffect to prevent constant logging
  useEffect(() => {
    // Add a small delay to prevent blocking the initial render
    const timer = setTimeout(() => {
      // Only run once on mount
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true
        fetchCandidates()
      }
    }, 100) // Small delay to let the UI render first
    
    // Cleanup function
    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, []) // Empty dependency array - runs only once

  // Separate handlers for retry operations
  const handleRetry = useCallback(async () => {
    hasInitializedRef.current = false
    isFetchingRef.current = false
    setLoading(true)
    setError('')
    setConnectionStatus('checking')
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Small delay to prevent rapid retries
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    hasInitializedRef.current = true
    await fetchCandidates()
  }, [fetchCandidates])

  const handleResetConnection = useCallback(async () => {
    hasInitializedRef.current = false
    isFetchingRef.current = false
    setLoading(true)
    setError('')
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    try {
      resetSupabaseConnection()
      await new Promise(resolve => setTimeout(resolve, 1000))
      hasInitializedRef.current = true
      await fetchCandidates()
    } catch (error) {
      console.error('Error resetting connection:', error)
      setError('Failed to reset connection')
      setLoading(false)
    }
  }, [fetchCandidates])

  // Memoized filtered candidates to prevent unnecessary recalculations
  const filteredCandidates = React.useMemo(() => {
    return candidates.filter(candidate => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        candidate.first_name?.toLowerCase().includes(searchLower) ||
        candidate.last_name?.toLowerCase().includes(searchLower) ||
        candidate.email?.toLowerCase().includes(searchLower) ||
        candidate.position_code?.toLowerCase().includes(searchLower)
      
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter
      const matchesPosition = positionFilter === 'all' || candidate.position_code === positionFilter

      return matchesSearch && matchesStatus && matchesPosition
    })
  }, [candidates, searchTerm, statusFilter, positionFilter])

  const uniquePositions = React.useMemo(() => 
    [...new Set(candidates.map(c => c.position_code).filter(Boolean))], 
    [candidates]
  )
  
  const uniqueStatuses = React.useMemo(() => 
    [...new Set(candidates.map(c => c.status).filter(Boolean))], 
    [candidates]
  )

  const startEdit = useCallback((field: string, currentValue: any) => {
    if (!selectedCandidate) return
    setEditingField(field)
    setEditValue(currentValue?.toString() || '')
  }, [selectedCandidate])

  const cancelEdit = useCallback(() => {
    setEditingField('')
    setEditValue('')
  }, [])

  const saveEdit = useCallback(async () => {
    if (!editingField || !selectedCandidate) return

    setSaving(true)

    try {
      let updateValue: any = editValue.trim()
      
      if (editingField === 'vote') {
        updateValue = updateValue ? parseFloat(updateValue) : null
        if (updateValue !== null && (updateValue < 0 || updateValue > 10)) {
          alert('Vote must be between 0 and 10')
          return
        }
      } else if (editingField === 'email') {
        if (updateValue && !updateValue.includes('@')) {
          alert('Please enter a valid email address')
          return
        }
      }
      
      if (updateValue === '' && ['mobile_num', 'availability', 'asking_salary'].includes(editingField)) {
        updateValue = null
      }

      const client = getSupabaseClient()
      if (!client) throw new Error('Supabase client not available')

      const { error } = await client
        .from('hrta_cd00-01_resume_extraction')
        .update({ [editingField]: updateValue })
        .eq('candidate_id', selectedCandidate.candidate_id)

      if (error) throw error

      // Update local state
      const updatedCandidate = { ...selectedCandidate, [editingField]: updateValue }
      setSelectedCandidate(updatedCandidate)
      setCandidates(prev => prev.map(candidate => 
        candidate.candidate_id === selectedCandidate.candidate_id
          ? updatedCandidate
          : candidate
      ))

      setEditingField('')
      setEditValue('')
    } catch (error) {
      console.error('Error saving changes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to save changes: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }, [editingField, selectedCandidate, editValue])

  const getCandidateName = useCallback((candidate: Candidate) => {
    const fullName = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim()
    return fullName || 'Unknown Candidate'
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'CV Processed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'For Interview':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Interviewed':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Hired':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Interview Manager</h2>
            <p className="text-gray-600 mb-6">
              This is a comprehensive interview management system for tracking candidates, scheduling interviews, and managing results.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                🔗 Database Setup Required
              </p>
              <p className="text-sm text-blue-700">
                To get started, click the "Connect to Supabase" button in the top right corner to set up your database connection.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (connectionStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Testing Supabase connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidate Selection</h1>
              <p className="text-gray-600">Browse and manage candidate applications</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="all">All Positions</option>
                  {uniquePositions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-600">
                Showing {filteredCandidates.length} of {candidates.length} candidates
              </p>
            </div>
          </div>
        </div>

        {/* Two Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-300px)]">
          {/* Left Panel - Candidate Gallery */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Candidates</h3>
              <p className="text-sm text-gray-500">{filteredCandidates.length} candidates</p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredCandidates.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredCandidates.map((candidate) => (
                    <button
                      key={candidate.candidate_id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 group ${
                        selectedCandidate?.candidate_id === candidate.candidate_id
                          ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {getCandidateName(candidate)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {candidate.position_code || 'No position'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </span>
                          {candidate.vote !== null && candidate.vote !== undefined && (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                              {typeof candidate.vote === 'number' ? candidate.vote.toFixed(1) : candidate.vote}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Candidate Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {selectedCandidate ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {getCandidateName(selectedCandidate)}
                        </h2>
                        <p className="text-gray-600">{selectedCandidate.position_code || 'No position specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedCandidate.status)}`}>
                        {selectedCandidate.status}
                      </span>
                      {selectedCandidate.vote !== null && selectedCandidate.vote !== undefined && (
                        <div className="flex items-center space-x-2">
                          <Award className="h-5 w-5 text-yellow-600" />
                          <span className="text-lg font-semibold text-gray-900">
                            {typeof selectedCandidate.vote === 'number' ? selectedCandidate.vote.toFixed(1) : selectedCandidate.vote}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <span>Contact Information</span>
                        </h3>
                        <div className="space-y-4">
                          {/* Email */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            {editingField === 'email' ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="email"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  autoFocus
                                />
                                <button onClick={saveEdit} disabled={saving} className="p-2 text-green-600 hover:bg-green-50 rounded">
                                  <Save className="h-4 w-4" />
                                </button>
                                <button onClick={cancelEdit} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="group cursor-pointer hover:bg-gray-50 rounded-lg p-3 border border-gray-200 relative"
                                onClick={() => startEdit('email', selectedCandidate.email)}
                              >
                                <div className="text-sm text-gray-900">
                                  {selectedCandidate.email || 'Not provided'}
                                </div>
                                <Edit3 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 absolute top-3 right-3" />
                              </div>
                            )}
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="text-sm text-gray-900">
                                {selectedCandidate.mobile_num || 'Not provided'}
                              </div>
                            </div>
                          </div>

                          {/* Nationality */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="text-sm text-gray-900">
                                {selectedCandidate.nationality || 'Not specified'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                          <span>Professional Details</span>
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position Applied</label>
                            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="text-sm text-gray-900">
                                {selectedCandidate.position_code || 'Not specified'}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="text-sm text-gray-900">
                                {selectedCandidate.years_experience || 'Not specified'}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">AI Evaluation Score</label>
                            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="text-sm text-gray-900">
                                {selectedCandidate.vote !== null && selectedCandidate.vote !== undefined 
                                  ? `${typeof selectedCandidate.vote === 'number' ? selectedCandidate.vote.toFixed(1) : selectedCandidate.vote} / 10`
                                  : 'Not evaluated'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                  <User className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Candidate</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Choose a candidate from the gallery on the left to view their detailed information.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateSelection