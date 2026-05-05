const repo = require('./subscriptions.repository');
const plansRepo = require('../plans/plans.repository');
const paymentsRepo = require('../payments/payments.repository');

const notFound = () => Object.assign(new Error('Subscription not found'), { statusCode: 404 });

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const getAll = async (organizationId, filters, page, limit) => {
  const [subscriptions, total] = await repo.findAll(organizationId, filters, page, limit);
  return { subscriptions, total, page, limit };
};

const getById = async (id, organizationId) => {
  const sub = await repo.findById(id, organizationId);
  if (!sub) throw notFound();
  return sub;
};

const getMySubscriptions = (userId, organizationId) => repo.findByUserId(userId, organizationId);

const create = async (data, organizationId) => {
  const plan = await plansRepo.findById(data.planId, organizationId);
  if (!plan || !plan.isActive) {
    throw Object.assign(new Error('Plan not found or inactive'), { statusCode: 400 });
  }

  const endDate = addDays(data.startDate, plan.durationDays);

  const subscription = await repo.create({
    userId: data.userId,
    planId: data.planId,
    organizationId,
    branchId: data.branchId,
    startDate: data.startDate,
    endDate,
    autoRenew: data.autoRenew,
    notes: data.notes,
    status: 'ACTIVE',
  });

  // Create a pending payment record for this subscription
  await paymentsRepo.create({
    userId: data.userId,
    subscriptionId: subscription.id,
    organizationId,
    amount: plan.price,
    status: 'PENDING',
    method: 'CASH',
  });

  return subscription;
};

const cancel = async (id, organizationId) => {
  await getById(id, organizationId);
  return repo.update(id, { status: 'CANCELLED', autoRenew: false });
};

const freeze = async (id, freezeData, organizationId) => {
  const sub = await getById(id, organizationId);
  if (sub.status !== 'ACTIVE') {
    throw Object.assign(new Error('Only active subscriptions can be frozen'), { statusCode: 400 });
  }

  const plan = await plansRepo.findById(sub.planId, organizationId);
  const freezeDays = Math.ceil((freezeData.freezeEnd - freezeData.freezeStart) / 86400000);

  if (sub.frozenDays + freezeDays > plan.maxFreezeDays) {
    throw Object.assign(
      new Error(`Freeze limit exceeded. Max allowed: ${plan.maxFreezeDays} days, used: ${sub.frozenDays}`),
      { statusCode: 400 }
    );
  }

  return repo.update(id, {
    status: 'FROZEN',
    freezeStart: freezeData.freezeStart,
    freezeEnd: freezeData.freezeEnd,
    frozenDays: sub.frozenDays + freezeDays,
    endDate: addDays(sub.endDate, freezeDays),
  });
};

const setAutoRenew = async (id, autoRenew, organizationId) => {
  await getById(id, organizationId);
  return repo.update(id, { autoRenew });
};

const unfreeze = async (id, organizationId) => {
  const sub = await getById(id, organizationId);
  if (sub.status !== 'FROZEN') {
    throw Object.assign(new Error('Subscription is not frozen'), { statusCode: 400 });
  }
  return repo.update(id, { status: 'ACTIVE', freezeStart: null, freezeEnd: null });
};

const processAutoUnfreeze = async () => {
  const frozen = await repo.findExpiredFrozen();
  let count = 0;
  for (const sub of frozen) {
    try {
      await repo.update(sub.id, { status: 'ACTIVE', freezeStart: null, freezeEnd: null });
      count++;
    } catch (err) {
      console.error(`[AutoUnfreeze] Failed for subscription ${sub.id}:`, err.message);
    }
  }
  return count;
};

const processAutoRenewals = async () => {
  const expired = await repo.findExpiredAutoRenewable();
  let renewed = 0;

  for (const sub of expired) {
    try {
      const previousEndDate = sub.endDate;
      const newEndDate = addDays(previousEndDate, sub.plan.durationDays);

      await repo.update(sub.id, { endDate: newEndDate, status: 'ACTIVE' });
      await repo.createRenewalLog({
        subscriptionId: sub.id,
        previousEndDate,
        newEndDate,
        amount: sub.plan.price,
      });
      await paymentsRepo.create({
        userId: sub.user.id,
        subscriptionId: sub.id,
        organizationId: sub.user.organizationId,
        amount: sub.plan.price,
        status: 'PENDING',
        method: 'CASH',
      });
      renewed++;
    } catch (err) {
      console.error(`[AutoRenew] Failed for subscription ${sub.id}:`, err.message);
    }
  }

  return renewed;
};

module.exports = { getAll, getById, getMySubscriptions, create, cancel, freeze, unfreeze, setAutoRenew, processAutoRenewals, processAutoUnfreeze };
