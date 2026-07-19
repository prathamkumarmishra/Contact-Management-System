const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner userId is required']
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    alternativePhone: {
      type: String,
      default: '',
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    company: {
      type: String,
      default: '',
      trim: true
    },
    designation: {
      type: String,
      default: '',
      trim: true
    },
    department: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      enum: ['personal', 'work', 'family', 'friend', 'other'],
      default: 'personal'
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    city: {
      type: String,
      default: '',
      trim: true
    },
    state: {
      type: String,
      default: '',
      trim: true
    },
    country: {
      type: String,
      default: '',
      trim: true
    },
    zipCode: {
      type: String,
      default: '',
      trim: true
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    linkedin: {
      type: String,
      default: '',
      trim: true
    },
    birthday: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    tags: {
      type: [String],
      default: []
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    lastContacted: {
      type: Date,
      default: null
    },
    contactCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast querying
contactSchema.index({ userId: 1, isDeleted: 1 });
contactSchema.index({ userId: 1, isFavorite: 1 });
contactSchema.index({ userId: 1, company: 1 });
contactSchema.index({ userId: 1, city: 1 });
contactSchema.index({ userId: 1, category: 1 });

// Text Index for fallback text searching
contactSchema.index(
  {
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    company: 'text',
    phone: 'text'
  },
  {
    weights: {
      firstName: 10,
      lastName: 10,
      email: 5,
      company: 3,
      phone: 2
    },
    name: 'ContactTextSearchIndex'
  }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
