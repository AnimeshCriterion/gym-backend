require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const bcrypt = require('bcrypt');

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding demo data...\n');

  // ── 1. Organization (7-day trial from now) ───────────────────────────────
  const trialExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const org = await prisma.organization.upsert({
    where: { slug: 'fitzone-gym' },
    update: {},
    create: {
      name: 'FitZone Gym',
      slug: 'fitzone-gym',
      email: 'admin@fitzone.com',
      phone: '9800000000',
      address: '123 Main Street, Mumbai',
      platformPlan: 'TRIAL',
      platformExpiresAt: trialExpiry,
    },
  });
  console.log(`✔  Organization : ${org.name} (Trial ends: ${trialExpiry.toDateString()})`);

  // ── 2. Branch ────────────────────────────────────────────────────────────
  const branch = await prisma.branch.upsert({
    where: { id: 'seed-branch-01' },
    update: {},
    create: {
      id: 'seed-branch-01',
      name: 'FitZone — Main Branch',
      address: '123 Main Street, Mumbai',
      phone: '9800000001',
      email: 'main@fitzone.com',
      organizationId: org.id,
    },
  });
  console.log(`✔  Branch       : ${branch.name}`);

  // ── 3. Org Admin ─────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'gymadmin@fitzone.com' },
    update: {},
    create: {
      name: 'Gym Admin',
      email: 'gymadmin@fitzone.com',
      phone: '9800000002',
      passwordHash: adminHash,
      role: 'ORG_ADMIN',
      organizationId: org.id,
      branchId: branch.id,
    },
  });
  console.log(`✔  Admin        : ${admin.email}  /  password: admin@123`);

  // ── 4. Membership Plan ───────────────────────────────────────────────────
  const plan = await prisma.plan.upsert({
    where: { id: 'seed-plan-01' },
    update: {},
    create: {
      id: 'seed-plan-01',
      name: 'Monthly Basic',
      description: 'Full gym access for 30 days',
      price: 999,
      billingCycle: 'MONTHLY',
      durationDays: 30,
      maxFreezeDays: 5,
      features: JSON.stringify(['Gym access', 'Locker', 'Basic equipment']),
      organizationId: org.id,
    },
  });
  console.log(`✔  Plan         : ${plan.name} — ₹${plan.price}/month`);

  // ── 5. Member WITH active subscription ───────────────────────────────────
  const memberHash = await bcrypt.hash('member@123', 12);

  const memberWithSub = await prisma.user.upsert({
    where: { email: 'john@fitzone.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@fitzone.com',
      phone: '9800000003',
      passwordHash: memberHash,
      role: 'MEMBER',
      organizationId: org.id,
      branchId: branch.id,
      gender: 'Male',
      dateOfBirth: new Date('1995-06-15'),
    },
  });

  const startDate = new Date();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const sub = await prisma.subscription.upsert({
    where: { id: 'seed-sub-01' },
    update: {},
    create: {
      id: 'seed-sub-01',
      userId: memberWithSub.id,
      planId: plan.id,
      organizationId: org.id,
      branchId: branch.id,
      status: 'ACTIVE',
      startDate,
      endDate,
      autoRenew: true,
    },
  });

  await prisma.payment.upsert({
    where: { id: 'seed-pay-01' },
    update: {},
    create: {
      id: 'seed-pay-01',
      userId: memberWithSub.id,
      subscriptionId: sub.id,
      organizationId: org.id,
      amount: plan.price,
      status: 'COMPLETED',
      method: 'CASH',
      paidAt: new Date(),
    },
  });

  console.log(`✔  Member (sub) : ${memberWithSub.email}  /  password: member@123  — Active sub until ${endDate.toDateString()}`);

  // ── 6. Member WITHOUT subscription ───────────────────────────────────────
  const memberNoSub = await prisma.user.upsert({
    where: { email: 'jane@fitzone.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@fitzone.com',
      phone: '9800000004',
      passwordHash: memberHash,
      role: 'MEMBER',
      organizationId: org.id,
      branchId: branch.id,
      gender: 'Female',
      dateOfBirth: new Date('1998-03-22'),
    },
  });
  console.log(`✔  Member (no sub): ${memberNoSub.email}  /  password: member@123  — No subscription`);

  console.log('\n✅ Seed complete!\n');
  console.log('──────────────────────────────────────────────');
  console.log('  Login credentials');
  console.log('──────────────────────────────────────────────');
  console.log(`  Gym Admin  :  gymadmin@fitzone.com  /  admin@123`);
  console.log(`  Member 1   :  john@fitzone.com      /  member@123  (has subscription)`);
  console.log(`  Member 2   :  jane@fitzone.com      /  member@123  (no subscription)`);
  console.log('──────────────────────────────────────────────');
  console.log(`  Platform trial expires: ${trialExpiry.toDateString()}`);
  console.log('──────────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
