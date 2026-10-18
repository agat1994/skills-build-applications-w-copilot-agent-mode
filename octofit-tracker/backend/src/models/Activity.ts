import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User is required'] },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: [true, 'Team is required'] },
  type: { type: String, required: [true, 'Activity type is required'], trim: true },
  minutes: { type: Number, required: [true, 'Minutes is required'], min: [0, 'Minutes must be non-negative'] },
  points: { type: Number, required: [true, 'Points is required'], min: [0, 'Points must be non-negative'] },
  occurredAt: { type: Date, required: [true, 'Occurrence date is required'] },
});

export const Activity = model('Activity', activitySchema);
