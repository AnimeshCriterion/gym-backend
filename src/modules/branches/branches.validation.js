const { z } = require('zod');

const createBranchSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

const updateBranchSchema = createBranchSchema.partial().extend({ isActive: z.boolean().optional() });

module.exports = { createBranchSchema, updateBranchSchema };
