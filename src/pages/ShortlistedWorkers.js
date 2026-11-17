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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Select,
  Pagination
} from '@windmill/react-ui'
import { SearchIcon } from '../icons'
import { apiRequest } from '../utils/api'

// Reuse same applications data, filtered for shortlisted only
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

function ShortlistedWorkers() {
  const [applications, setApplications] = useState(initialApplicationsData)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')
  const [interviewLocation, setInterviewLocation] = useState('')
  const [interviewNotes, setInterviewNotes] = useState('')

  useEffect(() => {
    apiRequest('/applications').then((items) => setApplications(items.map((item) => ({
      ...item,
      applicantName: item.applicantName,
      applicantPhone: item.phone,
      status: item.status === 'SHORTLISTED' ? 'Shortlisted' : item.status,
      notes: item.review_notes || '',
    })))).catch(() => {})
  }, [])

  const ITEMS_PER_PAGE = 8

  // Get shortlisted applicants only
  const shortlistedApplications = applications.filter((app) => app.status === 'Shortlisted')

  // Get unique shortlisted jobs
  const uniqueJobs = ['All', ...new Set(shortlistedApplications.map((app) => app.jobTitle))]

  // Filter shortlisted applications
  const filteredApplications = shortlistedApplications.filter((app) => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantPhone.includes(searchQuery)
    const matchesJob = selectedJob === 'All' || app.jobTitle === selectedJob
    return matchesSearch && matchesJob
  })

  const paginatedWorkers = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Summary statistics
  const totalShortlisted = shortlistedApplications.length
  const jobsWithShortlisted = [...new Set(shortlistedApplications.map((app) => app.jobId))].length

  // Open details modal
  const openDetailsModal = (application) => {
    setSelectedWorker(application)
    setIsDetailsModalOpen(true)
  }

  // Open schedule interview modal
  const openScheduleModal = (application) => {
    setSelectedWorker(application)
    setInterviewDate('')
    setInterviewTime('')
    setInterviewLocation('')
    setInterviewNotes('')
    setIsScheduleModalOpen(true)
  }

  // Schedule interview (frontend simulation)
  const handleScheduleInterview = () => {
    // In future backend, this would create an interview record
    alert(`Interview scheduled for ${selectedWorker.applicantName}\nDate: ${interviewDate}\nTime: ${interviewTime}\nLocation: ${interviewLocation}`)
    setIsScheduleModalOpen(false)
    setSelectedWorker(null)
  }

  // Remove from shortlist
  const handleRemoveFromShortlist = async (applicationId) => {
    try {
      await apiRequest(`/applications/${applicationId}/review`, { method: 'PATCH', body: JSON.stringify({ status: 'PENDING', reviewNotes: '' }) })
      setApplications(applications.map((app) => app.id === applicationId ? { ...app, status: 'Pending' } : app))
    } catch (error) {
      return
    }
    if (paginatedWorkers.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <>
      <PageTitle>Shortlisted Workers</PageTitle>

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl"><span role="img" aria-label="workers">👥</span></div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Total Shortlisted</p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{totalShortlisted}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl"><span role="img" aria-label="jobs">💼</span></div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{jobsWithShortlisted}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mr-4 text-2xl"><span role="img" aria-label="ready to hire">⭐</span></div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Ready to Hire</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{totalShortlisted}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid gap-4 mb-6 md:grid-cols-2">
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
      </div>

      {/* Shortlisted Workers Table */}
      <div className="w-full overflow-hidden rounded-lg shadow-xs">
        <Table>
          <TableHeader>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Worker Name</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Contact Info</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Job Position</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Experience</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Shortlisted Date</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">Actions</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {paginatedWorkers.length > 0 ? (
              paginatedWorkers.map((worker) => (
                <TableRow key={worker.id} className="border-b dark:border-gray-600">
                  <TableCell className="text-gray-700 dark:text-gray-200 font-semibold">{worker.applicantName}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">{worker.applicantPhone}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">{worker.jobTitle}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200 text-sm">{worker.experience}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">{worker.reviewedDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openDetailsModal(worker)}
                        className="px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700"
                      >
                        View
                      </Button>
                      <Button
                        onClick={() => openScheduleModal(worker)}
                        className="px-2 py-1 text-sm bg-green-600 hover:bg-green-700"
                      >
                        Interview
                      </Button>
                      <Button
                        onClick={() => handleRemoveFromShortlist(worker.id)}
                        className="px-2 py-1 text-sm bg-red-600 hover:bg-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="6" className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No shortlisted workers found. Applications will appear here once shortlisted.
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
          )} of ${filteredApplications.length} shortlisted workers`}
        />
      </TableFooter>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
        <h3 className="mb-2 font-semibold text-green-900 dark:text-green-100">✓ Shortlisted Workers Management</h3>
        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
          <li>• <strong>View:</strong> See full worker details and application information.</li>
          <li>• <strong>Interview:</strong> Schedule an interview with the worker (date, time, location).</li>
          <li>• <strong>Remove:</strong> Remove worker from shortlist if not suitable.</li>
          <li>• Workers shortlisted here are your top candidates ready for hiring decision.</li>
          <li>• Schedule interviews to learn more about applicants before final hiring.</li>
        </ul>
      </div>

      {/* Worker Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)}>
        <ModalHeader>Shortlisted Worker Details</ModalHeader>
        <ModalBody>
          {selectedWorker && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900 p-3 rounded border border-green-200 dark:border-green-700">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">✓ Shortlisted</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Application ID</p>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">{selectedWorker.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Shortlisted Date</p>
                  <p className="text-gray-700 dark:text-gray-200">{selectedWorker.reviewedDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">{selectedWorker.applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="text-gray-700 dark:text-gray-200">{selectedWorker.applicantPhone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Job Position Applied For</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{selectedWorker.jobTitle}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                <p className="text-gray-700 dark:text-gray-200">{selectedWorker.experience}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Education</p>
                <p className="text-gray-700 dark:text-gray-200">{selectedWorker.education}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Application Date</p>
                <p className="text-gray-700 dark:text-gray-200">{selectedWorker.dateApplied}</p>
              </div>

              {selectedWorker.notes && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Selection Feedback</p>
                  <p className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    {selectedWorker.notes}
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

      {/* Schedule Interview Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)}>
        <ModalHeader>Schedule Interview</ModalHeader>
        <ModalBody>
          {selectedWorker && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Worker Name</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{selectedWorker.applicantName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contact Phone</p>
                <p className="text-gray-700 dark:text-gray-200">{selectedWorker.applicantPhone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Position</p>
                <p className="text-gray-700 dark:text-gray-200">{selectedWorker.jobTitle}</p>
              </div>

              <hr className="dark:border-gray-600" />

              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-200">Interview Date *</span>
                </Label>
                <Input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-200">Interview Time *</span>
                </Label>
                <Input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-200">Interview Location *</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g., Farm Office, Zoom Meeting Link"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                  className="dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              <div>
                <Label>
                  <span className="text-gray-700 dark:text-gray-200">Additional Notes</span>
                </Label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Preparation notes, interview focus areas, etc."
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => setIsScheduleModalOpen(false)}
            className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleScheduleInterview}
            className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700"
          >
            Schedule Interview
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default ShortlistedWorkers
