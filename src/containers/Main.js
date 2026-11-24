import React from 'react'

function Main({ children }) {
  return (
    <main className="h-full overflow-y-auto bg-gray-50 pb-20 dark:bg-gray-900 lg:pb-4">
      <div className="container grid w-full px-3 pb-24 mx-auto sm:px-4 lg:px-6 lg:pb-10">{children}</div>
    </main>
  )
}

export default Main
