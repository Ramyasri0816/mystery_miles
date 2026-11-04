import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      unique: true,
      trim: true,
      index: true
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    tagline: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Hill Station',
        'Beach',
        'Heritage',
        'Spiritual',
        'Wildlife',
        'Adventure',
        'Nature',
        'Desert',
        'Cultural',
        'Island'
      ],
      index: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      index: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    budgetTier: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury'],
      required: [true, 'Budget tier is required'],
      index: true
    },
    estimatedDailyCostINR: {
      type: Number,
      required: [true, 'Estimated daily cost in INR is required'],
      min: [0, 'Daily cost must be positive']
    },
    estimatedDailyCostUSD: {
      type: Number,
      default: function () {
        return Math.round(this.estimatedDailyCostINR / 85);
      }
    },
    minDurationDays: {
      type: Number,
      default: 2,
      min: 1
    },
    maxDurationDays: {
      type: Number,
      default: 7,
      min: 1
    },
    travelStyles: [
      {
        type: String,
        enum: ['solo', 'couple', 'family', 'adventure', 'relaxation', 'backpacker', 'luxury', 'cultural', 'spiritual', 'wildlife', 'nature', 'photography', 'history']
      }
    ],
    bestSeasons: [
      {
        type: String,
        enum: ['Winter', 'Summer', 'Monsoon', 'Autumn', 'Spring', 'Year-round']
      }
    ],
    interests: [
      {
        type: String,
        enum: [
          'nature',
          'culture',
          'adventure',
          'food',
          'relaxation',
          'beach',
          'mountain',
          'wildlife',
          'spiritual',
          'history',
          'architecture',
          'nightlife',
          'photography',
          'music'
        ]
      }
    ],
    highlights: [{ type: String, trim: true }],
    imageUrl: { type: String, trim: true },
    imageUrls: [{ type: String, trim: true }],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Slug generator and image fallback hook
destinationSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  if (!this.imageUrl && this.imageUrls && this.imageUrls.length > 0) {
    this.imageUrl = this.imageUrls[0];
  }
  if (!this.imageUrls || this.imageUrls.length === 0) {
    if (this.imageUrl) {
      this.imageUrls = [this.imageUrl];
    }
  }
  if (!this.estimatedDailyCostUSD && this.estimatedDailyCostINR) {
    this.estimatedDailyCostUSD = Math.round(this.estimatedDailyCostINR / 85);
  }
  next();
});

// Full-text search index
destinationSchema.index({
  name: 'text',
  tagline: 'text',
  description: 'text',
  state: 'text',
  category: 'text'
});

// Compound indexes for optimal filtering and sorting
destinationSchema.index({ state: 1, category: 1 });
destinationSchema.index({ budgetTier: 1, estimatedDailyCostINR: 1 });
destinationSchema.index({ category: 1, averageRating: -1 });

destinationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
