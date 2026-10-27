const { body, param } = require('express-validator');
const constants = require('../config/constants');

const codeParam = [
  param('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Code must be 6 digits')
    .isNumeric()
    .withMessage('Code must be numeric'),
];

// Body for POST /initiate: array of file descriptors (no bytes here).
const initiateFiles = [
  body('files')
    .isArray({ min: 1, max: constants.MAX_FILES_COUNT })
    .withMessage(`Provide 1 to ${constants.MAX_FILES_COUNT} files`)
    .bail()
    .custom((files) => {
      const totalBytes = files.reduce((sum, file) => sum + Number(file?.size || 0), 0);
      if (totalBytes > constants.MAX_TOTAL_SIZE_BYTES) {
        throw new Error(
          `Out of limit: total size must stay under ${constants.MAX_TOTAL_SIZE_GB}GB.`
        );
      }
      return true;
    }),
  body('files.*.filename')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Filename is required')
    .isLength({ max: 255 })
    .withMessage('Filename too long'),
  body('files.*.size')
    .isInt({ min: 1, max: constants.MAX_FILE_SIZE_BYTES })
    .withMessage(`Each file must be between 1B and ${constants.MAX_FILE_SIZE_MB}MB`),
  body('files.*.type')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Invalid file type'),
];

module.exports = { codeParam, initiateFiles };
