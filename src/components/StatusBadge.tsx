import React from 'react'

interface StatusBadgeProps {
  status: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CV Processed':
        return 'bg-yellow-100 text-yellow-800'
      case 'For Interview':
        return 'bg-blue-100 text-blue-800'
      case 'Interviewed':
        return 'bg-purple-100 text-purple-800'
      case 'Hired':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  )
}

export default StatusBadge