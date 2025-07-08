import { Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';

/**
 * Get appointments for provider calendar
 * GET /api/appointments/calendar?providerId=&start=&end=
 */
export const getAppointmentsCalendar = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({ success: false, error: 'Authentication required' });
			return;
		}

		const { providerId, start, end } = req.query as Record<string, string>;

		if (!providerId || !start || !end) {
			res.status(400).json({ success: false, error: 'providerId, start, and end are required' });
			return;
		}

		// Providers can only view their own calendar unless admin
		if (req.user.role === 'PROVIDER' && req.user.id !== providerId) {
			res.status(403).json({ success: false, error: 'Access denied' });
			return;
		}

		const startDate = new Date(start);
		const endDate = new Date(end);

		const appointments = await prisma.appointment.findMany({
			where: {
				providerId,
				appointmentDate: { gte: startDate, lte: endDate },
				status: { in: ['SCHEDULED', 'CONFIRMED', 'COMPLETED'] },
			},
			select: {
				id: true,
				appointmentDate: true,
				status: true,
				consultationType: true,
			},
		});

		res.json({ success: true, data: { appointments } });
	} catch (error) {
		logger.error('Calendar fetch error:', error);
		res.status(500).json({ success: false, error: 'Failed to fetch calendar' });
	}
};
