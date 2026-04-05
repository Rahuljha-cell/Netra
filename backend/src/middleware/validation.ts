import { body, query, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }
  next();
};

export const validateCreateIncident = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('category').isIn(['animal', 'crime', 'accident', 'environmental']).withMessage('Invalid category'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [lng, lat]'),
  body('location.coordinates.0')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('location.coordinates.1')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  handleValidationErrors,
];

export const validateNearbyQuery = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Radius must be 0.1-50 km'),
  handleValidationErrors,
];

export const validateVote = [
  param('id').isMongoId().withMessage('Invalid incident ID'),
  body('vote').isIn(['up', 'down']).withMessage('Vote must be "up" or "down"'),
  handleValidationErrors,
];

export const validateSendOtp = [
  body('phone')
    .trim()
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Valid phone number required'),
  handleValidationErrors,
];

export const validateVerifyOtp = [
  body('phone')
    .trim()
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Valid phone number required'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  handleValidationErrors,
];

export const validateObjectId = [
  param('id').isMongoId().withMessage('Invalid ID'),
  handleValidationErrors,
];
