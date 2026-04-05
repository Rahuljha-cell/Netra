import { Request, Response, NextFunction } from 'express';
import Incident from '../models/Incident';
import User from '../models/User';
import { cacheService } from '../services/cacheService';
import { AppError } from '../middleware/errorHandler';

export const getModerationQueue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 50) : 20;
    const skip = (page - 1) * limit;

    const [incidents, total] = await Promise.all([
      Incident.find({ status: 'pending' })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'name phone reputation')
        .lean(),
      Incident.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      incidents,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const moderateIncident = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, riskScore } = req.body;

    if (status && !['verified', 'resolved', 'rejected'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const update: Record<string, any> = {};
    if (status) update.status = status;
    if (riskScore !== undefined) update.riskScore = riskScore;

    const incident = await Incident.findByIdAndUpdate(id, update, { new: true }).lean();

    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    // Invalidate cache
    await cacheService.del(`incident:${id}`);

    res.json(incident);
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cached = await cacheService.get('admin:analytics');
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalIncidents,
      pendingCount,
      last30Days,
      last7Days,
      topCities,
      topReporters,
      avgResolutionTime,
    ] = await Promise.all([
      Incident.countDocuments(),
      Incident.countDocuments({ status: 'pending' }),
      Incident.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Incident.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Incident.aggregate([
        { $group: { _id: '$address.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      User.aggregate([
        { $match: { reportsCount: { $gt: 0 } } },
        { $sort: { reportsCount: -1 } },
        { $limit: 10 },
        { $project: { name: 1, phone: 1, reportsCount: 1, reputation: 1 } },
      ]),
      Incident.aggregate([
        { $match: { status: 'resolved' } },
        {
          $project: {
            resolutionTime: { $subtract: ['$updatedAt', '$createdAt'] },
          },
        },
        { $group: { _id: null, avg: { $avg: '$resolutionTime' } } },
      ]),
    ]);

    const analytics = {
      totalIncidents,
      pendingCount,
      last30Days,
      last7Days,
      topCities,
      topReporters,
      avgResolutionTimeMs: avgResolutionTime[0]?.avg || 0,
    };

    await cacheService.set('admin:analytics', JSON.stringify(analytics), 300);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};
