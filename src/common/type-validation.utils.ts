import { BadRequestException } from '@nestjs/common';
import { ProductType } from '../product/product.entity';
import { WarehouseType } from '../warehouse/warehouse.entity';

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
