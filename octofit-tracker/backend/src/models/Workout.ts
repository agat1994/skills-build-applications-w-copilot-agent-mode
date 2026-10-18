import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  focus: { type: String, required: [true, 'Focus is required'], trim: true },
  minutes: { type: Number, required: [true, 'Minutes is required'], min: 1 },
  difficulty: { type: String, required: [true, 'Difficulty is required'], trim: true },
});

export const Workout = model('Workout', workoutSchema);
