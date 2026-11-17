import React, { useEffect, useState } from 'react'
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
  Select,
  Pagination
} from '@windmill/react-ui'
import { EditIcon, SearchIcon } from '../icons'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../utils/api'

// Dummy applications data
const initialApplicationsData = [
  {
    id: 'APP001',
    jobId: 'JOB001',
    jobTitle: 'Tomato Harvesting',
    applicantName: 'John Kipchoge',
    applicantPhone: '+254712345678',
    experience: '3 years experience in crop harvesting',
    education: 'Secondary School',
    status: 'Pending',
    dateApplied: '2026-09-01',
    reviewedDate: null,
    notes: ''
  },
  {
    id: 'APP002',
    jobId: 'JOB001',
    jobTitle: 'Tomato Harvesting',
    applicantName: 'Mary Wanjiru',
    applicantPhone: '+254723456789',
    experience: '2 years harvesting experience, reliable',
    education: 'Secondary School',
    status: 'Shortlisted',
    dateApplied: '2026-09-01',
    reviewedDate: '2026-09-02',
    notes: 'Good communicator, available immediately'
  },
  {
    id: 'APP003',
    jobId: 'JOB002',
    jobTitle: 'Maize Weeding',
    applicantName: 'Peter Koech',
    applicantPhone: '+254734567890',
    experience: '1 year in general farm work',
    education: 'Primary School',
    status: 'Reviewed',
    dateApplied: '2026-08-31',
    reviewedDate: '2026-09-01',
    notes: 'Needs supervision'
  },
  {
    id: 'APP004',
    jobId: 'JOB001',
    jobTitle: 'Tomato Harvesting',
    applicantName: 'Jane Kiplagat',
    applicantPhone: '+254745678901',
    experience: '4 years in agriculture',
    education: 'Technical Training',
    status: 'Rejected',
    dateApplied: '2026-08-30',
    reviewedDate: '2026-09-01',
    notes: 'No availability during required dates'
  },
  {
    id: 'APP005',
    jobId: 'JOB003',
    jobTitle: 'Coffee Bean Sorting',
    applicantName: 'Paul Kimani',
    applicantPhone: '+254756789012',
    experience: '5 years in sorting and quality control',
    education: 'Technical Training',
    status: 'Shortlisted',
    dateApplied: '2026-09-01',
    reviewedDate: '2026-09-01',
    notes: 'Excellent quality standards'
  },
  {
    id: 'APP006',
    jobId: 'JOB004',
    jobTitle: 'Banana Packaging',
    applicantName: 'Grace Muthoni',
    applicantPhone: '+254767890123',
    experience: '2 years in packaging operations',
    education: 'Secondary School',
    status: 'Pending',
    dateApplied: '2026-09-01',
    reviewedDate: null,
    notes: ''
  },
  {
    id: 'APP007',
    jobId: 'JOB005',
    jobTitle: 'Farm Transportation',
    applicantName: 'David Kipkemboi',
    applicantPhone: '+254778901234',
    experience: 'Licensed driver, 3 years experience',
    education: 'Secondary School + License',
    status: 'Shortlisted',
    dateApplied: '2026-08-28',
    reviewedDate: '2026-08-29',
    notes: 'Valid driving license confirmed'
  },
  {
    id: 'APP008',
    jobId: 'JOB002',
    jobTitle: 'Maize Weeding',
    applicantName: 'Rose Karanja',
    applicantPhone: '+254789012345',
    experience: '1.5 years in farm labor',
    education: 'Primary School',
    status: 'Reviewed',
    dateApplied: '2026-08-29',
    reviewedDate: '2026-08-30',
    notes: 'Reliable, good punctuality'
  },
  {
    id: 'APP009',
    jobId: 'JOB003',
    jobTitle: 'Coffee Bean Sorting',
    applicantName: 'Samuel Kiplagat',
    applicantPhone: '+254790123456',
    experience: '1 year in coffee processing',
    education: 'Primary School',
    status: 'Pending',
    dateApplied: '2026-09-01',
    reviewedDate: null,
    notes: ''
  },
  {
    id: 'APP010',
    jobId: 'JOB001',
    jobTitle: 'Tomato Harvesting',
    applicantName: 'Susan Kipchoge',
    applicantPhone: '+254701234567',
    experience: '2 years in crop farming',
    education: 'Secondary School',
    status: 'Rejected',
    dateApplied: '2026-08-28',
    reviewedDate: '2026-08-30',
    notes: 'Limited experience, salary expectations too high'
  }
]

