const { User } = require('../models/user.model');

// Helper to validate email
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Helper to validate date
function isValidDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

exports.createUser = async (req, res) => {
  try {
    const { email, date_of_birth } = req.body;
    
    if (!email || !date_of_birth) {
      return res.status(400).json({ error: 'Email and date_of_birth are required' });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!isValidDate(date_of_birth) || !(new Date(date_of_birth) < new Date())) {
      return res.status(400).json({ error: 'Invalid date_of_birth format' });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const newUser = new User({ email, date_of_birth: new Date(date_of_birth) });
    await newUser.save();
    
    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      date_of_birth: newUser.date_of_birth.toISOString()
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ id: 1 });
    return res.status(200).json(
      users.map(u => ({
        id: u.id,
        email: u.email,
        date_of_birth: u.date_of_birth ? u.date_of_birth.toISOString() : null
      }))
    );
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      date_of_birth: user.date_of_birth.toISOString()
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { email, date_of_birth } = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      // Check duplicate
      const duplicate = await User.findOne({ email, id: { $ne: userId } });
      if (duplicate) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      user.email = email;
    }

    if (date_of_birth !== undefined) {
      if (!isValidDate(date_of_birth) || !(new Date(date_of_birth) < new Date())) {
        return res.status(400).json({ error: 'Invalid date_of_birth format' });
      }
      user.date_of_birth = new Date(date_of_birth);
    }

    await user.save();

    return res.status(200).json({
      id: user.id,
      email: user.email,
      date_of_birth: user.date_of_birth.toISOString()
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findOneAndDelete({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
