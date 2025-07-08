import { Router } from 'express';
import {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from '@/controllers/medicalRecordController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';
import { rateLimiters } from '@/middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/medical-records
 * @desc    Create new medical record
 * @access  Private (Provider, Doctor)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('PROVIDER', 'DOCTOR'),
  rateLimiters.api,
  createMedicalRecord
);

/**
 * @route   GET /api/medical-records
 * @desc    Get medical records with filtering and pagination
 * @access  Private (Patient, Provider, Doctor, Admin)
 */
router.get(
  '/',
  authenticateToken,
  rateLimiters.api,
  getMedicalRecords
);

/**
 * @route   GET /api/medical-records/:id
 * @desc    Get specific medical record
 * @access  Private (Patient, Provider, Doctor, Admin)
 */
router.get(
  '/:id',
  authenticateToken,
  rateLimiters.api,
  getMedicalRecord
);

/**
 * @route   PUT /api/medical-records/:id
 * @desc    Update medical record
 * @access  Private (Provider, Doctor)
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('PROVIDER', 'DOCTOR'),
  rateLimiters.api,
  updateMedicalRecord
);

/**
 * @route   DELETE /api/medical-records/:id
 * @desc    Delete medical record
 * @access  Private (Provider, Doctor, Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('PROVIDER', 'DOCTOR', 'ADMIN'),
  rateLimiters.api,
  deleteMedicalRecord
);

export default router;
