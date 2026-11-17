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
  Pagination,
  Input,
  Label,
  Select,
} from '@windmill/react-ui'
import { SearchIcon, CartIcon } from '../icons'
import { apiRequest } from '../utils/api'
import StatusBadge from '../components/StatusBadge'

// Inventory data - linked to Produce module
const initialInventoryData = [
  {
    id: 'INV001',
    produceId: 'PROD001',
    produceName: 'Tomatoes',
    category: 'Vegetables',
    currentStock: 120,
    reorderLevel: 50,
    unit: 'kg',
    lastUpdated: '2026-08-31 14:30',
    status: 'In Stock',
  },
  {
    id: 'INV002',
    produceId: 'PROD002',
    produceName: 'Maize',
    category: 'Cereals',
    currentStock: 450,
    reorderLevel: 100,
    unit: 'kg',
    lastUpdated: '2026-08-31 10:15',
    status: 'In Stock',
  },
  {
    id: 'INV003',
    produceId: 'PROD003',
    produceName: 'Bananas',
    category: 'Fruits',
    currentStock: 85,
    reorderLevel: 40,
    unit: 'bunches',
    lastUpdated: '2026-08-30 16:45',
    status: 'In Stock',
  },
  {
    id: 'INV004',
    produceId: 'PROD004',
    produceName: 'Coffee Beans',
    category: 'Coffee',
    currentStock: 25,
    reorderLevel: 50,
    unit: 'kg',
    lastUpdated: '2026-08-31 09:00',
    status: 'Low Stock',
  },
  {
    id: 'INV005',
    produceId: 'PROD005',
    produceName: 'Black Pepper',
    category: 'Spices',
    currentStock: 12,
    reorderLevel: 30,
    unit: 'kg',
    lastUpdated: '2026-08-30 12:20',
    status: 'Out of Stock',
  },
  {
    id: 'INV006',
    produceId: 'PROD006',
    produceName: 'Milk',
    category: 'Dairy',
    currentStock: 200,
    reorderLevel: 80,
    unit: 'liters',
    lastUpdated: '2026-08-31 15:00',
    status: 'In Stock',
  },
  {
    id: 'INV007',
    produceId: 'PROD007',
    produceName: 'Beans',
    category: 'Cereals',
    currentStock: 320,
    reorderLevel: 100,
    unit: 'kg',
    lastUpdated: '2026-08-31 11:30',
    status: 'In Stock',
  },
  {
    id: 'INV008',
    produceId: 'PROD008',
    produceName: 'Apples',
    category: 'Fruits',
    currentStock: 15,
    reorderLevel: 30,
    unit: 'kg',
    lastUpdated: '2026-08-30 14:00',
    status: 'Low Stock',
  },
]

