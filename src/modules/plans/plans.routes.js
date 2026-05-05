const { Router } = require('express');
const controller = require('./plans.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { requireActivePlatform } = require('../../common/middleware/platform.middleware');

const router = Router();
router.use(authenticate);
router.use(requireActivePlatform);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize('ORG_ADMIN'), controller.create);
router.put('/:id', authorize('ORG_ADMIN'), controller.update);
router.delete('/:id', authorize('ORG_ADMIN'), controller.remove);

module.exports = router;
