const { Router } = require('express');
const controller = require('./payments.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');

const router = Router();
router.use(authenticate);
router.use(authorize('ORG_ADMIN', 'BRANCH_MANAGER'));

router.get('/revenue-summary', controller.getRevenueSummary);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
