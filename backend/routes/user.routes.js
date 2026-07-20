const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyAuth, verifyAdmin, verifySuperAdmin, attachOptionalAuth } = require('../middleware/auth.middleware');

router.post('/login', userController.loginUser);
router.post('/', userController.createUser);
router.get('/', attachOptionalAuth, userController.getAllUsers);
router.get('/:id', attachOptionalAuth, userController.getUser);
router.put('/:id/role', verifyAuth, verifySuperAdmin, userController.updateUserRole);
router.put('/:id/status', verifyAuth, verifyAdmin, userController.updateUserStatus);
router.put('/:id/password', attachOptionalAuth, userController.updateUserPassword);
router.put('/:id', attachOptionalAuth, userController.updateUser);
router.delete('/:id', verifyAuth, verifyAdmin, userController.deleteUser);

module.exports = router;
