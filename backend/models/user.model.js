const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', CounterSchema);

const UserSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_]+$/.test(v);
      },
      message: () => 'Username must not contain spaces or special characters (only letters, numbers, and underscores)'
    }
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Enforces valid email strictly ending in @gmail.com (or @enterprise.com for internal enterprise admin)
        return /^[a-zA-Z0-9._%+-]+@(gmail\.com|enterprise\.com)$/i.test(v);
      },
      message: () => 'Email address must strictly end with @gmail.com (e.g., yourname@gmail.com)'
    }
  },
  date_of_birth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(v) {
        if (!v) return false;
        const dob = new Date(v);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age >= 16;
      },
      message: () => 'User must be at least 16 years old to register'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'locked'],
    default: 'active'
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  }
});

// Pre-save hook to auto-increment the ID
UserSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'userId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Counter
};
