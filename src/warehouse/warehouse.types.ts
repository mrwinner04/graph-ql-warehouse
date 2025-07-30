import { z } from 'zod';

export const WarehouseBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Warehouse name is required')
    .max(100, 'Warehouse name too long'),
  address: z.string().max(200, 'Address too long').optional(),
  type: z.enum(['solid', 'liquid']).optional(),
});

export const CreateWarehouseSchema = WarehouseBaseSchema.extend({
  companyId: z.uuid('Invalid company ID'),
});

export const UpdateWarehouseSchema = WarehouseBaseSchema.partial();
