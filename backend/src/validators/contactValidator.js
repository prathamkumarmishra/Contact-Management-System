const { body } = require('express-validator');

const contactValidator = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),

  body('alternativePhone')
    .optional({ checkFalsy: true })
    .trim(),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),

  body('designation')
    .optional({ checkFalsy: true })
    .trim(),

  body('department')
    .optional({ checkFalsy: true })
    .trim(),

  body('category')
    .optional({ checkFalsy: true })
    .isIn(['personal', 'work', 'family', 'friend', 'other']).withMessage('Invalid contact category'),

  body('address')
    .optional({ checkFalsy: true })
    .trim(),

  body('city')
    .optional({ checkFalsy: true })
    .trim(),

  body('state')
    .optional({ checkFalsy: true })
    .trim(),

  body('country')
    .optional({ checkFalsy: true })
    .trim(),

  body('zipCode')
    .optional({ checkFalsy: true })
    .trim(),

  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Please provide a valid website URL'),

  body('linkedin')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Please provide a valid LinkedIn profile URL'),

  body('birthday')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Please provide a valid birthday date in YYYY-MM-DD format'),

  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

  body('tags')
    .optional()
    .custom((value) => {
      // If tags is sent as string (e.g. from postman multipart form data), convert or validate
      if (typeof value === 'string') {
        return true;
      }
      if (Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string');
      }
      return false;
    }).withMessage('Tags must be an array of strings')
];

module.exports = {
  contactValidator
};
