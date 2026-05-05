const { z } = require('zod');

const createPaymentSchema = z.object({
  userId: z.string().min(1),
  subscriptionId: z.string().optional(),
  amount: z.number().positive(),
  method: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'ONLINE']).default('CASH'),
  notes: z.string().optional(),
  transactionId: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
  transactionId: z.string().optional(),
  paidAt: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
});

module.exports = { createPaymentSchema, updateStatusSchema };
