const { Router } = require('express');
const controller = require('./users.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');

const router = Router();
router.use(authenticate);

router.get('/', authorize('ORG_ADMIN', 'BRANCH_MANAGER', 'TRAINER'), controller.getAll);
router.get('/:id', authorize('ORG_ADMIN', 'BRANCH_MANAGER', 'TRAINER'), controller.getById);
router.post('/', authorize('ORG_ADMIN', 'BRANCH_MANAGER'), controller.create);
router.put('/:id', authorize('ORG_ADMIN', 'BRANCH_MANAGER'), controller.update);
router.delete('/:id', authorize('ORG_ADMIN'), controller.remove);

module.exports = router;
