import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { incidentService } from '../services/incidentService';
import { AppError } from '../middleware/errorHandler';
import Incident from '../models/Incident';
import { getScraperStatus } from '../services/scraper/scraperService';

export const listIncidents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await incidentService.list({
      category: req.query.category as string,
      severity: req.query.severity as string,
      status: req.query.status as string,
      source: req.query.source as string,
      city: req.query.city as string,
      state: req.query.state as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20,
      sort: (req.query.sort as string | undefined) || '-createdAt',
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getIncident = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incident = await incidentService.getById(req.params.id as string);
    if (!incident) {
      throw new AppError('Incident not found', 404);
    }
    res.json(incident);
  } catch (error) {
    next(error);
  }
};

export const createIncident = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const incident = await incidentService.create(req.body, req.user._id.toString());
    res.status(201).json(incident);
  } catch (error) {
    next(error);
  }
};

export const getNearbyIncidents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : 5;
    const limit: number = req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 50;

    const incidents = await incidentService.findNearby(lat, lng, radius, limit);
    res.json({ incidents, count: incidents.length });
  } catch (error) {
    next(error);
  }
};

export const getHeatmapData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let bounds: { sw: [number, number]; ne: [number, number] } | undefined;

    if (req.query.swLat && req.query.swLng && req.query.neLat && req.query.neLng) {
      bounds = {
        sw: [parseFloat(req.query.swLng as string), parseFloat(req.query.swLat as string)],
        ne: [parseFloat(req.query.neLng as string), parseFloat(req.query.neLat as string)],
      };
    }

    const data = await incidentService.getHeatmapData(bounds);
    res.json({ data, count: data.length });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await incidentService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const voteIncident = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const incident = await incidentService.vote(
      req.params.id as string,
      req.user._id.toString(),
      req.body.vote
    );

    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    res.json({ upvotes: incident.upvotes, downvotes: incident.downvotes });
  } catch (error) {
    next(error);
  }
};

// Feed endpoint for Kumamap-style bulletin sidebar
export const getFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const cursor = req.query.cursor as string;
    const category = req.query.category as string;
    const source = req.query.source as string;

    // Default feed shows last 60 days, but timeRange=all for charts/analytics
    const timeRange = req.query.timeRange as string || '60d';
    const timeMs: Record<string, number> = {
      '30d': 30 * 24 * 60 * 60 * 1000,
      '60d': 60 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000,
      '6m': 180 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };

    const query: Record<string, any> = { status: { $ne: 'rejected' } };
    if (category && category !== 'all') query.category = category;
    if (source) query.source = source;
    if (cursor) query._id = { $lt: cursor };
    // Apply time filter (skip for 'all' — used by charts)
    if (timeRange !== 'all' && timeMs[timeRange]) {
      query.createdAt = { $gte: new Date(Date.now() - timeMs[timeRange]) };
    }

    const [incidents, total] = await Promise.all([
      Incident.find(query)
        .sort({ sourcePublishedAt: -1, createdAt: -1 })
        .limit(limit)
        .select('title category subCategory specificType location address severity source sourceName imageUrl imageThumbnail sourceUrl sourcePublishedAt viewCount createdAt')
        .lean(),
      Incident.countDocuments(query),
    ]);

    const lastUpdated = await Incident.findOne({ source: { $in: ['news', 'gdelt'] } })
      .sort({ createdAt: -1 }).select('createdAt').lean();

    res.json({
      total,
      lastUpdated: lastUpdated?.createdAt || new Date(),
      incidents,
      nextCursor: incidents.length === limit ? incidents[incidents.length - 1]._id : null,
    });
  } catch (error) {
    next(error);
  }
};

// Lightweight map dots for rendering thousands of markers
export const getMapDots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = req.query.category as string;
    const timeRange = req.query.timeRange as string || '60d';

    const query: Record<string, any> = { status: { $ne: 'rejected' } };
    if (category && category !== 'all') query.category = category;

    const timeMs: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '60d': 60 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };
    if (timeMs[timeRange]) {
      query.createdAt = { $gte: new Date(Date.now() - timeMs[timeRange]) };
    }

    const dots = await Incident.find(query)
      .select('location category subCategory severity')
      .lean();

    const mapped = dots.map(d => ({
      id: d._id,
      lat: d.location.coordinates[1],
      lng: d.location.coordinates[0],
      category: d.category,
      subCategory: d.subCategory,
      severity: d.severity,
    }));

    res.json({ dots: mapped, count: mapped.length });
  } catch (error) {
    next(error);
  }
};

// Increment view count
export const incrementView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Incident.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Scraper health check
export const getScraperHealth = async (_req: Request, res: Response): Promise<void> => {
  const status = getScraperStatus();
  res.json({ ...status, timestamp: new Date().toISOString() });
};
