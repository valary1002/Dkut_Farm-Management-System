import React from 'react'
import { Badge } from '@windmill/react-ui'

const statusTypes = {
  Pending: 'warning',
  Confirmed: 'primary',
  Processing: 'primary',
  'Out for Delivery': 'primary',
  Delivered: 'success',
  Cancelled: 'danger',
  Shortlisted: 'success',
  Rejected: 'danger',
  Open: 'success',
  Closed: 'primary',
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger',
  Critical: 'danger',
  Reviewed: 'primary',
}

function StatusBadge({ status }) {
  return (
    <Badge type={statusTypes[status] || 'primary'}>
      {status}
    </Badge>
  )
}

export default StatusBadge
