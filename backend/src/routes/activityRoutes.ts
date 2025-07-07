import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getPatientActivities,
  createActivityLog,
  getActivityStats,
  getActivityLogs,
  logCustomActivity,
  getEnhancedActivityStats
} from '../controllers/activityController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/patients/activities
 * @desc Get patient activities (notifications, appointments, logs)
 * @access Private (Patient)
 */
router.get('/', getPatientActivities);

/**
 * @route POST /api/patients/activities
 * @desc Create a new activity log entry
 * @access Private (Patient)
 */
router.post('/', createActivityLog);

/**
 * @route GET /api/patients/activities/stats
 * @desc Get activity statistics for dashboard
 * @access Private (Patient)
 */
router.get('/stats', getActivityStats);

/**
 * @route GET /api/patients/activities/logs
 * @desc Get enhanced activity logs with filtering
 * @access Private (All authenticated users)
 */
router.get('/logs', getActivityLogs);

/**
 * @route POST /api/patients/activities/log
 * @desc Log custom activity
 * @access Private (All authenticated users)
 */
router.post('/log', logCustomActivity);

/**
 * @route GET /api/patients/activities/statistics
 * @desc Get enhanced activity statistics
 * @access Private (All authenticated users)
 */
router.get('/statistics', getEnhancedActivityStats);

export default router;
