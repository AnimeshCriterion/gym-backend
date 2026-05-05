const { Router } = require('express');
const controller = require('./auth.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { loginLimiter } = require('../../common/middleware/rate-limit.middleware');

const router = Router();

router.post('/register', controller.registerOrganization);
router.post('/login', loginLimiter, controller.login);
router.post('/refresh', controller.refreshToken);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);
router.put('/me', authenticate, controller.updateProfile);
router.post('/change-password', authenticate, controller.changePassword);

module.exports = router;
