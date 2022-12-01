const mongoose = require('mongoose');

const Set = mongoose.Schema({
  reps: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  metric: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  note: {
    type: String,
    required: false
  }
});

const ExerciseSet = mongoose.Schema({
  exerciseName: {
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
  measurementMetric: {
    type: String,
    required: false,
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
  }
});

const Workout = mongoose.model('workouts', workoutSchema);

module.exports = Workout;