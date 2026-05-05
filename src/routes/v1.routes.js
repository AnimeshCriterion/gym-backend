const { Router } = require('express');

const router = Router();

router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/platform', require('../modules/platform/platform.routes'));
router.use('/organizations', require('../modules/organization/organization.routes'));
router.use('/branches', require('../modules/branches/branches.routes'));
router.use('/users', require('../modules/users/users.routes'));
router.use('/plans', require('../modules/plans/plans.routes'));
router.use('/subscriptions', require('../modules/subscriptions/subscriptions.routes'));
router.use('/attendance', require('../modules/attendance/attendance.routes'));
router.use('/payments', require('../modules/payments/payments.routes'));

module.exports = router;
