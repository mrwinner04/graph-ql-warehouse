import { z } from 'zod';

export const InvoiceBaseSchema = z.object({
  orderId: z.uuid('Invalid order ID'),
  number: z.string().max(50, 'Invoice number too long').optional(),
  date: z.date().optional(),
  status: z.enum(['pending', 'paid', 'cancelled', 'overdue']).optional(),
});

export const CreateInvoiceSchema = InvoiceBaseSchema.extend({
  companyId: z.uuid('Invalid company ID'),
});

export const UpdateInvoiceSchema = InvoiceBaseSchema.partial();
