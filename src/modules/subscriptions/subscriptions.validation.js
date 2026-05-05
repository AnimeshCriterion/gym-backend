const { z } = require('zod');

const createSubscriptionSchema = z.object({
  userId: z.string().min(1),
  planId: z.string().min(1),
  branchId: z.string().optional(),
  startDate: z.string().transform((s) => new Date(s)),
  autoRenew: z.boolean().default(true),
  notes: z.string().optional(),
});

const freezeSchema = z.object({
  freezeStart: z.string().transform((s) => new Date(s)),
  freezeEnd: z.string().transform((s) => new Date(s)),
}).refine((d) => d.freezeEnd > d.freezeStart, { message: 'freezeEnd must be after freezeStart' });

const updateAutoRenewSchema = z.object({
  autoRenew: z.boolean(),
});

module.exports = { createSubscriptionSchema, freezeSchema, updateAutoRenewSchema };
