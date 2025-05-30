import { Schema } from 'mongoose';

export const AlbumSchema = new Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  email: String,
});
