const { Router } = require('express');
const controller = require('./organization.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { requireActivePlatform } = require('../../common/middleware/platform.middleware');

const router = Router();
router.use(authenticate);
router.use(requireActivePlatform);

router.get('/', authorize('SUPER_ADMIN'), controller.getAll);
router.get('/:id', authorize('SUPER_ADMIN', 'ORG_ADMIN'), controller.getById);
router.post('/', authorize('SUPER_ADMIN'), controller.create);
router.put('/:id', authorize('SUPER_ADMIN'), controller.update);
router.delete('/:id', authorize('SUPER_ADMIN'), controller.remove);

module.exports = router;
