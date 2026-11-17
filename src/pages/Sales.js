import React, { useState, useEffect } from 'react'

import PageTitle from '../components/Typography/PageTitle'
import InfoCard from '../components/Cards/InfoCard'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableFooter,
  Badge,
  Pagination,
  Input,
  Label,
  Select,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  HelperText,
} from '@windmill/react-ui'
import { SearchIcon, MoneyIcon, CartIcon, ChartsIcon } from '../icons'
import { apiRequest } from '../utils/api'

// Sales data with realistic dummy transactions
const initialSalesData = [
  {
    id: 'SALE001',
    produceId: 'PROD001',
    produceName: 'Tomatoes',
    quantitySold: 5,
    unit: 'kg',
    customer: 'John Kipchoge',
    unitPrice: 50,
    totalAmount: 250,
    status: 'completed',
    date: '2026-08-31',
    time: '14:30',
  },
  {
    id: 'SALE002',
    produceId: 'PROD002',
    produceName: 'Maize',
    quantitySold: 10,
    unit: 'kg',
    customer: 'Mary Wanjiru',
    unitPrice: 45,
    totalAmount: 450,
    status: 'completed',
    date: '2026-08-31',
    time: '15:00',
  },
  {
    id: 'SALE003',
    produceId: 'PROD003',
    produceName: 'Bananas',
    quantitySold: 3,
    unit: 'bunches',
    customer: 'Peter Koech',
    unitPrice: 200,
    totalAmount: 600,
    status: 'completed',
    date: '2026-08-31',
    time: '10:15',
  },
  {
    id: 'SALE004',
    produceId: 'PROD001',
    produceName: 'Tomatoes',
    quantitySold: 8,
    unit: 'kg',
    customer: 'Grace Mutua',
    unitPrice: 50,
    totalAmount: 400,
    status: 'completed',
    date: '2026-08-30',
    time: '16:45',
  },
  {
    id: 'SALE005',
    produceId: 'PROD007',
    produceName: 'Beans',
    quantitySold: 6,
    unit: 'kg',
    customer: 'Samuel Kipketer',
    unitPrice: 120,
    totalAmount: 720,
    status: 'completed',
    date: '2026-08-30',
    time: '12:30',
  },
  {
    id: 'SALE006',
    produceId: 'PROD006',
    produceName: 'Milk',
    quantitySold: 15,
    unit: 'liters',
    customer: 'Angela Ndirangu',
    unitPrice: 60,
    totalAmount: 900,
    status: 'completed',
    date: '2026-08-30',
    time: '09:00',
  },
  {
    id: 'SALE007',
    produceId: 'PROD008',
    produceName: 'Apples',
    quantitySold: 4,
    unit: 'kg',
    customer: 'David Kipchoge',
    unitPrice: 350,
    totalAmount: 1400,
    status: 'completed',
    date: '2026-08-29',
    time: '14:20',
  },
  {
    id: 'SALE008',
    produceId: 'PROD004',
    produceName: 'Coffee Beans',
    quantitySold: 2,
    unit: 'kg',
    customer: 'Faith Chemeli',
    unitPrice: 800,
    totalAmount: 1600,
    status: 'completed',
    date: '2026-08-29',
    time: '11:10',
  },
  {
    id: 'SALE009',
    produceId: 'PROD001',
    produceName: 'Tomatoes',
    quantitySold: 3,
    unit: 'kg',
    customer: 'Robert Kiplagat',
    unitPrice: 50,
    totalAmount: 150,
    status: 'completed',
    date: '2026-08-28',
    time: '15:50',
  },
  {
    id: 'SALE010',
    produceId: 'PROD002',
    produceName: 'Maize',
    quantitySold: 20,
    unit: 'kg',
    customer: 'Alice Mwangi',
    unitPrice: 45,
    totalAmount: 900,
    status: 'completed',
    date: '2026-08-28',
    time: '13:40',
  },
]

