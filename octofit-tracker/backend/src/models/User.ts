import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
  },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  fitnessGoal: { type: String, required: [true, 'Fitness goal is required'], trim: true },
});

export const User = model('User', userSchema);
