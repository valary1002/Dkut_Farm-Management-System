import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

import PageTitle from '../components/Typography/PageTitle'
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
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Select,
  HelperText,
} from '@windmill/react-ui'
import { EditIcon, TrashIcon, SearchIcon } from '../icons'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../utils/api'
import { getProduceImage } from '../utils/produceImages'

// Dummy data for Produce
const initialProduceData = [
  {
    id: 'PROD001',
    name: 'Tomatoes',
    category: 'Vegetables',
    quantity: 120,
    unit: 'kg',
    harvestDate: '2026-08-25',
    sellingPrice: 50,
    status: 'In Stock',
  },
  {
    id: 'PROD002',
    name: 'Maize',
    category: 'Cereals',
    quantity: 450,
    unit: 'kg',
    harvestDate: '2026-08-20',
    sellingPrice: 45,
    status: 'In Stock',
  },
  {
    id: 'PROD003',
    name: 'Bananas',
    category: 'Fruits',
    quantity: 85,
    unit: 'bunches',
    harvestDate: '2026-08-22',
    sellingPrice: 200,
    status: 'In Stock',
  },
  {
    id: 'PROD004',
    name: 'Coffee Beans',
    category: 'Coffee',
    quantity: 150,
    unit: 'kg',
    harvestDate: '2026-07-15',
    sellingPrice: 800,
    status: 'Low Stock',
  },
  {
    id: 'PROD005',
    name: 'Black Pepper',
    category: 'Spices',
    quantity: 25,
    unit: 'kg',
    harvestDate: '2026-06-10',
    sellingPrice: 1500,
    status: 'Low Stock',
  },
  {
    id: 'PROD006',
    name: 'Milk',
    category: 'Dairy',
    quantity: 200,
    unit: 'liters',
    harvestDate: '2026-08-31',
    sellingPrice: 60,
    status: 'In Stock',
  },
  {
    id: 'PROD007',
    name: 'Beans',
    category: 'Cereals',
    quantity: 320,
    unit: 'kg',
    harvestDate: '2026-08-18',
    sellingPrice: 120,
    status: 'In Stock',
  },
  {
    id: 'PROD008',
    name: 'Apples',
    category: 'Fruits',
    quantity: 15,
    unit: 'kg',
    harvestDate: '2026-08-24',
    sellingPrice: 350,
    status: 'Low Stock',
  },
]

const CATEGORIES = ['Vegetables', 'Fruits', 'Coffee', 'Cereals', 'Spices', 'Dairy']
const UNITS = ['kg', 'liters', 'bunches', 'bags', 'boxes', 'units']

function Produce() {
  const { user } = useAuth()
  if (user?.role === 'Customer') return <CustomerProduce />
  return <AdminProduce />
}

