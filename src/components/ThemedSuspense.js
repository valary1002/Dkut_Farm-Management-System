import React from 'react'

function ThemedSuspense() {
  return (
    <div className="flex w-full min-h-64 items-center justify-center p-6 text-gray-600 dark:text-gray-400">
      <div className="text-center" role="status" aria-live="polite">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
        <p className="mt-3 text-sm font-medium">Loading farm workspace...</p>
      </div>
    </div>
  )
}

export default ThemedSuspense
