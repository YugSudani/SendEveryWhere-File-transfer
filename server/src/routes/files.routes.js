const express = require('express');
const fileController = require('../controllers/file.controller');
const { upload, totalSizeLimit } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { codeParam } = require('../middlewares/validators');
const { uploadLimiter, downloadLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post(
  '/upload',
  uploadLimiter,
  upload.array('files'),
  totalSizeLimit,
  fileController.uploadFiles
);

router.get('/:code', downloadLimiter, codeParam, validate, fileController.getFileInfo);

router.get(
  '/:code/download',
  downloadLimiter,
  codeParam,
  validate,
  fileController.downloadFiles
);

module.exports = router;
