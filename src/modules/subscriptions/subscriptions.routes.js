const { Router } = require('express');
const controller = require('./subscriptions.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');

const router = Router();
router.use(authenticate);

// Member-accessible
router.get('/my', controller.getMySubscriptions);

// Staff-accessible
router.get('/', authorize('ORG_ADMIN', 'BRANCH_MANAGER'), controller.getAll);
router.get('/:id', authorize('ORG_ADMIN', 'BRANCH_MANAGER', 'TRAINER'), controller.getById);
router.post('/', authorize('ORG_ADMIN', 'BRANCH_MANAGER'), controller.create);
router.patch('/:id/cancel', authorize('ORG_ADMIN', 'BRANCH_MANAGER'), controller.cancel);
router.patch('/:id/freeze', authorize('ORG_ADMIN', 'BRANCH_MANAGER'), controller.freeze);
router.patch('/:id/unfreeze', authorize('ORG_ADMIN', 'BRANCH_MANAGER'), controller.unfreeze);
router.patch('/:id/auto-renew', authorize('ORG_ADMIN', 'BRANCH_MANAGER'), controller.setAutoRenew);

module.exports = router;