function CustomerProduce() {
  const history = useHistory()
  const [customerProduce, setCustomerProduce] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/produce')
      .then((items) => setCustomerProduce(items.map((item) => ({
        ...item,
        quantity: Number(item.quantityAvailable || 0),
        sellingPrice: Number(item.sellingPrice),
        image: item.imageUrl || getProduceImage(item.name),
      }))))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <>
      <PageTitle>Fresh Farm Produce</PageTitle>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Choose an item below to request a purchase. Stock availability and pricing are shown for each product.
      </p>
      {isLoading && <p className="mb-6 text-gray-600 dark:text-gray-400">Loading produce...</p>}
      {error && <p className="mb-6 text-red-600 dark:text-red-400">{error}</p>}
      {!isLoading && !error && customerProduce.length === 0 && (
        <p className="mb-6 text-gray-600 dark:text-gray-400">No produce is currently available.</p>
      )}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {customerProduce.map((item) => (
          <div key={item.id} className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
            <img className="object-cover w-full h-48" src={item.image} alt={item.name} />
            <div className="p-5">
              <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">{item.name}</h2>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Available: {item.quantity} {item.unit}</p>
              <p className="mb-4 text-lg font-semibold text-green-600 dark:text-green-400">KES {item.sellingPrice} / {item.unit}</p>
              <Button block onClick={() => history.push('/app/purchase', { item })}>
                Purchase {item.name}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Link className="inline-block mt-8 text-sm font-semibold text-green-600 hover:underline dark:text-green-400" to="/app/casual-jobs">
        View casual job opportunities
      </Link>
    </>
  )
}

function AdminProduce() {
  void initialProduceData
  const [produce, setProduce] = useState([])
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingProduce, setEditingProduce] = useState(null)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'kg',
    harvestDate: '',
    sellingPrice: '',
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    apiRequest('/produce').then((items) => setProduce(items.map((item) => ({
      ...item,
      quantity: Number(item.quantityAvailable || 0),
      sellingPrice: Number(item.sellingPrice),
      status: item.status === 'ACTIVE' ? 'In Stock' : 'Out of Stock',
      harvestDate: item.createdAt,
    })))).catch((requestError) => setLoadError(requestError.message))
  }, [])

  const itemsPerPage = 8

  // Filter and search logic
  const filteredProduce = produce.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const paginatedProduce = filteredProduce.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Modal handlers
  const openAddModal = () => {
    setEditingProduce(null)
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: 'kg',
      harvestDate: '',
      sellingPrice: '',
    })
    setFormErrors({})
    setIsAddEditModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingProduce(item)
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      harvestDate: item.harvestDate,
      sellingPrice: item.sellingPrice.toString(),
    })
    setFormErrors({})
    setIsAddEditModalOpen(true)
  }

  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false)
    setEditingProduce(null)
  }

  const openDeleteModal = (id) => {
    setDeleteTargetId(id)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeleteTargetId(null)
  }

  // Validation
  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Produce name is required'
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.quantity) errors.quantity = 'Quantity is required'
    if (isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0)
      errors.quantity = 'Quantity must be a positive number'
    if (!formData.harvestDate) errors.harvestDate = 'Harvest date is required'
    if (!formData.sellingPrice) errors.sellingPrice = 'Selling price is required'
    if (isNaN(formData.sellingPrice) || parseFloat(formData.sellingPrice) <= 0)
      errors.sellingPrice = 'Selling price must be a positive number'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Add or Edit produce
  const handleSaveProduce = async () => {
    if (!validateForm()) return

    const payload = {
      name: formData.name,
      category: formData.category,
      sellingPrice: parseFloat(formData.sellingPrice),
      unit: formData.unit,
      quantity: parseFloat(formData.quantity),
    }
    try {
      if (editingProduce) {
        await apiRequest(`/produce/${editingProduce.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        await apiRequest(`/inventory/${editingProduce.id}`, { method: 'PATCH', body: JSON.stringify({ quantityAvailable: payload.quantity }) })
      // Edit existing produce
      setProduce(
        produce.map((item) =>
          item.id === editingProduce.id
            ? {
                ...item,
                name: formData.name,
                category: formData.category,
                quantity: parseFloat(formData.quantity),
                unit: formData.unit,
                harvestDate: formData.harvestDate,
                sellingPrice: parseFloat(formData.sellingPrice),
                status:
                  parseFloat(formData.quantity) > 50
                    ? 'In Stock'
                    : parseFloat(formData.quantity) > 0
                    ? 'Low Stock'
                    : 'Out of Stock',
              }
            : item
        )
      )
      } else {
        const created = await apiRequest('/produce', { method: 'POST', body: JSON.stringify(payload) })
      // Add new produce
      const newProduce = {
        id: created.id,
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        harvestDate: formData.harvestDate,
        sellingPrice: parseFloat(formData.sellingPrice),
        status:
          parseFloat(formData.quantity) > 50
            ? 'In Stock'
            : parseFloat(formData.quantity) > 0
            ? 'Low Stock'
            : 'Out of Stock',
      }
      setProduce([...produce, newProduce])
      }
    } catch (error) {
      setFormErrors({ submit: error.message })
      return
    }
    closeAddEditModal()
    setCurrentPage(1) // Reset to first page
  }

  // Delete produce
  const handleDeleteProduce = async () => {
    try {
      await apiRequest(`/produce/${deleteTargetId}`, { method: 'DELETE' })
      setProduce(produce.filter((item) => item.id !== deleteTargetId))
    } catch (error) {
      setFormErrors({ submit: error.message })
    }
    closeDeleteModal()
  }

  // Get badge color based on status
  const getStatusBadgeLayout = (status) => {
    switch (status) {
      case 'In Stock':
        return 'success'
      case 'Low Stock':
        return 'warning'
      case 'Out of Stock':
        return 'danger'
      default:
        return 'primary'
    }
  }

  return (
    <>
      <PageTitle>Produce Management</PageTitle>
      {loadError && <p className="mb-4 text-red-600">{loadError}</p>}

      {/* Header Section with Add Button */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            Manage Farm Produce
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View, add, edit, and delete produce items
          </p>
        </div>
        <Button onClick={openAddModal}>Add New Produce</Button>
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

        {/* Category Filter */}
        <div className="flex items-center">
          <Label className="flex items-center w-full">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-2">
              Category
            </span>
            <Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </Label>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {paginatedProduce.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
        {Math.min(currentPage * itemsPerPage, filteredProduce.length)} of {filteredProduce.length}{' '}
        produce items
      </div>

      {/* Produce Table */}
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Produce Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Harvest Date</TableCell>
              <TableCell>Selling Price (KES)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProduce.length > 0 ? (
              paginatedProduce.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="text-sm font-semibold">{item.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {item.quantity} {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.harvestDate}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold">{item.sellingPrice}</span>
                  </TableCell>
                  <TableCell>
                    <Badge type={getStatusBadgeLayout(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <button
                        className="flex items-center justify-center w-5 h-5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => openEditModal(item)}
                        title="Edit"
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="flex items-center justify-center w-5 h-5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => openDeleteModal(item.id)}
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="8" className="text-center py-8">
                  <span className="text-gray-600 dark:text-gray-400">No produce found</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={filteredProduce.length}
            resultsPerPage={itemsPerPage}
            label="Table navigation"
            onChange={(p) => setCurrentPage(p)}
          />
        </TableFooter>
      </TableContainer>

      {/* Add/Edit Modal */}
      <Modal isOpen={isAddEditModalOpen} onClose={closeAddEditModal}>
        <ModalHeader>{editingProduce ? 'Edit Produce' : 'Add New Produce'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Produce Name */}
            <Label>
              <span className="font-semibold">Produce Name</span>
              <Input
                className="mt-1"
                placeholder="e.g., Tomatoes"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                valid={!formErrors.name}
              />
              {formErrors.name && <HelperText valid={false}>{formErrors.name}</HelperText>}
            </Label>

            {/* Category */}
            <Label>
              <span className="font-semibold">Category</span>
              <Select
                className="mt-1"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                valid={!formErrors.category}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
              {formErrors.category && (
                <HelperText valid={false}>{formErrors.category}</HelperText>
              )}
            </Label>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <Label>
                <span className="font-semibold">Quantity</span>
                <Input
                  className="mt-1"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  valid={!formErrors.quantity}
                />
                {formErrors.quantity && (
                  <HelperText valid={false}>{formErrors.quantity}</HelperText>
                )}
              </Label>

              <Label>
                <span className="font-semibold">Unit</span>
                <Select
                  className="mt-1"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Select>
              </Label>
            </div>

            {/* Harvest Date */}
            <Label>
              <span className="font-semibold">Harvest Date</span>
              <Input
                className="mt-1"
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                valid={!formErrors.harvestDate}
              />
              {formErrors.harvestDate && (
                <HelperText valid={false}>{formErrors.harvestDate}</HelperText>
              )}
            </Label>

            {/* Selling Price */}
            <Label>
              <span className="font-semibold">Selling Price (KES per unit)</span>
              <Input
                className="mt-1"
                type="number"
                placeholder="e.g., 50"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                valid={!formErrors.sellingPrice}
              />
              {formErrors.sellingPrice && (
                <HelperText valid={false}>{formErrors.sellingPrice}</HelperText>
              )}
            </Label>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={closeAddEditModal}>
              Cancel
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleSaveProduce}>
              {editingProduce ? 'Update Produce' : 'Add Produce'}
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeAddEditModal}>
              Cancel
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleSaveProduce}>
              {editingProduce ? 'Update Produce' : 'Add Produce'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalHeader>Delete Produce</ModalHeader>
        <ModalBody>
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this produce item? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleDeleteProduce} layout="danger">
              Delete
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="danger" onClick={handleDeleteProduce}>
              Delete
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default Produce
