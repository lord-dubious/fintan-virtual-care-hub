import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../types';
import { logger } from '../lib/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = (req as AuthenticatedRequest).userId;
    const ext = path.extname(file.originalname);
    const filename = `profile-${userId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload profile picture
export const uploadProfilePicture = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    // Generate the URL for the uploaded file
    const baseUrl = process.env['API_BASE_URL'] || 'http://50.118.225.14:3000';
    const profilePictureUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;

    // Update user's profile picture in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: profilePictureUrl,
        image: profilePictureUrl, // Also update the image field for compatibility
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`✅ Profile picture uploaded for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
        profilePictureUrl,
      },
      message: 'Profile picture uploaded successfully',
    });
  } catch (error: unknown) {
    logger.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile picture',
    });
  }
};

// Get user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        profilePicture: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: unknown) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
};

// Update user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { name, phone } = req.body;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        profilePicture: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`✅ Profile updated for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error: unknown) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
};

// Delete profile picture
export const deleteProfilePicture = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Get current user to find existing profile picture
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true, image: true },
    });

    if (user?.profilePicture) {
      // Extract filename from URL and delete file
      const filename = path.basename(user.profilePicture);
      const filePath = path.join(process.cwd(), 'uploads', 'profiles', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Update user to remove profile picture
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: null,
        image: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        profilePicture: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`✅ Profile picture deleted for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile picture deleted successfully',
    });
  } catch (error: unknown) {
    logger.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete profile picture',
    });
  }
};
