const express = require('express');
const fileController = require('../controllers/file.controller');
const validate = require('../middlewares/validate');
const { codeParam, initiateFiles } = require('../middlewares/validators');
const { initiateLimiter, downloadLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Explicit POST routes first so /initiate is not swallowed by /:code patterns.
router.post(
  '/initiate',
  initiateLimiter,
  initiateFiles,
  validate,
  fileController.initiateUpload
);

router.post(
  '/:code/complete',
  downloadLimiter,
  codeParam,
  validate,
  fileController.completeUpload
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
