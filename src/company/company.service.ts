import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from './company.entity';
import { UserEntity } from '../user/user.entity';
import { ProductEntity } from '../product/product.entity';
import { OrderEntity } from '../order/order.entity';
import { CustomerEntity } from '../customer/customer.entity';
import { InvoiceEntity } from '../invoice/invoice.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
  ) {}

  async findUsersByCompanyId(companyId: string): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findProductsByCompanyId(companyId: string): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOrdersByCompanyId(companyId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findCustomersByCompanyId(companyId: string): Promise<CustomerEntity[]> {
    return this.customerRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findInvoicesByCompanyId(companyId: string): Promise<InvoiceEntity[]> {
    return this.invoiceRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  // CRUD operations
  async findAll(): Promise<CompanyEntity[]> {
    return this.companyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<CompanyEntity> {
    const company = await this.companyRepository.findOne({
      where: { id },
    });
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }

  async update(
    id: string,
    updateData: Partial<CompanyEntity>,
  ): Promise<CompanyEntity> {
    await this.companyRepository.update(id, updateData);
    return this.findById(id);
  }
}
