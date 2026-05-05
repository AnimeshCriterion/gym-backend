const cron = require('node-cron');
const subscriptionsService = require('./subscriptions.service');

const startAutoRenewalJob = () => {
  cron.schedule('5 0 * * *', async () => {
    console.log('[CRON] Starting daily subscription job...');
    try {
      const unfrozen = await subscriptionsService.processAutoUnfreeze();
      if (unfrozen > 0) console.log(`[CRON] Auto-unfrozen ${unfrozen} subscription(s)`);

      const renewed = await subscriptionsService.processAutoRenewals();
      if (renewed > 0) console.log(`[CRON] Auto-renewed ${renewed} subscription(s)`);
    } catch (err) {
      console.error('[CRON] Daily subscription job failed:', err.message);
    }
  });

  console.log('[CRON] Subscription job scheduled — runs daily at 00:05');
};

module.exports = { startAutoRenewalJob };
