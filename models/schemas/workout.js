const mongoose = require('mongoose');

const Metric = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true
  },
  _id: false
});

const Set = mongoose.Schema({
  reps: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  note: {
    type: String,
    required: false
  },
  isPR: {
    type: Boolean,
    required: true,
  },
  _id: false,
});

const ExerciseSet = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: [Set],
    required: true
  },
  note: {
    type: String,
    required: false,
  },
  metric: {
    type: Metric,
    required: true,
  },
});

const workoutSchema = mongoose.Schema({
  date_completed: {
    type: Date,
    default: Date.now,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  exercises: {
    type: [ExerciseSet],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  metrics: {
    type: [Metric],
    required: true,
  },
  isTemplate: {
    type: Boolean,
    default: false,
  }
});

module.exports = workoutSchema;