const { z } = require('zod');

const createPlanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  billingCycle: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']).default('MONTHLY'),
  durationDays: z.number().int().positive(),
  maxFreezeDays: z.number().int().min(0).default(0),
  features: z.array(z.string()).optional(),
  branchId: z.string().optional(),
});

const updatePlanSchema = createPlanSchema.partial().extend({ isActive: z.boolean().optional() });

module.exports = { createPlanSchema, updatePlanSchema };
