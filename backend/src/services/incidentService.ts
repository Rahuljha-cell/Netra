import Incident, { IIncident } from '../models/Incident';
import User from '../models/User';
import { getIO } from '../config/socket';
import { aiService } from './aiService';
import { cacheService } from './cacheService';
import { Types } from 'mongoose';

export interface IncidentFilters {
  category?: string;
  severity?: string;
  status?: string;
  source?: string;
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const incidentService = {
  async list(filters: IncidentFilters) {
    const {
      category, severity, status, source, city, state,
      startDate, endDate,
      page = 1, limit = 20, sort = '-createdAt',
    } = filters;

    const query: Record<string, any> = {};
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (source) query.source = source;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [incidents, total] = await Promise.all([
      Incident.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'name avatar reputation')
        .lean(),
      Incident.countDocuments(query),
    ]);

    return {
      incidents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const cached = await cacheService.get(`incident:${id}`);
    if (cached) return JSON.parse(cached);

    const incident = await Incident.findById(id)
      .populate('reportedBy', 'name avatar reputation')
      .lean();

    if (incident) {
      await cacheService.set(`incident:${id}`, JSON.stringify(incident), 300);
    }

    return incident;
  },

  async create(data: Partial<IIncident>, userId: string) {
    const incident = new Incident({
      ...data,
      reportedBy: new Types.ObjectId(userId),
      location: {
        type: 'Point',
        coordinates: data.location?.coordinates,
      },
    });

    await incident.save();

    // Increment user reports count
    await User.findByIdAndUpdate(userId, { $inc: { reportsCount: 1 } });

    // Trigger AI validation asynchronously
    aiService.validateIncident(incident._id.toString(), {
      title: incident.title,
      description: incident.description,
      category: incident.category,
      media: incident.media,
    }).catch((err: unknown) => console.error('[AI] Validation failed:', err));

    // Emit real-time event
    try {
      const io = getIO();
      const lat = incident.location.coordinates[1];
      const lng = incident.location.coordinates[0];
      const roomKey = `geo:${Math.round(lat * 10) / 10}:${Math.round(lng * 10) / 10}`;

      io.to(roomKey).emit('incident:new', {
        id: incident._id,
        title: incident.title,
        category: incident.category,
        severity: incident.severity,
        location: incident.location,
      });

      io.emit('incident:created', { id: incident._id, category: incident.category });
    } catch {
      // Socket not initialized in tests
    }

    return incident;
  },

  async findNearby(lat: number, lng: number, radiusKm: number = 5, limit: number = 50) {
    const cacheKey = `nearby:${lat.toFixed(2)}:${lng.toFixed(2)}:${radiusKm}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const incidents = await Incident.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000, // meters
        },
      },
      status: { $ne: 'rejected' },
    })
      .limit(limit)
      .select('title category severity location address riskScore status createdAt')
      .lean();

    await cacheService.set(cacheKey, JSON.stringify(incidents), 120);
    return incidents;
  },

  async getHeatmapData(bounds?: { sw: [number, number]; ne: [number, number] }) {
    const match: Record<string, any> = {
      status: { $ne: 'rejected' },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // last 30 days
    };

    if (bounds) {
      match.location = {
        $geoWithin: {
          $box: [bounds.sw, bounds.ne],
        },
      };
    }

    const data = await Incident.aggregate([
      { $match: match },
      {
        $project: {
          coordinates: '$location.coordinates',
          category: 1,
          severity: 1,
          riskScore: 1,
        },
      },
    ]);

    return data;
  },

  async getStats() {
    const cached = await cacheService.get('incident:stats');
    if (cached) return JSON.parse(cached);

    const [byCategory, bySeverity, byStatus, recentTrend] = await Promise.all([
      Incident.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Incident.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Incident.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Incident.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const stats = { byCategory, bySeverity, byStatus, recentTrend };
    await cacheService.set('incident:stats', JSON.stringify(stats), 600);
    return stats;
  },

  async vote(incidentId: string, userId: string, vote: 'up' | 'down') {
    const incident = await Incident.findById(incidentId);
    if (!incident) return null;

    const existingVote = incident.votedBy.find(
      (v) => v.userId.toString() === userId
    );

    if (existingVote) {
      if (existingVote.vote === vote) {
        // Remove vote (toggle off)
        incident.votedBy = incident.votedBy.filter(
          (v) => v.userId.toString() !== userId
        );
        if (vote === 'up') incident.upvotes--;
        else incident.downvotes--;
      } else {
        // Change vote direction
        existingVote.vote = vote;
        if (vote === 'up') {
          incident.upvotes++;
          incident.downvotes--;
        } else {
          incident.downvotes++;
          incident.upvotes--;
        }
      }
    } else {
      // New vote
      incident.votedBy.push({ userId: new Types.ObjectId(userId), vote });
      if (vote === 'up') incident.upvotes++;
      else incident.downvotes++;
    }

    await incident.save();
    await cacheService.del(`incident:${incidentId}`);
    return incident;
  },
};
