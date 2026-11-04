import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for review'],
      index: true
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination is required for review'],
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: ''
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [5, 'Review comment must be at least 5 characters'],
      maxlength: [2000, 'Review comment cannot exceed 2000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Enforce one review per user per destination
reviewSchema.index({ user: 1, destination: 1 }, { unique: true });

// Static method to recalculate destination average rating
reviewSchema.statics.calculateAverageRating = async function (destinationId) {
  const stats = await this.aggregate([
    { $match: { destination: new mongoose.Types.ObjectId(destinationId) } },
    {
      $group: {
        _id: '$destination',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const Destination = mongoose.model('Destination');

  if (stats.length > 0) {
    await Destination.findByIdAndUpdate(destinationId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
  } else {
    await Destination.findByIdAndUpdate(destinationId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
};

// Recalculate on save
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.destination);
});

// Recalculate after delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.destination);
  }
});

reviewSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
