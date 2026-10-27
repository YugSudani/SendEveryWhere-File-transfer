const mongoose = require('mongoose');

const storedFileSchema = new mongoose.Schema(
  {
    // Random, unguessable object key under which the file lives in the bucket.
    key: { type: String, required: true },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
  },
  { _id: false }
);

// IMPORTANT: there is deliberately NO MongoDB TTL index on this collection.
// A TTL index deletes documents on its own, without deleting the bucket
// objects they point to, which leaves orphaned files in storage forever.
// Documents are removed only by the cleanup cron, and only after every object
// has been deleted (and verified gone) from the bucket.
//
// autoIndex is off: indexes are created explicitly in config/db.js, after any
// stray TTL index left over from older versions has been dropped.
const fileShareSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    files: { type: [storedFileSchema], required: true },
    totalSize: { type: Number, required: true },
    // 'pending' until the browser confirms every presigned PUT finished.
    status: { type: String, enum: ['pending', 'ready'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, autoIndex: false }
);

module.exports = mongoose.model('FileShare', fileShareSchema);
