import { Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';

/**
 * Get pending providers for admin approval
 * GET /api/admin/providers/pending
 */
export const getPendingProviders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
      return;
    }

    const { page = '1', limit = '10', status = 'PENDING' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where: {
          approvalStatus: status as string,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.provider.count({
        where: {
          approvalStatus: status as string,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        providers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Get pending providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending providers',
    });
  }
};

/**
 * Approve provider
 * PUT /api/admin/providers/:id/approve
 */
export const approveProvider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
      return;
    }

    const { id } = req.params;
    const { notes } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Provider ID is required',
      });
      return;
    }

    // Check if provider exists
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
      return;
    }

    if (provider.approvalStatus === 'APPROVED') {
      res.status(400).json({
        success: false,
        error: 'Provider is already approved',
      });
      return;
    }

    // Update provider status
    const updatedProvider = await prisma.provider.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        isVerified: true,
        isActive: true,
        rejectionReason: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send approval notification email to provider
    logger.info('Provider approved:', {
      providerId: provider.id,
      providerEmail: provider.user.email,
      approvedBy: req.user.email,
    });

    res.json({
      success: true,
      data: { provider: updatedProvider },
      message: 'Provider approved successfully',
    });
  } catch (error) {
    logger.error('Approve provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve provider',
    });
  }
};

/**
 * Reject provider
 * PUT /api/admin/providers/:id/reject
 */
export const rejectProvider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Provider ID is required',
      });
      return;
    }

    if (!reason) {
      res.status(400).json({
        success: false,
        error: 'Rejection reason is required',
      });
      return;
    }

    // Check if provider exists
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
      return;
    }

    if (provider.approvalStatus === 'REJECTED') {
      res.status(400).json({
        success: false,
        error: 'Provider is already rejected',
      });
      return;
    }

    // Update provider status
    const updatedProvider = await prisma.provider.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        rejectionReason: reason,
        isVerified: false,
        isActive: false,
        approvedBy: null,
        approvedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send rejection notification email to provider
    logger.info('Provider rejected:', {
      providerId: provider.id,
      providerEmail: provider.user.email,
      rejectedBy: req.user.email,
      reason,
    });

    res.json({
      success: true,
      data: { provider: updatedProvider },
      message: 'Provider rejected successfully',
    });
  } catch (error) {
    logger.error('Reject provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject provider',
    });
  }
};

/**
 * Get all providers (for admin)
 * GET /api/admin/providers
 */
export const getAllProviders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
      return;
    }

    const { page = '1', limit = '10', status, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};

    if (status) {
      where.approvalStatus = status;
    }

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            email: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
        },
        {
          specialization: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.provider.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        providers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Get all providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get providers',
    });
  }
};
