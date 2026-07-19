const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner userId is required'],
      index: true
    },
    query: {
      type: String,
      required: [true, 'Search query is required'],
      trim: true
    },
    resultCount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: '30d' } // Automatically delete records after 30 days
    }
  }
);

// Compound index for query lookups
searchHistorySchema.index({ userId: 1, createdAt: -1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = SearchHistory;
