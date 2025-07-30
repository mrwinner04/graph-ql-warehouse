import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error.errors) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      } else {
        throw new BadRequestException({
          message: 'Validation failed',
          error: error.message,
        });
      }
    }
  }
}
