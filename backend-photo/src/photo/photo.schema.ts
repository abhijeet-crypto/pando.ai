import { Schema } from 'mongoose';

export const PhotoSchema = new Schema({
  url: String,
  albumId: { type: Schema.Types.ObjectId, ref: 'Album' },
  email: String,
  isDeleted: { type: Boolean, default: false },
  title: String,
  tags: String,
  description: String,
  isFav: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});
