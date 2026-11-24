import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import PageTitle from '../components/Typography/PageTitle'
import { 
  Button, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableFooter, 
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Select,
  HelperText,
  Pagination
} from '@windmill/react-ui'
import { EditIcon, TrashIcon, SearchIcon } from '../icons'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../utils/api'

// Dummy job data
const initialJobsData = [
  {
    id: 'JOB001',
    title: 'Tomato Harvesting',
    description: 'Harvest mature tomatoes from the main field. Must be careful to avoid bruising.',
    activity: 'Harvesting',
    workersRequired: 5,
    deadline: '2026-09-05',
    startDate: '2026-09-06',
    dailyWage: 300,
    status: 'Open',
    applicants: 8,
    datePosted: '2026-09-01'
  },
  {
    id: 'JOB002',
    title: 'Maize Weeding',
    description: 'Remove weeds from the maize field. Use only manual weeding tools.',
    activity: 'Weeding',
    workersRequired: 3,
    deadline: '2026-09-08',
    startDate: '2026-09-09',
    dailyWage: 250,
    status: 'Open',
    applicants: 5,
    datePosted: '2026-08-30'
  },
  {
    id: 'JOB003',
    title: 'Coffee Bean Sorting',
    description: 'Sort coffee beans by size and quality. Requires attention to detail.',
    activity: 'Sorting',
    workersRequired: 2,
    deadline: '2026-09-10',
    startDate: '2026-09-11',
    dailyWage: 350,
    status: 'Open',
    applicants: 3,
    datePosted: '2026-08-29'
  },
  {
    id: 'JOB004',
    title: 'Banana Packaging',
    description: 'Pack bananas into crates for distribution. Keep bunches organized by grade.',
    activity: 'Packaging',
    workersRequired: 4,
    deadline: '2026-09-03',
    startDate: '2026-09-04',
    dailyWage: 280,
    status: 'Open',
    applicants: 6,
    datePosted: '2026-09-01'
  },
  {
    id: 'JOB005',
    title: 'Farm Transportation',
    description: 'Transport harvested produce from field to storage. Must have valid driving license.',
    activity: 'Transportation',
    workersRequired: 2,
    deadline: '2026-09-07',
    startDate: '2026-09-08',
    dailyWage: 400,
    status: 'Open',
    applicants: 4,
    datePosted: '2026-08-28'
  },
  {
    id: 'JOB006',
    title: 'Seedling Planting',
    description: 'Plant seedlings in prepared beds. Maintain proper spacing between plants.',
    activity: 'Planting',
    workersRequired: 6,
    deadline: '2026-09-02',
    startDate: '2026-09-03',
    dailyWage: 270,
    status: 'Closed',
    applicants: 12,
    datePosted: '2026-08-27'
  },
  {
    id: 'JOB007',
    title: 'Vegetable Harvesting',
    description: 'Harvest ready vegetables from the vegetable garden. Early morning preferred.',
    activity: 'Harvesting',
    workersRequired: 3,
    deadline: '2026-09-12',
    startDate: '2026-09-13',
    dailyWage: 320,
    status: 'Draft',
    applicants: 0,
    datePosted: '2026-09-01'
  },
  {
    id: 'JOB008',
    title: 'Field Preparation',
    description: 'Prepare fields for planting season. Clear weeds and till soil.',
    activity: 'Other',
    workersRequired: 8,
    deadline: '2026-09-15',
    startDate: '2026-09-16',
    dailyWage: 290,
    status: 'Draft',
    applicants: 0,
    datePosted: '2026-09-01'
  }
]

function CasualJobs() {
  const { user } = useAuth()
  if (user?.role === 'Customer') return <ApplicantJobs />
  return <AdminCasualJobs />
}

