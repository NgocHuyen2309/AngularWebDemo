const { User } = require('../models/user.model');

exports.verifyAuth = async (req, res, next) => {
  try {
    const requesterId = req.headers['x-requester-id'] || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    if (!requesterId) {
      return res.status(401).json({ error: 'Authentication required. Missing requester credentials.' });
    }
    const user = await User.findOne({ id: Number(requesterId) });
    if (!user) {
      return res.status(401).json({ error: 'Requester account not found.' });
    }
    if (user.status === 'locked') {
      return res.status(403).json({ error: 'Your account has been locked.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication middleware error: ' + err.message });
  }
};

exports.verifyAdmin = async (req, res, next) => {
  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
};

exports.verifySuperAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Access denied. Super Administrator privileges required.' });
  }
  next();
};

exports.attachOptionalAuth = async (req, res, next) => {
  try {
    const requesterId = req.headers['x-requester-id'] || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    if (requesterId && !isNaN(Number(requesterId))) {
      req.user = await User.findOne({ id: Number(requesterId) });
    }
  } catch (e) {
    // ignore
  }
  next();
};
