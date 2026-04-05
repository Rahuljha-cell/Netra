import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGuide extends Document {
  _id: Types.ObjectId;
  title: Record<string, string>; // { en: "...", hi: "...", ta: "..." }
  content: Record<string, string>;
  category: 'animal' | 'crime' | 'accident' | 'environmental' | 'general';
  region: string[];
  incidentCount: number;
  seasonalWarnings: {
    months: number[];
    warning: Record<string, string>;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GuideSchema = new Schema<IGuide>(
  {
    title: { type: Schema.Types.Mixed, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    category: {
      type: String,
      required: true,
      enum: ['animal', 'crime', 'accident', 'environmental', 'general'],
    },
    region: { type: [String], default: [] },
    incidentCount: { type: Number, default: 0 },
    seasonalWarnings: [
      {
        months: [Number],
        warning: Schema.Types.Mixed,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

GuideSchema.index({ category: 1, isActive: 1 });
GuideSchema.index({ region: 1 });

export default mongoose.model<IGuide>('Guide', GuideSchema);