function ApplicantJobs() {
  const history = useHistory()
  const [openJobs, setOpenJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [appliedJobIds, setAppliedJobIds] = useState([])

  useEffect(() => {
    Promise.all([apiRequest('/jobs'), apiRequest('/applications/my')])
      .then(([jobs, applications]) => {
        setOpenJobs(jobs.map((job) => ({
          ...job,
          workersRequired: job.workersRequired,
          dailyWage: Number(job.dailyWage),
          startDate: job.startDate,
          deadline: job.deadline,
        })))
        setAppliedJobIds(applications.map((application) => application.jobId))
      })
      .catch((requestError) => {
        console.error('Unable to load casual jobs:', requestError)
        setError(requestError.message)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <>
      <PageTitle>Available Casual Jobs</PageTitle>
      <p className="mb-8 text-gray-600 dark:text-gray-400">Review open farm opportunities and apply for work.</p>
      {isLoading && <p className="mb-6 text-gray-600 dark:text-gray-400">Loading jobs...</p>}
      {error && <p className="mb-6 text-red-600 dark:text-red-400">{error}</p>}
      {!isLoading && !error && openJobs.length === 0 && (
        <p className="mb-6 text-gray-600 dark:text-gray-400">No casual jobs available yet.</p>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {openJobs.map((job) => (
          <div key={job.id} className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{job.title}</h2>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">KES {job.dailyWage}/day</span>
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{job.description}</p>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Starts {job.startDate} • Apply by {job.deadline}</p>
            <Button disabled={appliedJobIds.includes(job.id)} onClick={() => history.push(`/app/job-application/${job.id}`, { job })}>
              {appliedJobIds.includes(job.id) ? 'Application submitted' : 'Apply for this job'}
            </Button>
          </div>
        ))}
      </div>
    </>
  )
}

function AdminCasualJobs() {
  void initialJobsData
  const [jobs, setJobs] = useState([])
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActivity, setSelectedActivity] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity: 'Planting',
    workersRequired: '',
    deadline: '',
    startDate: '',
    dailyWage: '',
    status: 'Draft'
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    apiRequest('/jobs/all').then((items) => setJobs(items.map((job) => ({
      ...job,
      workersRequired: job.workersRequired,
      dailyWage: Number(job.dailyWage),
      startDate: job.startDate,
      deadline: job.deadline,
      status: job.status === 'OPEN' ? 'Open' : job.status === 'CLOSED' ? 'Closed' : 'Draft',
      applicants: 0,
    })))).catch((requestError) => {
      console.error('Unable to load casual jobs:', requestError)
      setLoadError(requestError.message)
    })
  }, [])

  const ITEMS_PER_PAGE = 8
  const activities = ['All', 'Planting', 'Weeding', 'Harvesting', 'Sorting', 'Packaging', 'Transportation', 'Other']
  const statuses = ['All', 'Open', 'Closed', 'Draft']

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesActivity = selectedActivity === 'All' || job.activity === selectedActivity
    const matchesStatus = selectedStatus === 'All' || job.status === selectedStatus
    return matchesSearch && matchesActivity && matchesStatus
  })

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Summary statistics
  const totalJobs = jobs.length
  const openJobs = jobs.filter((j) => j.status === 'Open').length
  const closedJobs = jobs.filter((j) => j.status === 'Closed').length
  const totalApplications = jobs.reduce((sum, job) => sum + job.applicants, 0)

  // Form validation
  const validateForm = () => {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Job title is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.workersRequired || parseInt(formData.workersRequired) <= 0) {
      errors.workersRequired = 'Number of workers must be greater than 0'
    }
    if (!formData.deadline) errors.deadline = 'Application deadline is required'
    if (!formData.startDate) errors.startDate = 'Start date is required'
    if (!formData.dailyWage || parseFloat(formData.dailyWage) <= 0) {
      errors.dailyWage = 'Daily wage must be greater than 0'
    }
    return errors
  }

  // Open add/edit modal
  const openAddEditModal = (job = null) => {
    if (job) {
      setEditingJob(job)
      setFormData({
        title: job.title,
        description: job.description,
        activity: job.activity,
        workersRequired: job.workersRequired.toString(),
        deadline: job.deadline,
        startDate: job.startDate,
        dailyWage: job.dailyWage.toString(),
        status: job.status
      })
    } else {
      setEditingJob(null)
      setFormData({
        title: '',
        description: '',
        activity: 'Planting',
        workersRequired: '',
        deadline: '',
        startDate: '',
        dailyWage: '',
        status: 'Draft'
      })
    }
    setFormErrors({})
    setIsAddEditModalOpen(true)
  }

  // Save job (add or edit)
  const handleSaveJob = async () => {
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      activity: formData.activity,
      workersRequired: parseInt(formData.workersRequired),
      deadline: formData.deadline,
      startDate: formData.startDate,
      dailyWage: parseFloat(formData.dailyWage),
      status: formData.status.toUpperCase(),
    }
    try {
    if (editingJob) {
      await apiRequest(`/jobs/${editingJob.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      // Update existing job
      setJobs(
        jobs.map((job) =>
          job.id === editingJob.id
            ? {
                ...job,
                title: formData.title,
                description: formData.description,
                activity: formData.activity,
                workersRequired: parseInt(formData.workersRequired),
                deadline: formData.deadline,
                startDate: formData.startDate,
                dailyWage: parseFloat(formData.dailyWage),
                status: formData.status
              }
            : job
        )
      )
    } else {
      const created = await apiRequest('/jobs', { method: 'POST', body: JSON.stringify(payload) })
      // Create new job
      const newJob = {
        id: created.id,
        title: formData.title,
        description: formData.description,
        activity: formData.activity,
        workersRequired: parseInt(formData.workersRequired),
        deadline: formData.deadline,
        startDate: formData.startDate,
        dailyWage: parseFloat(formData.dailyWage),
        status: formData.status,
        applicants: 0,
        datePosted: new Date().toISOString().split('T')[0]
      }
      setJobs([...jobs, newJob])
    }
    } catch (error) {
      setFormErrors({ submit: error.message })
      return
    }

    setIsAddEditModalOpen(false)
    setEditingJob(null)
    setFormData({
      title: '',
      description: '',
      activity: 'Planting',
      workersRequired: '',
      deadline: '',
      startDate: '',
      dailyWage: '',
      status: 'Draft'
    })
    setCurrentPage(1)
  }

  // Open delete modal
  const openDeleteModal = (jobId) => {
    setDeleteTargetId(jobId)
    setIsDeleteModalOpen(true)
  }

  // Delete job
  const handleDeleteJob = async () => {
    try {
      await apiRequest(`/jobs/${deleteTargetId}`, { method: 'DELETE' })
      setJobs(jobs.filter((job) => job.id !== deleteTargetId))
    } catch (error) {
      setFormErrors({ submit: error.message })
    }
    setIsDeleteModalOpen(false)
    setDeleteTargetId(null)
    if (paginatedJobs.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Publish job (change from Draft to Open)
  const handlePublishJob = async (jobId) => {
    await apiRequest(`/jobs/${jobId}`, { method: 'PATCH', body: JSON.stringify({ status: 'OPEN' }) })
    setJobs(
      jobs.map((job) =>
        job.id === jobId && job.status === 'Draft'
          ? { ...job, status: 'Open' }
          : job
      )
    )
  }

  // Close job (change from Open to Closed)
  const handleCloseJob = async (jobId) => {
    await apiRequest(`/jobs/${jobId}`, { method: 'PATCH', body: JSON.stringify({ status: 'CLOSED' }) })
    setJobs(
      jobs.map((job) =>
        job.id === jobId && job.status === 'Open'
          ? { ...job, status: 'Closed' }
          : job
      )
    )
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Open':
        return 'success'
      case 'Closed':
        return 'danger'
      case 'Draft':
        return 'warning'
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
      <PageTitle>Casual Jobs Management</PageTitle>
      {loadError && <p className="mb-4 text-red-600">{loadError}</p>}

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl"><span role="img" aria-label="jobs">📊</span></div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{totalJobs}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl"><span role="img" aria-label="open">✓</span></div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Open Jobs</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{openJobs}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl"><span role="img" aria-label="closed">✕</span></div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Closed Jobs</p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">{closedJobs}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl"><span role="img" aria-label="applicants">👥</span></div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{totalApplications}</p>
          </div>
        </div>
      </div>

      {/* Post New Job Button */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Manage Jobs</h2>
        <Button onClick={() => openAddEditModal()} className="bg-green-600 hover:bg-green-700">
          Post New Job
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="grid gap-4 mb-6 md:grid-cols-3">
        <div className="flex items-center border rounded-lg dark:border-gray-600">
          <SearchIcon className="w-5 h-5 ml-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-2 text-gray-700 bg-transparent dark:text-gray-200 focus:outline-none"
          />
        </div>

        <Select
          value={selectedActivity}
          onChange={(e) => {
            setSelectedActivity(e.target.value)
            setCurrentPage(1)
          }}
          className="dark:bg-gray-700 dark:text-gray-200"
        >
          {activities.map((activity) => (
            <option key={activity} value={activity}>
              {activity === 'All' ? 'All Activities' : activity}
            </option>
          ))}
        </Select>

        <Select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value)
            setCurrentPage(1)
          }}
          className="dark:bg-gray-700 dark:text-gray-200"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === 'All' ? 'All Status' : status}
            </option>
          ))}
        </Select>
      </div>

      {/* Jobs Table */}
      <div className="w-full overflow-hidden rounded-lg shadow-xs">
        <Table>
          <TableHeader>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Job ID</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Title & Activity</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Workers Needed</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Daily Wage</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Deadline</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Status</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Applicants</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Actions</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job) => (
                <TableRow key={job.id} className="border-b dark:border-gray-600">
                  <TableCell className="text-gray-700 dark:text-gray-200">{job.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">{job.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{job.activity}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">{job.workersRequired}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200 font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(job.dailyWage)}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">{job.deadline}</TableCell>
                  <TableCell>
                    <Badge type={getStatusBadgeColor(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">{job.applicants}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openAddEditModal(job)}
                        className="px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      {job.status === 'Draft' && (
                        <Button
                          onClick={() => handlePublishJob(job.id)}
                          className="px-2 py-1 text-sm bg-green-600 hover:bg-green-700"
                        >
                          Publish
                        </Button>
                      )}
                      {job.status === 'Open' && (
                        <Button
                          onClick={() => handleCloseJob(job.id)}
                          className="px-2 py-1 text-sm bg-red-600 hover:bg-red-700"
                        >
                          Close
                        </Button>
                      )}
                      <Button
                        onClick={() => openDeleteModal(job.id)}
                        className="px-2 py-1 text-sm bg-red-600 hover:bg-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="8" className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No jobs found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TableFooter>
        <Pagination
          totalResults={filteredJobs.length}
          resultsPerPage={ITEMS_PER_PAGE}
          onChange={setCurrentPage}
          label={`Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(
            currentPage * ITEMS_PER_PAGE,
            filteredJobs.length
          )} of ${filteredJobs.length} jobs`}
        />
      </TableFooter>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100"><span role="img" aria-label="jobs">📋</span> Job Management Guidelines</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Draft:</strong> Jobs saved but not yet visible to workers. Click "Publish" to make them open.</li>
          <li>• <strong>Open:</strong> Active jobs receiving applications. Workers can apply through the job board.</li>
          <li>• <strong>Closed:</strong> No longer accepting applications. View submitted applications only.</li>
          <li>• <strong>Daily Wage:</strong> Amount paid per day per worker. Consider farm activity and local rates.</li>
          <li>• <strong>Deadline:</strong> Last day workers can submit applications for this job.</li>
        </ul>
      </div>

      {/* Add/Edit Job Modal */}
      <Modal isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)}>
        <ModalHeader>{editingJob ? 'Edit Job' : 'Post New Job'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label>
                <span className="text-gray-700 dark:text-gray-200">Job Title *</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Tomato Harvesting"
                className="dark:bg-gray-700 dark:text-gray-200"
              />
              {formErrors.title && <HelperText valid={false}>{formErrors.title}</HelperText>}
            </div>

            <div>
              <Label>
                <span className="text-gray-700 dark:text-gray-200">Description *</span>
              </Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the job, requirements, and any special instructions..."
                rows="4"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:outline-none"
              />
              {formErrors.description && <HelperText valid={false}>{formErrors.description}</HelperText>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-200">Farm Activity *</span>
                </Label>
                <Select
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  className="dark:bg-gray-700 dark:text-gray-200"
                >
                  {activities.filter((a) => a !== 'All').map((activity) => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-200">Status *</span>
                </Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="Draft">Draft</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-200">Workers Required *</span>
                </Label>
                <Input
                  type="number"
                  value={formData.workersRequired}
                  onChange={(e) => setFormData({ ...formData, workersRequired: e.target.value })}
                  placeholder="e.g., 5"
                  className="dark:bg-gray-700 dark:text-gray-200"
                />
                {formErrors.workersRequired && <HelperText valid={false}>{formErrors.workersRequired}</HelperText>}
              </div>

              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-200">Daily Wage (KES) *</span>
                </Label>
                <Input
                  type="number"
                  value={formData.dailyWage}
                  onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
                  placeholder="e.g., 300"
                  className="dark:bg-gray-700 dark:text-gray-200"
                />
                {formErrors.dailyWage && <HelperText valid={false}>{formErrors.dailyWage}</HelperText>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-200">Application Deadline *</span>
                </Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="dark:bg-gray-700 dark:text-gray-200"
                />
                {formErrors.deadline && <HelperText valid={false}>{formErrors.deadline}</HelperText>}
              </div>

              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-200">Start Date *</span>
                </Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="dark:bg-gray-700 dark:text-gray-200"
                />
                {formErrors.startDate && <HelperText valid={false}>{formErrors.startDate}</HelperText>}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => setIsAddEditModalOpen(false)}
            className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button onClick={handleSaveJob} className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700">
            {editingJob ? 'Update Job' : 'Post Job'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalHeader>Delete Job</ModalHeader>
        <ModalBody>
          <p className="text-gray-700 dark:text-gray-200">
            Are you sure you want to delete this job? This action cannot be undone. Any associated applications will also be affected.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteJob}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700"
          >
            Delete Job
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default CasualJobs
