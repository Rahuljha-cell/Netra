import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IIncident extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: 'animal' | 'crime' | 'women_safety' | 'personal_safety' | 'accident' | 'environmental';
  subCategory: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  address: {
    street?: string;
    area?: string;
    city: string;
    state: string;
    pincode?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'user' | 'news' | 'government' | 'sensor' | 'gdelt';
  media: {
    url: string;
    type: 'image' | 'video' | 'audio';
    publicId?: string;
  }[];
  aiValidation: {
    isValid: boolean;
    confidence: number;
    tags: string[];
    validatedAt?: Date;
  };
  riskScore: number;
  status: 'pending' | 'verified' | 'resolved' | 'rejected';
  upvotes: number;
  downvotes: number;
  votedBy: {
    userId: Types.ObjectId;
    vote: 'up' | 'down';
  }[];
  reportedBy?: Types.ObjectId;
  sourceUrl?: string;
  sourceName?: string;
  sourcePublishedAt?: Date;
  imageUrl?: string;
  imageThumbnail?: string;
  imageSource?: 'og_image' | 'google_thumbnail' | 'gdelt' | 'cloudinary' | 'placeholder';
  specificType?: string;
  aiConfidence?: number;
  urlHash?: string;
  titleHash?: string;
  viewCount: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new Schema<IIncident>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      required: true,
      enum: ['animal', 'crime', 'women_safety', 'personal_safety', 'accident', 'environmental'],
    },
    subCategory: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) =>
            v.length === 2 &&
            v[0] >= -180 && v[0] <= 180 &&
            v[1] >= -90 && v[1] <= 90,
          message: 'Coordinates must be [longitude, latitude] within valid ranges',
        },
      },
    },
    address: {
      street: String,
      area: String,
      city: { type: String, required: true },
      state: { type: String, default: '' },
      pincode: String,
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    source: {
      type: String,
      required: true,
      enum: ['user', 'news', 'government', 'sensor', 'gdelt'],
      default: 'user',
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video', 'audio'], required: true },
        publicId: String,
      },
    ],
    sourceUrl: { type: String, trim: true },
    sourceName: { type: String, trim: true },
    sourcePublishedAt: { type: Date },
    imageUrl: { type: String, trim: true },
    imageThumbnail: { type: String, trim: true },
    imageSource: {
      type: String,
      enum: ['og_image', 'google_thumbnail', 'gdelt', 'cloudinary', 'placeholder'],
    },
    specificType: { type: String, trim: true },
    aiConfidence: { type: Number, min: 0, max: 1 },
    urlHash: { type: String, trim: true },
    titleHash: { type: String, trim: true },
    viewCount: { type: Number, default: 0 },
    aiValidation: {
      isValid: { type: Boolean, default: false },
      confidence: { type: Number, default: 0, min: 0, max: 1 },
      tags: [String],
      validatedAt: Date,
    },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['pending', 'verified', 'resolved', 'rejected'],
      default: 'pending',
    },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    votedBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vote: { type: String, enum: ['up', 'down'], required: true },
      },
    ],
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location queries
IncidentSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
IncidentSchema.index({ category: 1, status: 1, createdAt: -1 });
IncidentSchema.index({ severity: 1, status: 1 });
IncidentSchema.index({ reportedBy: 1, createdAt: -1 });
IncidentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
IncidentSchema.index({ urlHash: 1 }, { unique: true, sparse: true });
IncidentSchema.index({ source: 1, createdAt: -1 });
IncidentSchema.index({ 'address.city': 1, category: 1, createdAt: -1 });

export default mongoose.model<IIncident>('Incident', IncidentSchema);
