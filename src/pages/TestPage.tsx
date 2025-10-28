import React, { useState, useEffect } from 'react'

const TestPage: React.FC = () => {
  const [count, setCount] = useState(0)
  const [renderTime, setRenderTime] = useState<Date | null>(null)
  
  useEffect(() => {
    setRenderTime(new Date())
  }, [])
  
  // Remove console.log to prevent constant logging
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="mb-4">This is a simple test to check for refresh issues.</p>
        <p className="mb-4">Render count: {count}</p>
        <p className="mb-4">Last render time: {renderTime?.toLocaleTimeString()}</p>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Increment Count
        </button>
      </div>
    </div>
  )
}

export default TestPage
