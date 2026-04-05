import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  phone: string;
  email?: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'admin';
  reputation: number;
  reportsCount: number;
  preferredLanguage: string;
  alertSettings: {
    pushEnabled: boolean;
    smsEnabled: boolean;
    categories: string[];
    radiusKm: number;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  otp?: {
    code: string;
    expiresAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    name: { type: String, trim: true, maxlength: 100 },
    avatar: { type: String },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    reputation: { type: Number, default: 0 },
    reportsCount: { type: Number, default: 0 },
    preferredLanguage: { type: String, default: 'en' },
    alertSettings: {
      pushEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
      categories: { type: [String], default: ['animal', 'crime', 'accident', 'environmental'] },
      radiusKm: { type: Number, default: 5, min: 1, max: 50 },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ location: '2dsphere' });
UserSchema.index({ phone: 1 }, { unique: true });

export default mongoose.model<IUser>('User', UserSchema);
