const mongoose = require('mongoose');

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

// TTL index: MongoDB removes the document once expiresAt passes.
fileShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('FileShare', fileShareSchema);
