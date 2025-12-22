import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO, isToday, isBefore, startOfDay, isAfter } from 'date-fns'
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'
import { Calendar, Clock, ChevronLeft, ChevronRight, User, Mail, Phone, MapPin, Globe, CheckCircle2, AlertCircle, Edit2, Trash2, X } from 'lucide-react'
import { addMonths } from 'date-fns'


interface Candidate {
  candidate_id: string
  first_name: string
  last_name: string
  email: string
  mobile_num?: string
  position_code: string
  status: string
  vote?: number
}

interface TimeSlot {
  time: string
  available: boolean
}

interface Appointment {
  id: number
  candidate_id: string
  appointment_time: string
  position_code?: string
  q_revision?: string
  created_at: string
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  { value: 'America/New_York', label: 'EST (Eastern Standard Time)', offset: '-05:00' },
  { value: 'America/Chicago', label: 'CST (Central Standard Time)', offset: '-06:00' },
  { value: 'America/Los_Angeles', label: 'PST (Pacific Standard Time)', offset: '-08:00' },
  { value: 'Europe/London', label: 'GMT (London)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'CET (Central European Time)', offset: '+01:00' },
  { value: 'Asia/Dubai', label: 'GST (Gulf Standard Time)', offset: '+04:00' },
  { value: 'Asia/Singapore', label: 'SGT (Singapore Time)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)', offset: '+09:00' },
  { value: 'Australia/Sydney', label: 'AEDT (Australian Eastern Time)', offset: '+11:00' },
]

const AppointmentSelection: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedTimezone, setSelectedTimezone] = useState<string>('Asia/Dubai')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string>('')
  const [existingAppointment, setExistingAppointment] = useState<Appointment | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '12:00', available: true },
    { time: '13:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
    { time: '17:00', available: true },
    { time: '18:00', available: true },
  ]

  useEffect(() => {
    fetchCandidates()
  }, [])

  useEffect(() => {
    if (selectedCandidate) {
      checkExistingAppointment()
    }
  }, [selectedCandidate, selectedTimezone])

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('hrta_cd00-01_resume_extraction')
        .select('candidate_id, first_name, last_name, email, mobile_num, position_code, status, vote')
        .eq('status', 'For Interview')
        .order('vote', { ascending: false })

      if (error) throw error

      setCandidates(data || [])
      if (data && data.length > 0) {
        setSelectedCandidate(data[0])
      }
    } catch (error) {
      console.error('Error fetching candidates:', error)
      setError('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const checkExistingAppointment = async () => {
    if (!selectedCandidate) return

    try {
      const { data, error } = await supabase
        .from('hrta_cd00-03_appointment_info')
        .select('*')
        .eq('candidate_id', selectedCandidate.candidate_id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setExistingAppointment(data)
        const appointmentDateUTC = parseISO(data.appointment_time)
        const appointmentDateInSelectedTZ = toZonedTime(appointmentDateUTC, selectedTimezone)
        setSelectedDate(appointmentDateInSelectedTZ)
        setSelectedTime(format(appointmentDateInSelectedTZ, 'HH:mm'))
      } else {
        setExistingAppointment(null)
        setSelectedDate(null)
        setSelectedTime('')
      }
      setIsEditMode(false)
    } catch (error) {
      console.error('Error checking existing appointment:', error)
    }
  }

  const handleSubmitAppointment = async () => {
    if (!selectedCandidate || !selectedDate || !selectedTime) {
      setError('Please select a date and time')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`
      const localDateTime = new Date(dateTimeString)
      const utcDateTime = fromZonedTime(localDateTime, selectedTimezone)
      const appointmentDateTime = utcDateTime.toISOString()

      if (existingAppointment) {
        const { error: updateError } = await supabase
          .from('hrta_cd00-03_appointment_info')
          .update({
            appointment_time: appointmentDateTime,
            position_code: selectedCandidate.position_code,
          })
          .eq('id', existingAppointment.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('hrta_cd00-03_appointment_info')
          .insert({
            candidate_id: selectedCandidate.candidate_id,
            appointment_time: appointmentDateTime,
            position_code: selectedCandidate.position_code,
          })

        if (insertError) throw insertError
      }

      setSuccess(true)
      setIsEditMode(false)
      await checkExistingAppointment()
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error saving appointment:', error)
      setError('Failed to save appointment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAppointment = async () => {
    if (!existingAppointment) return

    setSubmitting(true)
    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('hrta_cd00-03_appointment_info')
        .delete()
        .eq('id', existingAppointment.id)

      if (deleteError) throw deleteError

      setExistingAppointment(null)
      setSelectedDate(null)
      setSelectedTime('')
      setShowDeleteConfirm(false)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error deleting appointment:', error)
      setError('Failed to delete appointment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    if (existingAppointment) {
      const appointmentDate = parseISO(existingAppointment.appointment_time)
      setSelectedDate(appointmentDate)
      setSelectedTime(format(appointmentDate, 'HH:mm'))
    }
    setIsEditMode(false)
  }

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = []
    let currentDate = startDate

    while (currentDate <= endDate) {
      days.push(currentDate)
      currentDate = addDays(currentDate, 1)
    }

    return days
  }

  const nextMonth = () => {
  setCurrentMonth(addMonths(currentMonth, 1))
}

const previousMonth = () => {
  setCurrentMonth(addMonths(currentMonth, -1))
}


  const getCandidateName = (candidate: Candidate) => {
    return `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Unknown Candidate'
  }

const isDateDisabled = (date: Date) => {
  const today = startOfDay(new Date());
  const day = startOfDay(date);

  return (
    isBefore(day, today) ||   // No past dates
    day.getDay() === 0 ||     // Sunday ❌
    day.getDay() === 6        // Saturday ❌
  );
};





  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Candidates Available</h3>
          <p className="text-gray-600">There are no candidates with status "For Interview" at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Appointment Selection</h1>
              <p className="text-gray-600">Select a date and time for your interview appointment</p>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-900 font-medium">
                {existingAppointment ? 'Appointment Updated Successfully!' : 'Appointment Scheduled Successfully!'}
              </p>
              <p className="text-green-700 text-sm">
                {existingAppointment ? 'Your interview has been updated.' : 'Your interview has been confirmed.'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-900">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Select Candidate</span>
              </h2>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {candidates.map((candidate) => (
                  <button
                    key={candidate.candidate_id}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedCandidate?.candidate_id === candidate.candidate_id
                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{getCandidateName(candidate)}</p>
                        <p className="text-sm text-gray-600">{candidate.position_code}</p>
                      </div>
                      {candidate.vote !== null && candidate.vote !== undefined && (
                        <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 text-yellow-800 rounded-full">
                          <span className="text-sm font-semibold">
                            {typeof candidate.vote === 'number' ? candidate.vote.toFixed(1) : candidate.vote}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedCandidate && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{selectedCandidate.email}</span>
                  </div>
                  {selectedCandidate.mobile_num && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{selectedCandidate.mobile_num}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{selectedCandidate.position_code}</span>
                  </div>
                </div>

                {existingAppointment && !isEditMode && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">Current Appointment</p>
                      <p className="text-sm text-blue-800">
                        {format(parseISO(existingAppointment.appointment_time), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-blue-800">
                        {format(parseISO(existingAppointment.appointment_time), 'HH:mm')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Change</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}

                {getDaysInMonth().map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const isDisabled = isDateDisabled(day) || (existingAppointment && !isEditMode)
                  const isTodayDate = isToday(day)

                  return (
                    <button
                      key={index}
                      onClick={() => !isDisabled && setSelectedDate(day)}
                      disabled={isDisabled}
                      className={`
                        aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${!isCurrentMonth ? 'text-gray-300' : ''}
                        ${isDisabled && !isSelected ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                        ${isDisabled && isSelected ? 'bg-blue-600 text-white cursor-not-allowed' : ''}
                        ${!isDisabled && isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        ${!isDisabled && !isSelected ? 'hover:bg-blue-50' : ''}
                        ${isTodayDate && !isSelected ? 'border-2 border-blue-600 text-blue-600' : ''}
                        ${!isDisabled && !isSelected && isCurrentMonth ? 'bg-white border border-gray-200' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Note:</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>Appointments can only be scheduled within 14 days</li>
                      <li>Weekends are not available for scheduling</li>
                      <li>Past dates cannot be selected</li>
                      <li>Today's date is highlighted with a blue border</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {selectedDate && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Select Time Slot</span>
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span>Timezone</span>
                  </label>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    disabled={existingAppointment && !isEditMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label} ({tz.offset})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {timeSlots.map((slot) => {
                    const isSlotDisabled = !slot.available || (existingAppointment && !isEditMode)
                    return (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={isSlotDisabled}
                        className={`
                          py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200
                          ${isSlotDisabled && selectedTime !== slot.time ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                          ${isSlotDisabled && selectedTime === slot.time ? 'bg-blue-600 text-white cursor-not-allowed' : ''}
                          ${!isSlotDisabled && selectedTime === slot.time ? 'bg-blue-600 text-white shadow-md' : ''}
                          ${!isSlotDisabled && selectedTime !== slot.time ? 'bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50' : ''}
                        `}
                      >
                        {slot.time}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (existingAppointment ? isEditMode : true) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Candidate:</span>
                    <span className="font-medium text-gray-900">
                      {selectedCandidate ? getCandidateName(selectedCandidate) : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Timezone:</span>
                    <span className="font-medium text-gray-900">
                      {TIMEZONES.find(tz => tz.value === selectedTimezone)?.label}
                    </span>
                  </div>
                </div>

                {isEditMode && existingAppointment ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitAppointment}
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Updating...' : 'Update Appointment'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitAppointment}
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Scheduling...' : 'Confirm Appointment'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Appointment</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this appointment? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAppointment}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentSelection
