const { ObjectId } = require('mongodb')

function toObjectId(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null
}

function withId(document) {
  if (!document) return document
  const { _id, ...rest } = document
  return { id: _id.toString(), ...rest }
}

function withIds(documents) {
  return documents.map(withId)
}

module.exports = { toObjectId, withId, withIds }