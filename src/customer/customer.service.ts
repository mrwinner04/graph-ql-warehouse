import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { OrderEntity } from '../order/order.entity';
import { UserRole } from '../common/types';
import { CustomerResponse } from './dto/customer.response';
import { validateCompanyAccess } from '../common/company-access.utils';
import { toCustomerResponse } from '../common/entity-transformers';
import {
  validateCustomerEmailNotExists,
  validateCustomerNameNotExists,
  deleteEntityByRole,
} from '../common/common.utils';

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
      await validateCustomerEmailNotExists(
        this.customerRepository,
        data.email,
        data.companyId,
      );
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
      await validateCustomerEmailNotExists(
        this.customerRepository,
        data.email,
        companyId,
        id,
      );
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
  async remove(
    id: string,
    companyId: string,
    userRole: UserRole,
  ): Promise<void> {
    await this.findOne(id, companyId);
    await deleteEntityByRole(
      this.customerRepository,
      { id, companyId },
      userRole,
      'Customer',
    );
  }

  // Find orders by customer ID (for field resolver)
  async findOrdersByCustomerId(customerId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }
}
