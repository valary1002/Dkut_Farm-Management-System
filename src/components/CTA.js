import React from 'react'
import { Link } from 'react-router-dom'

function CTA() {
  return (
    <Link
      className="flex items-center justify-between p-4 mb-8 text-sm font-semibold text-green-100 bg-green-600 rounded-lg shadow-md focus:outline-none focus:shadow-outline-green"
      to="/app/dashboard"
    >
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3.5c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5zm0 12c-3.03 0-5.5-2.47-5.5-5.5S6.97 4.5 10 4.5s5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5zm2.5-5.5c0 1.38-1.12 2.5-2.5 2.5S7 11.38 7 10s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5z"></path>
        </svg>
        <span>Welcome to DKUT Farm Management System</span>
      </div>
      <span>
        Get started <span dangerouslySetInnerHTML={{ __html: '&RightArrow;' }}></span>
      </span>
    </Link>
  )
}

export default CTA
