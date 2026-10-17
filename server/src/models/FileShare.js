const mongoose = require('mongoose');
const constants = require('../config/constants');

const storedFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
  },
  { _id: false }
);

const fileShareSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    files: { type: [storedFileSchema], required: true },
    totalSize: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Safety net only. `expiresAt` is already set to now + EXPIRY_MINUTES at
// creation time, so this index is purely a backstop that reaps documents the
// cleanup cron never processed. The grace period keeps it from deleting a
// document before the cron has had a chance to delete the stored files.
fileShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: constants.TTL_GRACE_SECONDS });

module.exports = mongoose.model('FileShare', fileShareSchema);
