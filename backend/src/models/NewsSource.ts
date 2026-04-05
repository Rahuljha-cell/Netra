import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INewsSource extends Document {
  _id: Types.ObjectId;
  name: string;
  rssUrl: string;
  language: string;
  region: string[];
  lastScraped?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSourceSchema = new Schema<INewsSource>(
  {
    name: { type: String, required: true, trim: true },
    rssUrl: { type: String, required: true, unique: true },
    language: { type: String, required: true, default: 'en' },
    region: { type: [String], default: [] },
    lastScraped: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

NewsSourceSchema.index({ isActive: 1, language: 1 });

export default mongoose.model<INewsSource>('NewsSource', NewsSourceSchema);
