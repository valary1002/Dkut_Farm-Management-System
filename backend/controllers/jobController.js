const { getDatabase } = require('../config/database')
const { toObjectId, withIds } = require('../utils/mongo')

async function list(req, res, next) {
  try { const rows = await getDatabase().collection('casual_jobs').find({ status: 'OPEN' }).sort({ startDate: 1 }).toArray(); res.json(withIds(rows)) } catch (error) { next(error) }
}
async function listAll(req, res, next) {
  try { const rows = await getDatabase().collection('casual_jobs').aggregate([{ $sort: { createdAt: -1 } }, { $lookup: { from: 'job_applications', localField: '_id', foreignField: 'jobId', as: 'applications' } }, { $set: { applicants: { $size: '$applications' } } }, { $project: { applications: 0 } }]).toArray(); res.json(withIds(rows)) } catch (error) { next(error) }
}
async function create(req, res, next) {
  try {
    const { title, description, activity, workersRequired, dailyWage, deadline, startDate, status = 'DRAFT' } = req.body
    if (!title || !description || !activity || !Number.isFinite(Number(workersRequired)) || Number(workersRequired) <= 0 || !Number.isFinite(Number(dailyWage)) || Number(dailyWage) <= 0 || !['DRAFT', 'OPEN', 'CLOSED'].includes(status)) return res.status(400).json({ message: 'Invalid job details' })
    const result = await getDatabase().collection('casual_jobs').insertOne({ title, description, activity, workersRequired: Number(workersRequired), dailyWage: Number(dailyWage), deadline, startDate, status, createdBy: toObjectId(req.user.userId), createdAt: new Date(), updatedAt: new Date() })
    res.status(201).json({ id: result.insertedId.toString(), message: 'Job created' })
  } catch (error) { next(error) }
}
async function update(req, res, next) {
  try { const { title, description, activity, workersRequired, dailyWage, deadline, startDate, status } = req.body; const changes = Object.fromEntries(Object.entries({ title, description, activity, workersRequired: workersRequired === undefined ? undefined : Number(workersRequired), dailyWage: dailyWage === undefined ? undefined : Number(dailyWage), deadline, startDate, status }).filter(([, value]) => value !== undefined)); changes.updatedAt = new Date(); await getDatabase().collection('casual_jobs').updateOne({ _id: toObjectId(req.params.id) }, { $set: changes }); res.json({ message: 'Job updated' }) } catch (error) { next(error) }
}
async function remove(req, res, next) {
  try {
    const id = toObjectId(req.params.id)
    if (!id) return res.status(400).json({ message: 'Invalid job id' })
    const referenced = await getDatabase().collection('job_applications').findOne({ jobId: id }, { projection: { _id: 1 } })
    if (referenced) return res.status(409).json({ message: 'Job cannot be deleted because it has applications' })
    const result = await getDatabase().collection('casual_jobs').deleteOne({ _id: id })
    if (result.deletedCount !== 1) return res.status(404).json({ message: 'Job not found' })
    res.status(204).send()
  } catch (error) { next(error) }
}
module.exports = { list, listAll, create, update, remove }
