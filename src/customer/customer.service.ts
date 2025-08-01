import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { CustomerResponse, ClientWithMostOrders } from './customer.types';
import { OrderEntity } from '../order/order.entity';
import { UserRole } from '../common/types';
import {
  validateFieldNotExistsInCompany,
  deleteEntityByRole,
} from '../common/common.utils';
import { transformEntity } from '../common/entity-transformers';
import { validateCompanyAccess } from '../common/company-access.utils';
import { CustomerType } from './customer.entity';

interface CreateCustomerData {
  name: string;
  email?: string;
  type: CustomerType;
  companyId: string;
  modifiedBy?: string;
}

interface UpdateCustomerData {
  name?: string;
  email?: string;
  type?: CustomerType;
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

  async findAll(companyId: string): Promise<CustomerResponse[]> {
    const customers = await this.customerRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return customers.map(
      (customer) => transformEntity(customer) as CustomerResponse,
    );
  }

  async findOne(id: string, companyId: string): Promise<CustomerResponse> {
    const customer = await validateCompanyAccess(
      () =>
        this.customerRepository.findOne({
          where: { id },
        }),
      companyId,
      'Customer',
    );

    return transformEntity(customer) as CustomerResponse;
  }

  async findById(id: string): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async create(data: CreateCustomerData): Promise<CustomerResponse> {
    if (data.email) {
      await validateFieldNotExistsInCompany(
        this.customerRepository,
        'email',
        data.email,
        data.companyId,
        'Customer',
        undefined,
        (value) => value.toLowerCase().trim(),
      );
    }

    const customer = this.customerRepository.create({
      name: data.name.trim(),
      email: data.email?.toLowerCase().trim(),
      type: data.type,
      companyId: data.companyId,
      modifiedBy: data.modifiedBy,
    });

    const savedCustomer = await this.customerRepository.save(customer);
    return transformEntity(savedCustomer) as CustomerResponse;
  }

  async update(
    id: string,
    data: UpdateCustomerData,
    companyId: string,
  ): Promise<CustomerResponse> {
    await this.findOne(id, companyId);

    if (data.email) {
      await validateFieldNotExistsInCompany(
        this.customerRepository,
        'email',
        data.email,
        companyId,
        'Customer',
        id,
        (value) => value.toLowerCase().trim(),
      );
    }

    await this.customerRepository.update(
      { id, companyId },
      {
        ...(data.name && { name: data.name.trim() }),
        ...(data.email && { email: data.email.toLowerCase().trim() }),
        ...(data.type && { type: data.type }),
        ...(data.modifiedBy && { modifiedBy: data.modifiedBy }),
      },
    );

    return this.findOne(id, companyId);
  }

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

  async findOrdersByCustomerId(customerId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getClientWithMostOrders(
    companyId: string,
  ): Promise<ClientWithMostOrders | undefined> {
    return this.customerRepository.manager
      .createQueryBuilder()
      .select('customer.id', 'customerId')
      .addSelect('customer.name', 'customerName')
      .addSelect('COUNT(order.id)', 'orderCount')
      .from('customers', 'customer')
      .innerJoin(
        'orders',
        'order',
        'order.customer_id = customer.id AND order.deleted_at IS NULL',
      )
      .where('customer.company_id = :companyId', { companyId })
      .andWhere('customer.deleted_at IS NULL')
      .andWhere('order.company_id = :companyId', { companyId })
      .groupBy('customer.id')
      .addGroupBy('customer.name')
      .orderBy('"orderCount"', 'DESC')
      .limit(1)
      .getRawOne<ClientWithMostOrders>();
  }
}
