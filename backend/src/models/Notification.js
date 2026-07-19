const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'contact_created',
        'contact_updated',
        'contact_deleted',
        'contact_restored',
        'import_complete',
        'duplicate_detected',
        'birthday_reminder',
        'system'
      ]
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: 200
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: 500
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: '30d' } // Auto-delete after 30 days
    }
  }
);

// Compound index for fetching user notifications sorted by time
notificationSchema.index({ userId: 1, createdAt: -1 });
// Compound index for unread count queries
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
