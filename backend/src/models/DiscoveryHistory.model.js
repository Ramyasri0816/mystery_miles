import mongoose from 'mongoose';

const discoveryHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: true,
      index: true
    },
    matchScore: {
      type: Number,
      required: true
    },
    scoreBreakdown: {
      interestsScore: { type: Number, required: true },
      budgetScore: { type: Number, required: true },
      durationScore: { type: Number, required: true },
      travelStyleScore: { type: Number, required: true }
    },
    matchingReasons: [{ type: String }],
    costEstimate: {
      estimatedDailyCostINR: { type: Number },
      totalEstimatedCostINR: { type: Number },
      userBudgetINR: { type: Number },
      savingsRemainingINR: { type: Number },
      currency: { type: String, default: 'INR' }
    },
    searchCriteria: {
      budgetINR: { type: Number },
      availableDays: { type: Number },
      durationValue: { type: Number },
      durationUnit: { type: String, enum: ['days', 'hours'], default: 'days' },
      startingLocation: { type: String, default: '' },
      travelStyle: { type: String, default: '' },
      interests: [{ type: String }]
    },
    topTierCandidatesCount: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

discoveryHistorySchema.index({ user: 1, createdAt: -1 });

discoveryHistorySchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const DiscoveryHistory = mongoose.model('DiscoveryHistory', discoveryHistorySchema);
export default DiscoveryHistory;
