const { z } = require('zod');

const createOrgSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const updateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createOrgSchema, updateOrgSchema };
