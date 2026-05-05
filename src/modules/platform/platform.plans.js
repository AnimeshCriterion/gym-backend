const PLATFORM_PLANS = {
  TRIAL: {
    key: 'TRIAL',
    name: 'Free Trial',
    price: 0,
    durationDays: 7,
    maxBranches: 1,
    maxMembers: 50,
    features: [
      'Up to 1 branch',
      'Up to 50 members',
      'Attendance tracking',
      'Member management',
      'Membership plans',
    ],
  },
  BASIC: {
    key: 'BASIC',
    name: 'Basic',
    price: 999,
    durationDays: 30,
    maxBranches: 2,
    maxMembers: 500,
    features: [
      'Up to 2 branches',
      'Up to 500 members',
      'All Trial features',
      'Payment tracking',
      'Revenue reports',
      'Subscription management',
    ],
  },
  PRO: {
    key: 'PRO',
    name: 'Pro',
    price: 2999,
    durationDays: 30,
    maxBranches: null,
    maxMembers: null,
    features: [
      'Unlimited branches',
      'Unlimited members',
      'All Basic features',
      'Priority support',
      'Advanced analytics',
    ],
  },
};

module.exports = { PLATFORM_PLANS };
