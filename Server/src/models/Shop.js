const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: [true, 'Please provide a shop name'],
      trim: true,
      minlength: [3, 'Shop name must be at least 3 characters'],
      maxlength: [100, 'Shop name must not exceed 100 characters']
    },
    ownerName: {
      type: String,
      required: [true, 'Please provide owner name'],
      trim: true,
      minlength: [2, 'Owner name must be at least 2 characters'],
      maxlength: [50, 'Owner name must not exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
    },
    address: {
      street: {
        type: String,
        required: [true, 'Please provide street address'],
        minlength: [5, 'Street must be at least 5 characters']
      },
      city: {
        type: String,
        required: [true, 'Please provide city'],
        minlength: [2, 'City must be at least 2 characters']
      },
      state: {
        type: String,
        required: [true, 'Please provide state'],
        minlength: [2, 'State must be at least 2 characters']
      },
      zipCode: {
        type: String,
        required: [true, 'Please provide zip code'],
        match: [/^\d{5,6}$/, 'Please provide a valid zip code']
      },
      country: {
        type: String,
        required: [true, 'Please provide country'],
        default: 'India'
      }
    },
    type: {
      type: String,
      enum: {
        values: ['general', 'medical', 'electronics', 'clothing', 'groceries', 'other'],
        message: 'Please select a valid shop type'
      },
      default: 'general'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalProducts: {
      type: Number,
      default: 0
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide owner ID']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
shopSchema.index({ email: 1 });
shopSchema.index({ ownerId: 1 });
shopSchema.index({ type: 1 });
shopSchema.index({ isActive: 1 });
shopSchema.index({ shopName: 'text' });
shopSchema.index({ rating: -1 });
shopSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Shop', shopSchema);
