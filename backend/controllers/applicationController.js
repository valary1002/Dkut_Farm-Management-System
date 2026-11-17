const { getDatabase } = require('../config/database')
const { toObjectId, withIds } = require('../utils/mongo')

async function apply(req, res, next) {
  try {
    const { fullName, email, phone, address, applicationMessage } = req.body
    const jobId = toObjectId(req.params.jobId)
    const job = jobId && await getDatabase().collection('casual_jobs').findOne({ _id: jobId, status: 'OPEN' })
    if (!job) return res.status(400).json({ message: 'Job is not open or does not exist' })
    const result = await getDatabase().collection('job_applications').insertOne({ jobId, customerId: toObjectId(req.user.userId), fullName, email, phone, address, applicationMessage, status: 'PENDING', appliedAt: new Date() })
    res.status(201).json({ id: result.insertedId.toString(), message: 'Application submitted' })
  } catch (error) { if (error.code === 11000) return res.status(409).json({ message: 'You already applied for this job' }); next(error) }
}
async function mine(req, res, next) { try { const rows = await getDatabase().collection('job_applications').find({ customerId: toObjectId(req.user.userId) }).sort({ appliedAt: -1 }).toArray(); const jobs = getDatabase().collection('casual_jobs'); res.json(await Promise.all(rows.map(async (row) => ({ ...withIds([row])[0], jobTitle: (await jobs.findOne({ _id: row.jobId }))?.title })))) } catch (error) { next(error) } }
async function all(req, res, next) { try { const rows = await getDatabase().collection('job_applications').find().sort({ appliedAt: -1 }).toArray(); const db = getDatabase(); res.json(await Promise.all(rows.map(async (row) => { const [job, user] = await Promise.all([db.collection('casual_jobs').findOne({ _id: row.jobId }), db.collection('users').findOne({ _id: row.customerId })]); return { ...withIds([row])[0], jobTitle: job?.title, applicantName: row.fullName || user?.fullName, email: row.email || user?.email, phone: row.phone || user?.phone } }))) } catch (error) { next(error) } }
async function review(req, res, next) { try { const { status, reviewNotes } = req.body; if (!['SHORTLISTED', 'ACCEPTED', 'REJECTED', 'PENDING'].includes(status)) return res.status(400).json({ message: 'Invalid application status' }); await getDatabase().collection('job_applications').updateOne({ _id: toObjectId(req.params.id) }, { $set: { status, reviewNotes, reviewedBy: toObjectId(req.user.userId), reviewedAt: new Date() } }); res.json({ message: 'Application reviewed' }) } catch (error) { next(error) } }
module.exports = { apply, mine, all, review }
