import { Router } from 'express';
import {
  uploadProfilePicture,
  getProfile,
  updateProfile,
  deleteProfilePicture,
  upload
} from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All profile routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/', getProfile);

// Update user profile
router.put('/', updateProfile);

// Upload profile picture
router.post('/picture', upload.single('profilePicture'), uploadProfilePicture);

// Delete profile picture
router.delete('/picture', deleteProfilePicture);

export default router;
