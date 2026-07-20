const { User } = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Helper to validate email strictly requiring ending with @gmail.com (or @enterprise.com)
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@(gmail\.com|enterprise\.com)$/i.test(email.trim());
}

// Helper to validate username
function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  return /^[a-zA-Z0-9_]+$/.test(username.trim());
}

// Helper to validate date
function isValidDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

// Helper to validate age gate >= 16
function isValidAgeGate(dateStr) {
  if (!isValidDate(dateStr)) return false;
  const dob = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 16;
}

exports.seedAdminUser = async () => {
  try {
    const hashedAdminPassword = await bcrypt.hash('12345', 10);
    const existingAdmin = await User.findOne({ email: 'admin@enterprise.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        username: 'adminne',
        email: 'admin@enterprise.com',
        password: hashedAdminPassword,
        date_of_birth: new Date('1990-01-01'),
        role: 'super_admin',
        status: 'active'
      });
      await adminUser.save();
      console.log('Seeded initial enterprise super admin account: admin@enterprise.com (Role: super_admin, Password: ***)');
    } else {
      let changed = false;
      if (!existingAdmin.password) {
        existingAdmin.password = hashedAdminPassword;
        changed = true;
      }
      if (!existingAdmin.username) {
        existingAdmin.username = 'adminne';
        changed = true;
      }
      if (existingAdmin.role !== 'super_admin') {
        existingAdmin.role = 'super_admin';
        changed = true;
      }
      if (!existingAdmin.status) {
        existingAdmin.status = 'active';
        changed = true;
      }
      if (changed) {
        await existingAdmin.save();
        console.log('Updated existing admin@enterprise.com account to super_admin role.');
      }
    }
  } catch (err) {
    console.error('Error seeding admin account:', err.message);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ error: 'Username or Email is required for login' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required for login' });
    }

    const trimmedIdentifier = identifier.trim();
    const user = await User.findOne({
      $or: [
        { email: trimmedIdentifier },
        { username: trimmedIdentifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password. Account not found.' });
    }

    if (user.status === 'locked') {
      return res.status(403).json({ error: 'Your account has been locked by an administrator. Please contact support.' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Account has no password configured. Please reset or register again.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      date_of_birth: user.date_of_birth ? user.date_of_birth.toISOString() : null,
      role: user.role || 'user',
      status: user.status || 'active'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, confirm_password, date_of_birth, role } = req.body;
    
    if (!username || !email || !date_of_birth || !password) {
      return res.status(400).json({ error: 'Username, email, password, and date_of_birth are required' });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({ error: 'Username must not contain spaces or special characters (only letters, numbers, and underscores)' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (confirm_password !== undefined && password !== confirm_password) {
      return res.status(400).json({ error: 'Password and confirm password do not match' });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email address must strictly end with @gmail.com (e.g., yourname@gmail.com)' });
    }
    
    if (!isValidAgeGate(date_of_birth)) {
      return res.status(400).json({ error: 'User must be at least 16 years old to register' });
    }

    // Check for duplicate username
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.trim() });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      date_of_birth: new Date(date_of_birth),
      role: role && ['user', 'admin', 'super_admin'].includes(role) ? role : 'user',
      status: 'active'
    });
    await newUser.save();
    
    return res.status(201).json({
      id: newUser.id,
      username: newUser.username || newUser.email.split('@')[0],
      email: newUser.email,
      date_of_birth: newUser.date_of_birth.toISOString(),
      role: newUser.role,
      status: newUser.status || 'active'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    return res.status(400).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ id: 1 });
    return res.status(200).json(
      users.map(u => ({
        id: u.id,
        username: u.username || u.email.split('@')[0],
        email: u.email,
        date_of_birth: u.date_of_birth ? u.date_of_birth.toISOString() : null,
        role: u.role || 'user',
        status: u.status || 'active'
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
      username: user.username || user.email.split('@')[0],
      email: user.email,
      date_of_birth: user.date_of_birth ? user.date_of_birth.toISOString() : null,
      role: user.role || 'user',
      status: user.status || 'active'
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

    const { username, email, password, date_of_birth, role } = req.body;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username !== undefined && typeof username === 'string') {
      const trimmedUsername = username.trim();
      if (trimmedUsername !== '') {
        if (!isValidUsername(trimmedUsername)) {
          return res.status(400).json({ error: 'Username must not contain spaces or special characters (only letters, numbers, and underscores)' });
        }
        const duplicateUsername = await User.findOne({ username: trimmedUsername, id: { $ne: userId } });
        if (duplicateUsername) {
          return res.status(409).json({ error: 'Username already exists' });
        }
        user.username = trimmedUsername;
      }
    }

    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Email address must strictly end with @gmail.com (e.g., yourname@gmail.com)' });
      }
      // Check duplicate
      const duplicate = await User.findOne({ email: email.trim(), id: { $ne: userId } });
      if (duplicate) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      user.email = email.trim();
    }

    if (password !== undefined && password !== '') {
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    if (date_of_birth !== undefined && date_of_birth !== '') {
      if (!isValidAgeGate(date_of_birth)) {
        return res.status(400).json({ error: 'User must be at least 16 years old to register' });
      }
      user.date_of_birth = new Date(date_of_birth);
    }

    if (role !== undefined && ['user', 'admin', 'super_admin'].includes(role)) {
      if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Access denied. Only Super Administrator can change user roles.' });
      }
      user.role = role;
    }

    if (['admin', 'super_admin'].includes(user.role) && (!req.user || req.user.role !== 'super_admin')) {
      if (!req.user || Number(req.user.id) !== Number(user.id)) {
        return res.status(403).json({ error: 'Access denied. Regular administrators cannot modify other admin or super admin accounts.' });
      }
    }

    await user.save();

    return res.status(200).json({
      id: user.id,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      date_of_birth: user.date_of_birth.toISOString(),
      role: user.role || 'user',
      status: user.status || 'active'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    return res.status(400).json({ error: error.message });
  }
};

exports.updateUserPassword = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || typeof current_password !== 'string') {
      return res.status(400).json({ error: 'Current password is required to verify your identity.' });
    }

    if (!new_password || typeof new_password !== 'string' || new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    if (confirm_password !== undefined && new_password !== confirm_password) {
      return res.status(400).json({ error: 'New password and confirmation do not match.' });
    }

    if (current_password === new_password) {
      return res.status(400).json({ error: 'New password cannot be the same as the current password.' });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'Account has no existing password configured.' });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const isSameAsOldHash = await bcrypt.compare(new_password, user.password);
    if (isSameAsOldHash) {
      return res.status(400).json({ error: 'New password cannot be the same as the current password.' });
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
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

    const targetUser = await User.findOne({ id: userId });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (['admin', 'super_admin'].includes(targetUser.role) && (!req.user || req.user.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Access denied. Regular administrators cannot delete admin or super admin accounts.' });
    }

    await User.findOneAndDelete({ id: userId });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const { role } = req.body;
    if (!role || !['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified. Must be user, admin, or super_admin.' });
    }
    const targetUser = await User.findOne({ id: userId });
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }
    targetUser.role = role;
    await targetUser.save();
    return res.status(200).json({
      id: targetUser.id,
      username: targetUser.username || targetUser.email.split('@')[0],
      email: targetUser.email,
      date_of_birth: targetUser.date_of_birth.toISOString(),
      role: targetUser.role,
      status: targetUser.status || 'active'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const { status } = req.body;
    if (!status || !['active', 'locked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status specified. Must be active or locked.' });
    }
    const targetUser = await User.findOne({ id: userId });
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }
    if (['admin', 'super_admin'].includes(targetUser.role) && (!req.user || req.user.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Regular administrators cannot lock or unlock admin accounts.' });
    }
    targetUser.status = status;
    await targetUser.save();
    return res.status(200).json({
      id: targetUser.id,
      username: targetUser.username || targetUser.email.split('@')[0],
      email: targetUser.email,
      date_of_birth: targetUser.date_of_birth.toISOString(),
      role: targetUser.role,
      status: targetUser.status
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
