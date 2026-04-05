import { Request, Response, NextFunction } from 'express';
import Guide from '../models/Guide';
import { AppError } from '../middleware/errorHandler';
import { cacheService } from '../services/cacheService';

export const listGuides = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, region, lang } = req.query;
    const query: Record<string, any> = { isActive: true };

    if (category) query.category = category;
    if (region) query.region = region;

    const cacheKey = `guides:${category || 'all'}:${region || 'all'}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const guides = await Guide.find(query).sort('-incidentCount').lean();

    // If language preference is specified, extract only that language's content
    const language = (lang as string) || 'en';
    const localizedGuides = guides.map((guide) => ({
      ...guide,
      title: guide.title[language] || guide.title['en'] || Object.values(guide.title)[0],
      content: guide.content[language] || guide.content['en'] || Object.values(guide.content)[0],
      seasonalWarnings: guide.seasonalWarnings?.map((sw) => ({
        months: sw.months,
        warning: sw.warning[language] || sw.warning['en'] || Object.values(sw.warning)[0],
      })),
    }));

    await cacheService.set(cacheKey, JSON.stringify(localizedGuides), 1800);
    res.json(localizedGuides);
  } catch (error) {
    next(error);
  }
};

export const getGuide = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const guide = await Guide.findById(req.params.id).lean();
    if (!guide) {
      throw new AppError('Guide not found', 404);
    }

    const lang = (req.query.lang as string) || 'en';
    res.json({
      ...guide,
      title: guide.title[lang] || guide.title['en'] || Object.values(guide.title)[0],
      content: guide.content[lang] || guide.content['en'] || Object.values(guide.content)[0],
    });
  } catch (error) {
    next(error);
  }
};
