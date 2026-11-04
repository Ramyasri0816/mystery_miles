import mongoose from 'mongoose';

const savedTripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination reference is required'],
      index: true
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
      trim: true
    },
    visitedStatus: {
      type: String,
      enum: ['planned', 'visited'],
      default: 'planned',
      index: true
    },
    targetDate: {
      type: Date,
      default: null
    },
    targetBudget: {
      type: Number,
      min: [0, 'Target budget must be positive'],
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate saved trips for the same user and destination
savedTripSchema.index({ user: 1, destination: 1 }, { unique: true });

savedTripSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const SavedTrip = mongoose.model('SavedTrip', savedTripSchema);
export default SavedTrip;