function Inventory() {
  void initialInventoryData
  const [inventory, setInventory] = useState([])
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    apiRequest('/inventory').then((items) => setInventory(items.map((item) => ({
      id: item.id,
      produceId: item.id,
      produceName: item.name,
      category: item.category || 'Produce',
      currentStock: Number(item.quantityAvailable),
      reorderLevel: Number(item.lowStockThreshold),
      unit: item.unit,
      lastUpdated: new Date().toLocaleString(),
      status: Number(item.quantityAvailable) === 0 ? 'Out of Stock' : item.lowStock ? 'Low Stock' : 'In Stock',
    })))).catch((requestError) => setError(requestError.message))
  }, [])

  const itemsPerPage = 8

  // Filter and search logic
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.produceName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === '' || item.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate summary statistics
  const summaryStats = {
    totalItems: inventory.length,
    inStock: inventory.filter((i) => i.status === 'In Stock').length,
    lowStock: inventory.filter((i) => i.status === 'Low Stock').length,
    critical: inventory.filter((i) => i.status === 'Out of Stock').length,
    totalQuantity: inventory.reduce((sum, i) => sum + i.currentStock, 0),
  }

  // Function to update stock (simulated frontend-only for now)
  const updateStock = async (itemId, quantityChange) => {
    const item = inventory.find((entry) => entry.id === itemId)
    if (!item) return
    const newStock = Math.max(0, item.currentStock + quantityChange)
    try {
      await apiRequest(`/inventory/${item.produceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantityAvailable: newStock }),
      })
      setInventory(
        inventory.map((currentItem) => {
          if (currentItem.id === itemId) {
            const status =
              newStock === 0
                ? 'Out of Stock'
                : newStock <= currentItem.reorderLevel
                ? 'Low Stock'
                : 'In Stock'

            return {
              ...currentItem,
              currentStock: newStock,
              status,
              lastUpdated: new Date().toLocaleString(),
            }
          }
          return currentItem
        })
      )
    } catch (error) {
      return
    }
  }

  // Get icon for status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Stock':
        return <span className="text-green-600 mr-1">✓</span>
      default:
        return null
    }
  }

  return (
    <>
      <PageTitle>Inventory Management</PageTitle>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Total Items" value={summaryStats.totalItems}>
          <CartIcon className="w-5 h-5 text-blue-500" />
        </InfoCard>
        <InfoCard title="In Stock" value={summaryStats.inStock}>
          <span className="text-2xl text-green-500">✓</span>
        </InfoCard>
        <InfoCard title="Low Stock" value={summaryStats.lowStock}>
          <span className="text-2xl text-yellow-500">!</span>
        </InfoCard>
        <InfoCard title="Out of Stock" value={summaryStats.critical}>
          <span className="text-2xl text-red-500">⚠</span>
        </InfoCard>
      </div>

      {/* Low Stock Warning */}
      {summaryStats.lowStock > 0 || summaryStats.critical > 0 ? (
        <div className="p-4 mb-8 bg-yellow-50 border-l-4 border-yellow-400 rounded-md dark:bg-yellow-900 dark:border-yellow-600">
          <div className="flex items-center">
            <span className="text-xl text-yellow-600 dark:text-yellow-300 mr-2">⚠</span>
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              <span role="img" aria-label="warning">⚠️</span> You have{' '}
              <strong>
                {summaryStats.lowStock + summaryStats.critical} items
              </strong>{' '}
              with low or no stock. Consider reordering soon.
            </p>
          </div>
        </div>
      ) : null}

      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            Track Farm Inventory
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor stock levels and identify items needing reorder
          </p>
        </div>
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
                placeholder="Search by produce name..."
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

        {/* Status Filter */}
        <div className="flex items-center">
          <Label className="flex items-center w-full">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-2">
              Status
            </span>
            <Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </Select>
          </Label>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {paginatedInventory.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
        {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of {filteredInventory.length}{' '}
        inventory items
      </div>

      {/* Inventory Table */}
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Produce Name</TableCell>
              <TableCell>Current Stock</TableCell>
              <TableCell>Reorder Level</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInventory.length > 0 ? (
              paginatedInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="text-sm font-semibold">{item.id}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="text-sm font-medium">{item.produceName}</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.category}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold">
                      {item.currentStock} {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.reorderLevel} {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(item.status)}
                      <StatusBadge status={item.status} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.lastUpdated}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <button
                        className="px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                        onClick={() => updateStock(item.id, 10)}
                        title="Add 10 units"
                      >
                        +10
                      </button>
                      <button
                        className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                        onClick={() => updateStock(item.id, -5)}
                        title="Remove 5 units"
                      >
                        -5
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" className="text-center py-8">
                  <span className="text-gray-600 dark:text-gray-400">No inventory items found</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={filteredInventory.length}
            resultsPerPage={itemsPerPage}
            label="Table navigation"
            onChange={(p) => setCurrentPage(p)}
          />
        </TableFooter>
      </TableContainer>

      {/* Information Section */}
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
          Inventory Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            ✓ <strong>In Stock:</strong> Items with sufficient quantity above reorder level
          </li>
          <li>
            ✓ <strong>Low Stock:</strong> Items below reorder level but still available
          </li>
          <li>
            ✓ <strong>Out of Stock:</strong> Items with no available stock, immediate action required
          </li>
          <li>
            ✓ <strong>Out of Stock:</strong> Items with zero quantity, unavailable for sale
          </li>
          <li>
            <span role="img" aria-label="information">💡</span> Use +/- buttons to simulate stock updates. In production, this will connect to sales
            and orders.
          </li>
        </ul>
      </div>
    </>
  )
}

export default Inventory
