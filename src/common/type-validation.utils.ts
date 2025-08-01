import { BadRequestException } from '@nestjs/common';
import { ProductType } from '../product/product.entity';
import { WarehouseType } from '../warehouse/warehouse.entity';
import { EntityManager } from 'typeorm';

export function validateProductWarehouseCompatibility(
  productType: ProductType,
  warehouseType: WarehouseType,
): void {
  if (productType.toString() !== warehouseType.toString()) {
    throw new BadRequestException(
      `Product type '${productType}' is not compatible with warehouse type '${warehouseType}'. ` +
        `Solid products can only be stored in solid warehouses, and liquid products can only be stored in liquid warehouses. `,
    );
  }
}

export function validateMultipleProductsWarehouseCompatibility(
  productTypes: ProductType[],
  warehouseType: WarehouseType,
): void {
  const incompatibleProducts = productTypes.filter(
    (productType) => productType.toString() !== warehouseType.toString(),
  );

  if (incompatibleProducts.length > 0) {
    const uniqueIncompatibleTypes = [...new Set(incompatibleProducts)];
    throw new BadRequestException(
      `The following product types are not compatible with warehouse type '${warehouseType}': ${uniqueIncompatibleTypes.join(
        ', ',
      )}. ` +
        `All products in an order must be compatible with the warehouse type.`,
    );
  }
}

export async function validateWarehouseTypeChange(
  manager: EntityManager,
  warehouseId: string,
  newType: WarehouseType,
): Promise<void> {
  const incompatibleProducts = await manager
    .createQueryBuilder()
    .select('p.id', 'productId')
    .addSelect('p.name', 'productName')
    .addSelect('p.type', 'productType')
    .addSelect('SUM(oi.quantity)', 'totalQuantity')
    .from('warehouses', 'w')
    .innerJoin('orders', 'o', 'o.warehouse_id = w.id')
    .innerJoin('order_items', 'oi', 'oi.order_id = o.id')
    .innerJoin('products', 'p', 'p.id = oi.product_id')
    .where('w.id = :warehouseId', { warehouseId })
    .andWhere('p.type != :newType', { newType })
    .andWhere('o.deleted_at IS NULL')
    .andWhere('oi.deleted_at IS NULL')
    .andWhere('p.deleted_at IS NULL')
    .groupBy('p.id, p.name, p.type')
    .getRawMany();

  if (incompatibleProducts.length > 0) {
    const productList = incompatibleProducts
      .map((p: any) => `${p.productName} (${p.productType})`)
      .join(', ');
    throw new BadRequestException(
      `Cannot change warehouse type to '${newType}' because it contains incompatible products: ${productList}. ` +
        `Please remove or transfer these products before changing the warehouse type.`,
    );
  }
}