function Sales() {
  void initialSalesData
  const [sales, setSales] = useState([])
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduce, setSelectedProduce] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    produceName: '',
    quantitySold: '',
    customer: '',
    unitPrice: '',
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    apiRequest('/reports/sales').then((items) => setSales(items.map((item) => ({
      ...item,
      quantitySold: Number(item.quantitySold),
      unitPrice: Number(item.unitPrice),
      totalAmount: Number(item.totalAmount),
      status: item.status.toLowerCase(),
      date: item.createdAt,
      time: item.createdAt,
    })))).catch((requestError) => setLoadError(requestError.message))
  }, [])

  const itemsPerPage = 8

  // Get unique produce names for filter
  const producesForFilter = [...new Set(sales.map((s) => s.produceName))].sort()

  // Filter and search logic
  const filteredSales = sales.filter((item) => {
    const matchesSearch =
      item.produceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProduce = selectedProduce === '' || item.produceName === selectedProduce
    return matchesSearch && matchesProduce
  })

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate sales statistics
  const salesStats = {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + s.totalAmount, 0),
    averageTransactionValue: Math.round(
      sales.reduce((sum, s) => sum + s.totalAmount, 0) / sales.length
    ),
    topProduceCount: {},
  }

  // Calculate top selling produce
  sales.forEach((sale) => {
    salesStats.topProduceCount[sale.produceName] =
      (salesStats.topProduceCount[sale.produceName] || 0) + sale.quantitySold
  })

  // Modal handlers
  const openAddSaleModal = () => {
    setFormData({
      produceName: '',
      quantitySold: '',
      customer: '',
      unitPrice: '',
    })
    setFormErrors({})
    setIsAddSaleModalOpen(true)
  }

  const closeAddSaleModal = () => {
    setIsAddSaleModalOpen(false)
  }

  // Validation
  const validateForm = () => {
    const errors = {}
    if (!formData.produceName) errors.produceName = 'Produce name is required'
    if (!formData.quantitySold) errors.quantitySold = 'Quantity is required'
    if (isNaN(formData.quantitySold) || parseFloat(formData.quantitySold) <= 0)
      errors.quantitySold = 'Quantity must be a positive number'
    if (!formData.customer.trim()) errors.customer = 'Customer name is required'
    if (!formData.unitPrice) errors.unitPrice = 'Unit price is required'
    if (isNaN(formData.unitPrice) || parseFloat(formData.unitPrice) <= 0)
      errors.unitPrice = 'Unit price must be a positive number'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Add new sale
  const handleAddSale = () => {
    if (!validateForm()) return

    const newSale = {
      id: `SALE${String(sales.length + 1).padStart(3, '0')}`,
      produceId: `PROD00${sales.length}`, // Simplified for demo
      produceName: formData.produceName,
      quantitySold: parseFloat(formData.quantitySold),
      unit: 'kg', // Default unit
      customer: formData.customer,
      unitPrice: parseFloat(formData.unitPrice),
      totalAmount: parseFloat(formData.quantitySold) * parseFloat(formData.unitPrice),
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    }

    setSales([newSale, ...sales])
    closeAddSaleModal()
    setCurrentPage(1)
  }

  // Get status badge color
  const getStatusBadgeLayout = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'danger'
      default:
        return 'primary'
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
  }

  return (
    <>
      <PageTitle>Sales Analytics</PageTitle>
      {loadError && <p className="mb-4 text-red-600">{loadError}</p>}

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard title="Total Sales" value={sales.length}>
          <CartIcon className="w-5 h-5 text-blue-500" />
        </InfoCard>
        <InfoCard title="Total Revenue" value={formatCurrency(salesStats.totalRevenue)}>
          <MoneyIcon className="w-5 h-5 text-green-500" />
        </InfoCard>
        <InfoCard title="Avg. Transaction" value={formatCurrency(salesStats.averageTransactionValue)}>
          <ChartsIcon className="w-5 h-5 text-amber-500" />
        </InfoCard>
      </div>

      {/* Header Section with Add Button */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            View Sales Transactions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track sales, revenue, and customer purchases
          </p>
        </div>
        <Button onClick={openAddSaleModal}>Record New Sale</Button>
      </div>

      {/* Search and Filter Section */}
      <div className="grid gap-4 mb-8 md:grid-cols-2">
        {/* Search Field */}
        <div className="flex items-center">
          <Label className="flex items-center w-full">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-2">
              Search
            </span>
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search by produce or customer..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <SearchIcon />
              </div>
            </div>
          </Label>
        </div>

        {/* Produce Filter */}
        <div className="flex items-center">
          <Label className="flex items-center w-full">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-2">
              Produce
            </span>
            <Select
              value={selectedProduce}
              onChange={(e) => {
                setSelectedProduce(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">All Produce</option>
              {producesForFilter.map((produce) => (
                <option key={produce} value={produce}>
                  {produce}
                </option>
              ))}
            </Select>
          </Label>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {paginatedSales.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
        {Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length} sales
        transactions
      </div>

      {/* Sales Table */}
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Sale ID</TableCell>
              <TableCell>Produce</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date & Time</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSales.length > 0 ? (
              paginatedSales.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="text-sm font-semibold">{item.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.produceName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {item.quantitySold} {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.customer}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold">{formatCurrency(item.unitPrice)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(item.totalAmount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge type={getStatusBadgeLayout(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.date} {item.time}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="8" className="text-center py-8">
                  <span className="text-gray-600 dark:text-gray-400">No sales found</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={filteredSales.length}
            resultsPerPage={itemsPerPage}
            label="Table navigation"
            onChange={(p) => setCurrentPage(p)}
          />
        </TableFooter>
      </TableContainer>

      {/* Add Sale Modal */}
      <Modal isOpen={isAddSaleModalOpen} onClose={closeAddSaleModal}>
        <ModalHeader>Record New Sale</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Produce Name */}
            <Label>
              <span className="font-semibold">Produce Name</span>
              <Input
                className="mt-1"
                placeholder="e.g., Tomatoes"
                value={formData.produceName}
                onChange={(e) => setFormData({ ...formData, produceName: e.target.value })}
                valid={!formErrors.produceName}
              />
              {formErrors.produceName && (
                <HelperText valid={false}>{formErrors.produceName}</HelperText>
              )}
            </Label>

            {/* Quantity Sold */}
            <Label>
              <span className="font-semibold">Quantity Sold</span>
              <Input
                className="mt-1"
                type="number"
                placeholder="e.g., 5"
                value={formData.quantitySold}
                onChange={(e) => setFormData({ ...formData, quantitySold: e.target.value })}
                valid={!formErrors.quantitySold}
              />
              {formErrors.quantitySold && (
                <HelperText valid={false}>{formErrors.quantitySold}</HelperText>
              )}
            </Label>

            {/* Customer Name */}
            <Label>
              <span className="font-semibold">Customer Name</span>
              <Input
                className="mt-1"
                placeholder="e.g., John Doe"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                valid={!formErrors.customer}
              />
              {formErrors.customer && (
                <HelperText valid={false}>{formErrors.customer}</HelperText>
              )}
            </Label>

            {/* Unit Price */}
            <Label>
              <span className="font-semibold">Unit Price (KES)</span>
              <Input
                className="mt-1"
                type="number"
                placeholder="e.g., 50"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                valid={!formErrors.unitPrice}
              />
              {formErrors.unitPrice && (
                <HelperText valid={false}>{formErrors.unitPrice}</HelperText>
              )}
            </Label>

            {/* Total Amount Display */}
            {formData.quantitySold && formData.unitPrice && (
              <div className="p-3 bg-green-50 dark:bg-green-900 rounded-md border border-green-200 dark:border-green-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Amount:{' '}
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(
                      parseFloat(formData.quantitySold) * parseFloat(formData.unitPrice)
                    )}
                  </span>
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={closeAddSaleModal}>
              Cancel
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleAddSale}>Record Sale</Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeAddSaleModal}>
              Cancel
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleAddSale}>
              Record Sale
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Information Section */}
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
          Sales Integration Notes
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            ✓ <strong>Real-time Tracking:</strong> All sales are recorded with timestamp and
            customer details
          </li>
          <li>
            ✓ <strong>Revenue Calculation:</strong> Automatically calculates total amount (Quantity
            × Unit Price)
          </li>
          <li>
            ✓ <strong>Inventory Connection:</strong> Sales will reduce inventory when backend is
            connected
          </li>
          <li>
            ✓ <strong>Produce Tracking:</strong> Links each sale to specific produce items for
            analytics
          </li>
          <li>
            <span role="img" aria-label="information">💡</span> Use "Record New Sale" to simulate customer purchases. In production, this will
            automatically deduct from inventory.
          </li>
        </ul>
      </div>
    </>
  )
}

export default Sales
