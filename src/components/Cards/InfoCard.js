import React from 'react'
import { Card, CardBody } from '@windmill/react-ui'

function InfoCard({ title, value, children: icon }) {
  return (
    <Card className="dkut-panel transition-shadow hover:shadow-md">
      <CardBody className="flex items-center min-h-[112px] px-5">
        {icon}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
      </CardBody>
    </Card>
  )
}

export default InfoCard
