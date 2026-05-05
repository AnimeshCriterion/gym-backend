const { Router } = require('express');
const controller = require('./platform.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');

const router = Router();

// Public — anyone can view available plans
router.get('/plans', controller.getPlans);

// Protected — org admin only
router.get('/status', authenticate, authorize('ORG_ADMIN'), controller.getStatus);
router.post('/subscribe', authenticate, authorize('ORG_ADMIN'), controller.subscribe);

module.exports = router;
