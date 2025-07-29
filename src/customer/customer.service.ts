import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { OrderEntity } from '../order/order.entity';
import { CustomerResponse } from './dto/customer.response';
import { validateCompanyAccess } from '../common/company-access.utils';

interface CreateCustomerData {
  name: string;
  email?: string;
  type?: string;
  companyId: string;
  modifiedBy?: string;
}

interface UpdateCustomerData {
  name?: string;
  email?: string;
  type?: string;
  modifiedBy?: string;
}

function toCustomerResponse(customer: CustomerEntity): CustomerResponse {
  return {
    id: customer.id,
    companyId: customer.companyId,
    name: customer.name,
    email: customer.email,
    type: customer.type,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    deletedAt: customer.deletedAt,
    modifiedBy: customer.modifiedBy,
  };
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  // Find all customers in a company
  async findAll(companyId: string): Promise<CustomerResponse[]> {
    const customers = await this.customerRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return customers.map(toCustomerResponse);
  }

  // Find customer by ID with company access validation
  async findOne(id: string, companyId: string): Promise<CustomerResponse> {
    const customer = await validateCompanyAccess(
      () =>
        this.customerRepository.findOne({
          where: { id },
        }),
      companyId,
      'Customer',
    );

    return toCustomerResponse(customer);
  }

  // Find customer by ID (for internal use)
  async findById(id: string): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  // Create new customer
  async create(data: CreateCustomerData): Promise<CustomerResponse> {
    // Check if customer with email already exists (if email provided)
    if (data.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: data.email, companyId: data.companyId },
      });
      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    // Create customer
    const customer = this.customerRepository.create({
      name: data.name.trim(),
      email: data.email?.toLowerCase().trim(),
      type: data.type?.trim(),
      companyId: data.companyId,
      modifiedBy: data.modifiedBy,
    });

    const savedCustomer = await this.customerRepository.save(customer);
    return toCustomerResponse(savedCustomer);
  }

  // Update customer with company access validation
  async update(
    id: string,
    data: UpdateCustomerData,
    companyId: string,
  ): Promise<CustomerResponse> {
    // Check if customer exists and has access
    await this.findOne(id, companyId);

    // Check if email is being changed and if it already exists
    if (data.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: data.email, companyId },
      });
      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    // Update customer
    await this.customerRepository.update(
      { id, companyId },
      {
        ...(data.name && { name: data.name.trim() }),
        ...(data.email && { email: data.email.toLowerCase().trim() }),
        ...(data.type && { type: data.type.trim() }),
        ...(data.modifiedBy && { modifiedBy: data.modifiedBy }),
      },
    );

    return this.findOne(id, companyId);
  }

  // Delete customer with company access validation
  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);
    await this.customerRepository.softDelete({ id, companyId });
  }

  // Find orders by customer ID (for field resolver)
  async findOrdersByCustomerId(customerId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }
}
