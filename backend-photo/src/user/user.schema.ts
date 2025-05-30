
import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
