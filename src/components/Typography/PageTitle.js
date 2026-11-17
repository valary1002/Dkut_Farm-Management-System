import React from 'react'

function PageTitle({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-4 pt-7 pb-5 ${className}`}>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">{children}</h1>
    </div>
  )
}

export default PageTitle
