import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UrlDocument = Url & Document;

@Schema({
  timestamps: true,
  collection: 'urls',
})
export class Url {
  @Prop({ required: true, unique: true, index: true })
  shortCode: string;

  @Prop({ required: true })
  originalUrl: string;

  @Prop({ default: 0 })
  visits: number;

  @Prop({ type: Date, expires: 365 * 24 * 60 * 60 }) // TTL index for 1 year
  createdAt: Date;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