function JobApplications() {
  const { user } = useAuth()
  if (user?.role === 'Customer') return <CustomerApplications />
  return <AdminJobApplications />
}

function AdminJobApplications() {
  void initialApplicationsData
  const [applications, setApplications] = useState([])
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedJob, setSelectedJob] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')

  useEffect(() => {
    apiRequest('/applications').then((items) => setApplications(items.map((item) => ({
      ...item,
      applicantName: item.applicantName,
      applicantPhone: item.phone,
      status: item.status === 'PENDING' ? 'Pending' : item.status === 'SHORTLISTED' ? 'Shortlisted' : item.status === 'ACCEPTED' ? 'Accepted' : 'Rejected',
      notes: item.reviewNotes || '',
      dateApplied: item.appliedAt,
    })))).catch((requestError) => setLoadError(requestError.message))
  }, [])

  const ITEMS_PER_PAGE = 8
  const statuses = ['All', 'Pending', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected']

  // Get unique jobs from applications
  const uniqueJobs = ['All', ...new Set(applications.map((app) => app.jobTitle))]

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantPhone.includes(searchQuery)
    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus
    const matchesJob = selectedJob === 'All' || app.jobTitle === selectedJob
    return matchesSearch && matchesStatus && matchesJob
  })

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Summary statistics
  const totalApplications = applications.length
  const pendingCount = applications.filter((a) => a.status === 'Pending').length
  const reviewedCount = applications.filter((a) => a.status === 'Reviewed').length
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length
  const acceptedCount = applications.filter((a) => a.status === 'Accepted').length
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length

  // Open details modal
  const openDetailsModal = (application) => {
    setSelectedApplication(application)
    setIsDetailsModalOpen(true)
  }

  // Open status change modal
  const openStatusModal = (application) => {
    setSelectedApplication(application)
    setNewStatus(application.status)
    setStatusNotes(application.notes)
    setIsStatusModalOpen(true)
  }

  // Change application status
  const handleChangeStatus = async () => {
    const status = newStatus === 'Pending' ? 'PENDING' : newStatus === 'Shortlisted' ? 'SHORTLISTED' : newStatus === 'Accepted' ? 'ACCEPTED' : 'REJECTED'
    try {
      await apiRequest(`/applications/${selectedApplication.id}/review`, { method: 'PATCH', body: JSON.stringify({ status, reviewNotes: statusNotes }) })
      setApplications(applications.map((app) => app.id === selectedApplication.id ? { ...app, status: newStatus, notes: statusNotes } : app))
    } catch (error) {
      return
    }
    setIsStatusModalOpen(false)
    setSelectedApplication(null)
    setNewStatus('')
    setStatusNotes('')
  }

  // Shortlist applicant
  const handleShortlist = async (applicationId) => {
    try {
      await apiRequest(`/applications/${applicationId}/review`, { method: 'PATCH', body: JSON.stringify({ status: 'SHORTLISTED' }) })
      setApplications((items) => items.map((app) => app.id === applicationId ? { ...app, status: 'Shortlisted', reviewedDate: new Date().toISOString().split('T')[0] } : app))
    } catch (error) {
      return
    }
  }

  const handleAccept = async (applicationId) => {
    try {
      await apiRequest(`/applications/${applicationId}/review`, { method: 'PATCH', body: JSON.stringify({ status: 'ACCEPTED' }) })
      setApplications((items) => items.map((app) => app.id === applicationId ? { ...app, status: 'Accepted', reviewedDate: new Date().toISOString().split('T')[0] } : app))
    } catch (error) {
      return
    }
  }

  // Reject applicant
  const handleReject = async (applicationId) => {
    try {
      await apiRequest(`/applications/${applicationId}/review`, { method: 'PATCH', body: JSON.stringify({ status: 'REJECTED' }) })
      setApplications((items) => items.map((app) => app.id === applicationId ? { ...app, status: 'Rejected', reviewedDate: new Date().toISOString().split('T')[0] } : app))
    } catch (error) {
      return
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning'
      case 'Reviewed':
        return 'primary'
      case 'Shortlisted':
        return 'success'
      case 'Accepted':
        return 'success'
      case 'Rejected':
        return 'danger'
      default:
        return 'primary'
    }
  }

  return (
    <>
      <PageTitle>Job Applications</PageTitle>
      {loadError && <p className="mb-4 text-red-600">{loadError}</p>}

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-3 xl:grid-cols-6">
        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl"><span role="img" aria-label="applications">📋</span></div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{totalApplications}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl"><span role="img" aria-label="pending">⏳</span></div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl"><span role="img" aria-label="reviewed">👁️</span></div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Reviewed</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{reviewedCount}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl">✓</div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Shortlisted</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{shortlistedCount}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl">★</div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Accepted</p>
            <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">{acceptedCount}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl">✕</div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid gap-4 mb-6 md:grid-cols-3">
        <div className="flex items-center border rounded-lg dark:border-gray-600">
          <SearchIcon className="w-5 h-5 ml-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or job..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-2 text-gray-700 bg-transparent dark:text-gray-200 focus:outline-none"
          />
        </div>

        <Select
          value={selectedJob}
          onChange={(e) => {
            setSelectedJob(e.target.value)
            setCurrentPage(1)
          }}
          className="dark:bg-gray-700 dark:text-gray-200"
        >
          {uniqueJobs.map((job) => (
            <option key={job} value={job}>
              {job === 'All' ? 'All Jobs' : job}
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

      {/* Applications Table */}
      <div className="w-full overflow-hidden rounded-lg shadow-xs">
        <Table>
          <TableHeader>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Application ID</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Applicant Name</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Job Applied For</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Contact Info</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Applied Date</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Status</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Actions</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {paginatedApplications.length > 0 ? (
              paginatedApplications.map((app) => (
                <TableRow key={app.id} className="border-b dark:border-gray-600">
                  <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">{app.id}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">{app.applicantName}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">{app.jobTitle}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">{app.applicantPhone}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">{app.dateApplied}</TableCell>
                  <TableCell>
                    <Badge type={getStatusBadgeColor(app.status)}>{app.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openDetailsModal(app)}
                        className="px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700"
                      >
                        Details
                      </Button>
                      {app.status !== 'Rejected' && app.status !== 'Shortlisted' && app.status !== 'Accepted' && (
                        <Button
                          onClick={() => handleShortlist(app.id)}
                          className="px-2 py-1 text-sm bg-green-600 hover:bg-green-700"
                        >
                          Shortlist
                        </Button>
                      )}
                      {app.status !== 'Rejected' && app.status !== 'Accepted' && (
                        <Button
                          onClick={() => handleAccept(app.id)}
                          className="px-2 py-1 text-sm bg-primary-600 hover:bg-primary-700"
                        >
                          Accept
                        </Button>
                      )}
                      {app.status !== 'Rejected' && (
                        <Button
                          onClick={() => handleReject(app.id)}
                          className="px-2 py-1 text-sm bg-red-600 hover:bg-red-700"
                        >
                          Reject
                        </Button>
                      )}
                      <Button
                        onClick={() => openStatusModal(app)}
                        className="px-2 py-1 text-sm bg-green-600 hover:bg-green-700"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No applications found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TableFooter>
        <Pagination
          totalResults={filteredApplications.length}
          resultsPerPage={ITEMS_PER_PAGE}
          onChange={setCurrentPage}
          label={`Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(
            currentPage * ITEMS_PER_PAGE,
            filteredApplications.length
          )} of ${filteredApplications.length} applications`}
        />
      </TableFooter>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100"><span role="img" aria-label="applications">📋</span> Application Management Guide</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Pending:</strong> New applications awaiting initial review.</li>
          <li>• <strong>Reviewed:</strong> Application has been reviewed but not yet shortlisted.</li>
          <li>• <strong>Shortlisted:</strong> Applicant selected for interview or hire. View in Shortlisted Workers.</li>
          <li>• <strong>Rejected:</strong> Application rejected. Worker cannot reapply for same job.</li>
          <li>• Use <strong>Details</strong> to view full application and notes.</li>
          <li>• Use <strong>Shortlist/Reject</strong> for quick actions or <strong>Edit Status</strong> for detailed notes.</li>
        </ul>
      </div>

      {/* Application Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)}>
        <ModalHeader>Application Details</ModalHeader>
        <ModalBody>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Application ID</p>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">{selectedApplication.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Badge type={getStatusBadgeColor(selectedApplication.status)}>
                    {selectedApplication.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Applicant Name</p>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">{selectedApplication.applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contact Phone</p>
                  <p className="text-gray-700 dark:text-gray-200">{selectedApplication.applicantPhone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Job Applied For</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{selectedApplication.jobTitle}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                <p className="text-gray-700 dark:text-gray-200">{selectedApplication.experience}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Education</p>
                <p className="text-gray-700 dark:text-gray-200">{selectedApplication.education}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Applied Date</p>
                  <p className="text-gray-700 dark:text-gray-200">{selectedApplication.dateApplied}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reviewed Date</p>
                  <p className="text-gray-700 dark:text-gray-200">{selectedApplication.reviewedDate || '—'}</p>
                </div>
              </div>

              {selectedApplication.notes && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manager Notes</p>
                  <p className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    {selectedApplication.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => setIsDetailsModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Change Status Modal */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)}>
        <ModalHeader>Change Application Status</ModalHeader>
        <ModalBody>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Applicant</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{selectedApplication.applicantName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                <Badge type={getStatusBadgeColor(selectedApplication.status)}>
                  {selectedApplication.status}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  New Status
                </label>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="dark:bg-gray-700 dark:text-gray-200"
                >
                  {statuses
                    .filter((s) => s !== 'All')
                    .map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Manager Notes
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add notes about this applicant (reasons for decision, feedback, etc.)"
                  rows="4"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => setIsStatusModalOpen(false)}
            className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangeStatus}
            className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700"
          >
            Update Status
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

function CustomerApplications() {
  const [applications, setApplications] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/applications/my').then(setApplications).catch((requestError) => setError(requestError.message))
  }, [])

  return (
    <>
      <PageTitle>My Job Applications</PageTitle>
      {error && <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">Apply for casual farm work</h2>
        <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
          Browse open opportunities and submit an application from the available jobs page.
        </p>
        <Link className="inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700" to="/app/casual-jobs">
          Browse available jobs
        </Link>
      </div>
      <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
        <table className="w-full">
          <thead><tr className="text-xs text-left uppercase border-b"><th className="px-4 py-3">Job</th><th className="px-4 py-3">Applied</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody>{applications.map((application) => <tr key={application.id} className="border-b dark:border-gray-700"><td className="px-4 py-3">{application.jobTitle}</td><td className="px-4 py-3">{application.appliedAt}</td><td className="px-4 py-3">{application.status}</td></tr>)}</tbody>
        </table>
        {!applications.length && !error && <p className="p-6 text-sm text-gray-600 dark:text-gray-400">No applications submitted yet.</p>}
      </div>
    </>
  )
}

export default JobApplications
