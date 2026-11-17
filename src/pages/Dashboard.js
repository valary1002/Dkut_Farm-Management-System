import React, { useState, useEffect } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'

import InfoCard from '../components/Cards/InfoCard'
import PageTitle from '../components/Typography/PageTitle'
import { CartIcon, MoneyIcon, PeopleIcon, MailIcon, ChatIcon, HeartIcon, SearchIcon } from '../icons'
import RoundIcon from '../components/RoundIcon'
import StatusBadge from '../components/StatusBadge'
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Pagination,
  Button,
} from '@windmill/react-ui'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../utils/api'
import { getProduceImage } from '../utils/produceImages'

function Dashboard() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState({})
  const [ordersPage, setOrdersPage] = useState(1)
  const [produceData, setProduceData] = useState([])
  const [ordersData, setOrdersData] = useState([])
  const [totalOrders, setTotalOrders] = useState(0)

  useEffect(() => {
    if (user?.role !== 'Customer') apiRequest('/reports/dashboard').then(setMetrics).catch(() => {})
  }, [user])

  const ordersPerPage = 6
  const producePerPage = 5

  // pagination change control for orders
  function onOrdersPageChange(p) {
    setOrdersPage(p)
  }

  useEffect(() => {
    if (user?.role === 'Customer') return
    Promise.all([apiRequest('/orders'), apiRequest('/produce')]).then(([orders, produce]) => {
      const normalizedOrders = orders.map((order) => {
        const firstItem = order.items?.[0]
        return {
          id: order.id,
          customer: order.customerName,
          produce: firstItem?.produceName || 'Multiple items',
          quantity: firstItem ? `${firstItem.quantityKg} ${firstItem.unit}` : '-',
          amount: `KES ${order.totalAmount}`,
          status: order.status.toLowerCase(),
          date: order.createdAt,
        }
      })
      setTotalOrders(normalizedOrders.length)
      setOrdersData(normalizedOrders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage))
      setProduceData(produce.slice(0, producePerPage).map((item) => ({
        ...item,
        quantity: `${item.quantityAvailable} ${item.unit}`,
        price: `KES ${item.sellingPrice}/${item.unit}`,
        status: item.quantityAvailable <= item.lowStockThreshold ? 'Low Stock' : 'In Stock',
      })))
    }).catch(() => {})
  }, [ordersPage, user])

  if (user?.role === 'Customer') return <CustomerDashboard />

  return (
    <>
      <PageTitle>Farm Management Dashboard</PageTitle>
      <p className="mb-6 text-gray-600 dark:text-gray-400">Welcome back, {user?.name || 'Administrator'}.</p>

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
        {/* Total Customers Card */}
        <Link to="/app/customers" className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
          <InfoCard title="Total Customers" value={metrics.totalCustomers || 0}>
            <RoundIcon icon={PeopleIcon} iconColorClass="text-orange-500 dark:text-orange-100" bgColorClass="bg-orange-100 dark:bg-orange-500" className="mr-4" />
          </InfoCard>
        </Link>

        {/* Total Sales Card */}
        <Link to="/app/sales" className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
          <InfoCard title="Total Sales" value={`KES ${metrics.totalSales || 0}`}>
            <RoundIcon icon={MoneyIcon} iconColorClass="text-green-500 dark:text-green-100" bgColorClass="bg-green-100 dark:bg-green-500" className="mr-4" />
          </InfoCard>
        </Link>

        {/* Available Produce Card */}
        <Link to="/app/produce" className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
          <InfoCard title="Available Produce" value={`${metrics.availableStock || 0}kg`}>
            <RoundIcon icon={CartIcon} iconColorClass="text-blue-500 dark:text-blue-100" bgColorClass="bg-blue-100 dark:bg-blue-500" className="mr-4" />
          </InfoCard>
        </Link>

        {/* Low Stock Items Card */}
        <Link to="/app/job-applications" className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
          <InfoCard title="Pending Applications" value={metrics.pendingApplications || 0}>
            <RoundIcon icon={MailIcon} iconColorClass="text-teal-500 dark:text-teal-100" bgColorClass="bg-teal-100 dark:bg-teal-500" className="mr-4" />
          </InfoCard>
        </Link>

        {/* Pending Orders Card */}
        <Link to="/app/orders" className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
          <InfoCard title="Pending Orders" value={metrics.pendingOrders || 0}>
            <RoundIcon icon={ChatIcon} iconColorClass="text-red-500 dark:text-red-100" bgColorClass="bg-red-100 dark:bg-red-500" className="mr-4" />
          </InfoCard>
        </Link>

        {/* Available Casual Jobs Card */}
        <Link to="/app/casual-jobs" className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
          <InfoCard title="Available Casual Jobs" value={metrics.availableJobs || 0}>
            <RoundIcon icon={HeartIcon} iconColorClass="text-pink-500 dark:text-pink-100" bgColorClass="bg-pink-100 dark:bg-pink-500" className="mr-4" />
          </InfoCard>
        </Link>
      </div>

      {/* Recent Orders Table */}
      <PageTitle>Recent Orders</PageTitle>
      <TableContainer className="dkut-table">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Produce</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {ordersData.map((order, i) => (
              <TableRow key={i}>
                <TableCell>
                  <span className="text-sm font-semibold">{order.id}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.customer}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.produce}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.quantity}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold">{order.amount}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={{
                    pending: 'Pending',
                    confirmed: 'Confirmed',
                    processing: 'Processing',
                    out_for_delivery: 'Out for Delivery',
                    delivered: 'Delivered',
                    cancelled: 'Cancelled',
                    success: 'Delivered',
                  }[order.status] || order.status} />
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.date}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={totalOrders}
            resultsPerPage={ordersPerPage}
            label="Recent Orders navigation"
            onChange={onOrdersPageChange}
          />
        </TableFooter>
      </TableContainer>

      {/* Available Produce Table */}
      <PageTitle className="mt-8">Available Produce</PageTitle>
      <TableContainer className="dkut-table">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Produce Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Quantity Available</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock Status</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {produceData.map((item, i) => (
              <TableRow key={i}>
                <TableCell>
                  <span className="text-sm font-semibold">{item.name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{item.category}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{item.quantity}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold">{item.price}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

function CustomerDashboard() {
  const history = useHistory()
  const location = useLocation()
  const { user } = useAuth()
  const [customerProduce, setCustomerProduce] = useState([])
  const [jobs, setJobs] = useState([])
  const searchQuery = new URLSearchParams(location.search).get('search') || ''
  const normalizedSearch = searchQuery.toLowerCase()

  useEffect(() => {
    Promise.all([apiRequest('/produce'), apiRequest('/jobs')]).then(([produce, openJobs]) => {
      setCustomerProduce(produce.map((item) => ({
        ...item,
        quantity: `${item.quantityAvailable} ${item.unit}`,
        price: `KES ${item.sellingPrice}/${item.unit}`,
        image: item.imageUrl || getProduceImage(item.name),
      })))
      setJobs(openJobs.slice(0, 3).map((job) => ({ ...job, wage: `KES ${job.dailyWage}/day` })))
    }).catch(() => {})
  }, [])

  const filteredProduce = customerProduce.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(normalizedSearch))
  const filteredJobs = jobs.filter((job) => `${job.title} ${job.activity} ${job.description}`.toLowerCase().includes(normalizedSearch))

  return (
    <>
      <PageTitle>Farm Produce & Opportunities</PageTitle>
      <p className="mb-2 text-gray-600 dark:text-gray-400">Welcome back, {user?.name || 'Customer'}.</p>
      <p className="mb-2 text-gray-600 dark:text-gray-400">
        Happy shopping! Find fresh produce for your next meal.
      </p>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        You can also discover flexible farm jobs and apply in a few simple steps.
      </p>
      <div className="flex items-center mb-8 border rounded-lg dark:border-gray-600">
        <SearchIcon className="w-5 h-5 ml-3 text-gray-400" aria-hidden="true" />
        <span className="px-3 text-sm text-gray-500 dark:text-gray-400">
          {searchQuery ? `Showing results for "${searchQuery}"` : 'Use the search bar above to filter produce and jobs.'}
        </span>
      </div>

      <PageTitle>Available Farm Produce</PageTitle>
      <div className="grid gap-6 mb-10 md:grid-cols-2 xl:grid-cols-3">
        {filteredProduce.slice(0, 2).map((item) => (
          <div key={item.name} className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
            <img className="object-cover w-full h-44" src={item.image} alt={item.name} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.name}</h3>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{item.price}</span>
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{item.category} • {item.quantity} available</p>
              <Button block onClick={() => history.push('/app/purchase', { item })}>Purchase {item.name}</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-10">
        <Link className="text-sm font-semibold text-green-600 hover:underline dark:text-green-400" to="/app/produce">Browse all available produce</Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <PageTitle>Casual Jobs</PageTitle>
        <Link className="text-sm font-semibold text-green-600 hover:underline dark:text-green-400" to="/app/casual-jobs">View all jobs</Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {filteredJobs.map((job) => (
          <div
            key={job.id || job.title}
            className="cursor-pointer rounded-lg bg-white p-5 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
            role="link"
            tabIndex="0"
            onClick={() => history.push('/app/casual-jobs')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') history.push('/app/casual-jobs')
            }}
            aria-label={`View available job: ${job.title}`}
          >
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">{job.title}</h3>
            <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">{job.activity}</p>
            <p className="mb-4 text-sm font-semibold text-green-600 dark:text-green-400">{job.wage}</p>
            <Link className="text-sm font-semibold text-green-600 hover:underline dark:text-green-400" to="/app/casual-jobs">View opportunity</Link>
          </div>
        ))}
      </div>
    </>
  )
}

export default Dashboard
