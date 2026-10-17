const { body, param } = require('express-validator');

const codeParam = [
  param('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Code must be 6 digits')
    .isNumeric()
    .withMessage('Code must be numeric'),
];

const uploadBody = [
  body().custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error('At least one file is required');
    }
    return true;
  }),
];

module.exports = { codeParam, uploadBody };
