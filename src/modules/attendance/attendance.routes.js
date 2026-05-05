const { Router } = require('express');
const controller = require('./attendance.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { requireActivePlatform } = require('../../common/middleware/platform.middleware');

const router = Router();
router.use(authenticate);
router.use(requireActivePlatform);

router.get('/my', controller.getMyHistory);
router.post('/check-in', controller.checkIn);
router.post('/check-out', controller.checkOut);
router.get('/', authorize('ORG_ADMIN', 'BRANCH_MANAGER', 'TRAINER'), controller.getAll);

module.exports = router;
