import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns'
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react'

interface Candidate {
  candidate_id: string
  first_name: string
  last_name: string
  email: string
  mobile_num?: string
  position_code: string
  status: string
  vote?: number
  ai_evaluation?: string
}

interface Appointment {
  id: number
  candidate_id: string
  appointment_time: string
  position_code?: string
  q_revision?: string
  created_at: string
}

interface AppointmentWithCandidate extends Appointment {
  candidate?: Candidate
}

const InterviewBooking: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentWithCandidate[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithCandidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('hrta_cd00-01_resume_extraction')
        .select('candidate_id, first_name, last_name, email, mobile_num, position_code, status, vote, ai_evaluation')

      if (candidatesError) throw candidatesError

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('hrta_cd00-03_appointment_info')
        .select('*')
        .order('appointment_time', { ascending: true })

      if (appointmentsError) throw appointmentsError

      setCandidates(candidatesData || [])
      
      // Merge appointment data with candidate data
      const appointmentsWithCandidates = (appointmentsData || []).map(appointment => ({
        ...appointment,
        candidate: candidatesData?.find(c => c.candidate_id === appointment.candidate_id)
      }))

      setAppointments(appointmentsWithCandidates)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentsForTimeSlot = (date: Date, time: string) => {
    return appointments.filter(appointment => {
      if (!appointment.appointment_time) return false
      
      try {
        const appointmentDate = parseISO(appointment.appointment_time)
        const appointmentTime = format(appointmentDate, 'HH:mm')
        const appointmentHour = appointmentTime.substring(0, 2) + ':00'
        
        return isSameDay(appointmentDate, date) && appointmentHour === time
      } catch (error) {
        return false
      }
    })
  }

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const weekDays = getWeekDays(currentWeek)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Booking</h1>
              <p className="text-gray-600">Monitor scheduled interview appointments</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment Details Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment Details</h2>
            
            {selectedAppointment ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    {selectedAppointment.candidate ? 
                      `${selectedAppointment.candidate.first_name || ''} ${selectedAppointment.candidate.last_name || ''}`.trim() || 'Unknown Candidate'
                      : 'Unknown Candidate'
                    }
                  </h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{selectedAppointment.candidate?.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{selectedAppointment.candidate?.mobile_num || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{selectedAppointment.candidate?.position_code || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appointment Time
                    </label>
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>
                        {selectedAppointment.appointment_time ? 
                          format(parseISO(selectedAppointment.appointment_time), 'MMM d, yyyy - HH:mm')
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AI CV Evaluation
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedAppointment.candidate?.vote || 'Not evaluated'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Revision
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedAppointment.q_revision || 'Not specified'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedAppointment.candidate?.status || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Select an appointment to view details</p>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-600">
                  {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                </span>
                <button
                  onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Week Header */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div className="text-center text-sm font-medium text-gray-500 py-2">Time</div>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-8 gap-2 mb-4">
              <div></div>
              {weekDays.map(day => (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`p-2 text-center rounded-lg border transition-colors duration-200 ${
                    isSameDay(day, selectedDate)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : day.getDay() === 0 || day.getDay() === 6
                      ? 'bg-gray-100 text-gray-400 border-gray-200'
                      : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                </button>
              ))}
            </div>

            {/* Time Slots Grid */}
            <div className="space-y-2">
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-8 gap-2">
                  <div className="flex items-center justify-center text-sm font-medium text-gray-600 py-4">
                    {time}
                  </div>
                  {weekDays.map(day => {
                    const dayAppointments = getAppointmentsForTimeSlot(day, time)
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6
                    
                    return (
                      <div
                        key={`${day.toString()}-${time}`}
                        className={`min-h-[60px] border rounded-lg p-2 ${
                          isWeekend 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 3).map((appointment, index) => (
                            <button
                              key={appointment.id}
                              onClick={() => setSelectedAppointment(appointment)}
                              className={`w-full text-xs p-1 rounded text-left transition-colors duration-200 ${
                                selectedAppointment?.id === appointment.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                            >
                              <div className="truncate font-medium">
                                {appointment.candidate ? 
                                  `${appointment.candidate.first_name || ''} ${appointment.candidate.last_name || ''}`.trim() || 'Unknown'
                                  : 'Unknown'
                                }
                              </div>
                              <div className="truncate text-xs opacity-75">
                                {appointment.appointment_time ? 
                                  format(parseISO(appointment.appointment_time), 'HH:mm')
                                  : 'No time'
                                }
                              </div>
                            </button>
                          ))}
                          {dayAppointments.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayAppointments.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewBooking