import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import AppointmentSelection from './pages/AppointmentSelection'
import CandidateBooking from './pages/CandidateBooking'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<AppointmentSelection />} />
          <Route path="/appointment-selection" element={<AppointmentSelection />} />
          <Route path="/book" element={<CandidateBooking />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App